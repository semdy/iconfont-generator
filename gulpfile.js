const gulp = require('gulp')
const rename = require('gulp-rename')
const iconfont = require('gulp-iconfont')
const consolidate = require('gulp-consolidate')
const bs = require('browser-sync').create()

const svgs = 'assets/icons/*.svg'
const fontName = 'iconfont'
const className = 'icon'
const template = 'fontawesome-style'
const timestamp = Math.round(Date.now() / 1000)

gulp.task('build', () =>
  gulp.src(svgs)
    .pipe(iconfont({
      fontName,
      formats: ['ttf', 'eot', 'woff'],
      timestamp,
      log: () => {}
    }))
    .on('glyphs', (glyphs) => {
      const options = {
        className,
        fontName,
        timestamp,
        fontPath: '../fonts/',
        glyphs: glyphs.map(mapGlyphs)
      }
      gulp.src(`templates/${template}.css`)
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename: fontName }))
        .pipe(gulp.dest('assets/styles/'))

      gulp.src(`templates/${template}.html`)
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename: 'sample' }))
        .pipe(gulp.dest('assets/'))
    })
    .pipe(gulp.dest('assets/fonts/'))
)

gulp.task('start', ['build'], () => {
  bs.init({
    files: 'assets/sample.html',
    server: 'assets/',
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
