"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const glob = require("glob");
const gulp = require("gulp");
const concat = require("gulp-concat");
const consolidate = require("gulp-consolidate");
const iconfont = require("gulp-iconfont");
const rename = require("gulp-rename");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const replaceExt = require("replace-ext");
const through = require("through2");
const bs = require("browser-sync").create();
const _ = require("lodash");
const { options } = require("./options");
const { name: packageName } = require("./package.json");

function relativeCWDPath(subPath) {
  return path.resolve(process.cwd(), subPath);
}

function appendSlashIfNeeded(path) {
  path = relativeCWDPath(path);
  return path.endsWith("/") ? path : path + "/";
}

function pathWithSourceDir(path) {
  return appendSlashIfNeeded(options.sourceDir) + path;
}

function pathWithDistDir(path) {
  return appendSlashIfNeeded(options.distDir) + path;
}

function pathWithTemplatesDir(path) {
  return appendSlashIfNeeded(`node_modules/${packageName}/templates`) + path;
}

const svgs = pathWithSourceDir("**/*.svg");
const templates = pathWithTemplatesDir("**/*.{js,css,html}");
const template = "fontawesome-style";
const timestamp = Math.round(Date.now() / 1000);

function calcHash(files) {
  const hash = crypto.createHash("md5");
  files.forEach(file => {
    hash.update(fs.readFileSync(file, "utf8"));
  });
  return hash.digest("hex");
}

function buildBase64font(opts) {
  gulp
    .src(pathWithDistDir("fonts/*.woff"))
    .pipe(pipeFontBase64Data(opts))
    .pipe(rename({ basename: `${options.fontName}-base64` }))
    .pipe(gulp.dest(pathWithDistDir("styles/")));
}

function pipeFontBase64Data(opts) {
  return through.obj(function (file, enc, callback) {
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isBuffer()) {
      const base64 = file.contents.toString("base64");
      const fontfaceBuffer = fs.readFileSync(pathWithTemplatesDir(`${template}-fontface64.css`));
      const cssBuffer = fs.readFileSync(pathWithTemplatesDir(`${template}.css`));
      const contents = Buffer.concat([fontfaceBuffer, cssBuffer], fontfaceBuffer.length + cssBuffer.length);
      const compiled = _.template(contents.toString())(Object.assign({ base64 }, opts));
      file.contents = Buffer.from(compiled);
      file.path = replaceExt(file.path, ".css");
      return callback(null, file);
    } else {
      return callback();
    }
  });
}

function pipeSvgSpriteData() {
  return through.obj(function (file, enc, callback) {
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isBuffer()) {
      const svgSprite = file.contents.toString().replace(/<defs>[\s\S]+<\/defs>/, "");
      const tmpJs = fs.readFileSync(pathWithTemplatesDir(`${template}.js`)).toString();
      file.contents = Buffer.from(tmpJs.replace("${svgSprite}", svgSprite));
      file.path = replaceExt(file.path, ".js");
      return callback(null, file);
    } else {
      return callback();
    }
  });
}

function start() {
  return gulp.series("build", () => {
    bs.init({
      files: pathWithDistDir("*.html"),
      server: pathWithDistDir(""),
      startPath: "/preview_fontclass.html",
      middleware: cacheControl,
      port: options.port
    });
    gulp.watch([svgs, templates], gulp.series("build"));
  });
}

function build() {
  return gulp.series("svgstore", () => {
    return gulp
      .src(svgs)
      .pipe(
        iconfont({
          fontName: options.fontName,
          formats: ["ttf", "eot", "woff", "svg"],
          normalize: true,
          fontHeight: 10000,
          timestamp,
          log: () => {
            //
          }
        })
      )
      .on("glyphs", function (glyphs) {
        const opts = {
          className: options.className,
          classPrefix: options.classPrefix,
          fontName: options.fontName,
          timestamp,
          hash: calcHash(glob.sync(svgs)),
          fontPath: "../fonts/",
          glyphs: glyphs.map(mapGlyphs)
        };

        gulp
          .src([pathWithTemplatesDir(`${template}-fontface.css`), pathWithTemplatesDir(`${template}.css`)])
          .pipe(consolidate("lodash", opts))
          .pipe(concat(`${options.fontName}.css`))
          .pipe(gulp.dest(pathWithDistDir("styles/")));

        gulp.src(pathWithTemplatesDir("demo.css")).pipe(gulp.dest(pathWithDistDir("styles")));

        gulp
          .src(pathWithTemplatesDir(`${template}.html`))
          .pipe(consolidate("lodash", opts))
          .pipe(rename({ basename: "preview_fontclass" }))
          .pipe(gulp.dest(pathWithDistDir("")));

        gulp
          .src(pathWithTemplatesDir(`${template}-symbol.html`))
          .pipe(consolidate("lodash", opts))
          .pipe(rename({ basename: "preview_symbol" }))
          .pipe(gulp.dest(pathWithDistDir("")));

        this.on("end", () => {
          setTimeout(buildBase64font.bind(this, opts), 100);
        });
      })
      .pipe(gulp.dest(pathWithDistDir("fonts/")));
  });
}

function svgstoreTask() {
  return () => {
    return gulp
      .src(svgs)
      .pipe(
        svgmin(file => {
          const prefix = path.basename(file.relative, path.extname(file.relative));
          return {
            plugins: [
              {
                cleanupIDs: {
                  prefix: `${prefix}-`,
                  minify: true
                }
              }
            ]
          };
        })
      )
      .pipe(svgstore())
      .pipe(pipeSvgSpriteData())
      .pipe(rename({ basename: options.fontName }))
      .pipe(gulp.dest(pathWithDistDir("icons/")));
  };
}

function mapGlyphs(glyph) {
  return { name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0) };
}

function cacheControl(req, res, next) {
  res.setHeader("Cache-control", "no-store");
  next();
}

gulp.task("svgstore", svgstoreTask());

gulp.task("build", build());

gulp.task("start", start());
