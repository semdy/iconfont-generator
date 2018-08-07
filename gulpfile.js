const gulp = require('gulp')
const rename = require('gulp-rename')
const iconfont = require('gulp-iconfont')
const cssfont64 = require('gulp-cssfont64')
const consolidate = require('gulp-consolidate')
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const crypto = require('crypto')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const bs = require('browser-sync').create()

const svgs = 'assets/icons/**/*.svg'
const fontName = 'iconfont'
const className = 'iconfont'
const classPrefix = 'icon-'
const template = 'fontawesome-style'
const timestamp = Math.round(Date.now() / 1000)

const calcHash = function(files) {
	let hash = crypto.createHash('md5')
	files.forEach(function(file) {
		hash.update(fs.readFileSync(file, 'utf8'))
	})
	return hash.digest('hex')
}

gulp.task('build', () =>
  gulp.src(svgs)
    .pipe(iconfont({
      fontName,
      formats: ['ttf', 'eot', 'woff', 'svg'],
      fixedWidth: true,
      centerHorizontally: true,
      normalize: true,
      fontHeight: 200,
      timestamp,
      log: () => {}
    }))
    .on('glyphs', (glyphs) => {
      const options = {
        className,
        classPrefix,
        fontName,
        timestamp,
        hash: calcHash(glob.sync(svgs)),
        fontPath: '../fonts/',
        glyphs: glyphs.map(mapGlyphs)
      }
      gulp.src(`templates/${template}.css`)
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename: fontName }))
        .pipe(gulp.dest('dist/assets/styles/'))

      gulp.src(`templates/${template}.html`)
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename: 'sample' }))
        .pipe(gulp.dest('dist/'))

      gulp.src('dist/assets/fonts/*.woff')
        .pipe(cssfont64())
        .pipe(gulp.dest('dist/assets/style/'))
    })
    .pipe(gulp.dest('dist/assets/fonts/'))
)

gulp.task('svgstore', () =>
   gulp.src(svgs)
    .pipe(svgmin(file => {
      const prefix = path.basename(file.relative, path.extname(file.relative));
      return {
        plugins: [{
          cleanupIDs: {
            prefix: prefix + '-',
            minify: true
          }
        }]
      }
    }))
    .pipe(svgstore())
    .pipe(gulp.dest('dist/assets/icons/'))
     .on('end', () => {
       const svgSprite = fs.readFileSync('dist/assets/icons/icons.svg','utf-8')
       gulp.src(`templates/${template}.js`)
         .pipe(consolidate('lodash', { svgSprite }))
         .pipe(rename({ basename: fontName }))
         .pipe(gulp.dest('dist/assets/icons/'))
     })
)

gulp.task('start', ['build'], () => {
  bs.init({
    files: 'dist/sample.html',
    server: 'dist/',
    startPath: '/sample.html',
    middleware: cacheControl
  })
  gulp.watch(svgs, ['build'])
})

function mapGlyphs (glyph) {
  return { name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0) }
}

function cacheControl (req, res, next) {
  res.setHeader('Cache-control', 'no-store')
  next()
}
