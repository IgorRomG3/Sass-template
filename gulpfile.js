const { src, dest, watch, series, parallel } = require('gulp'),
  browserSync = require('browser-sync').create(),
  uglify = require('gulp-uglify'),
  gulpif = require('gulp-if'),
  scss = require('gulp-sass')(require('sass')),
  sourcemaps = require('gulp-sourcemaps'),
  notify = require("gulp-notify"),
  autoprefixer = require('autoprefixer'),
  plumber = require('gulp-plumber'),
  postcss = require('gulp-postcss'),
  cssnano = require('cssnano'),
  pug = require('gulp-pug'),
  order = require("gulp-order"),
  concat = require('gulp-concat'),
  data = require('gulp-data'),
  fs = require('fs');

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

function initServer() {
  browserSync.init({
    server: {
        baseDir: "./sources"
      }
  });

	watch(['sources/scss/**/*.scss'], styles);
  watch(['sources/templates/**/*.pug'], html);
	watch('sources/scripts/**/*.js', scripts);
  watch('sources/images/**/*').on('change', browserSync.reload);
}

function styles() {
  var plugins = [
    autoprefixer()
  ];

  if (isProd) {
    plugins.push(cssnano());
  }

  return src('sources/scss/**/*.scss')
    .pipe(gulpif(isDev, sourcemaps.init()))
    .pipe(plumber({
        errorHandler: notify.onError(function(err) {
            return {
                title: 'scss',
                message: err.message
            };
        })
    }))
    .pipe(scss())
    .pipe(postcss(plugins))
    .pipe(gulpif(isDev, sourcemaps.write()))
    .pipe(gulpif(isDev, dest('sources/styles/'), dest('dist/styles/')))
    .pipe(browserSync.reload({stream: true}));
}

function scripts() {
  fs.truncate('sources/scripts/bundle.min.js', 0, function() {
    console.log('bundle.min.js removed');
  });

  return src("sources/scripts/**/*.js")
    .pipe(order([
      "vendor/jquery/jquery.min.js",
      "vendor/**/*.js",
      "sources/**/template.js",
      "sources/**/*.js"
    ]))
    .pipe(concat("bundle.min.js"))
    .pipe(dest("sources/js"))
    .pipe(browserSync.reload({stream: true}));
}

function html() {
  return src('sources/templates/views/*.pug')
       .pipe(plumber({
           errorHandler: notify.onError(function(err) {
               return {
                   title: 'Pug',
                   message: err.message
               };
           })
       }))
      .pipe(data(function(file) {
            return JSON.parse(fs.readFileSync('sources/templates/data/data.json'));
        }))
      .pipe(pug({
        "pretty": true
      }))
      .pipe(gulpif(isDev, dest('sources/'), dest('dist/')))
      .pipe(browserSync.reload({stream: true}));
}

function moveScripts() {
  return src('sources/js/**/*.js')
  .pipe(uglify())
  .pipe(dest('dist/js/'));
}

function moveImages() {
  return src('sources/images/**/*')
  .pipe(dest('dist/images/'));
}

function moveFonts() {
  return src('sources/fonts/**/*')
  .pipe(dest('dist/fonts/'));
}

let serve = series(parallel(styles, html, scripts), initServer);
let dist = parallel(styles, html, moveScripts, moveImages, moveFonts)

exports.serve = serve;
exports.dist = dist;