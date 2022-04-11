const { src, dest, watch, series, parallel } = require('gulp'),
  browserSync = require('browser-sync').create(),
  uglify = require('gulp-uglify'),
  gulpif = require('gulp-if'),
  scss = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  imagemin = require('gulp-imagemin'),
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
        baseDir: "./app"
      }
  });

	watch(['app/scss/**/*.scss'], styles);
  watch(['app/templates/**/*.pug'], html);
	watch('app/scripts/**/*.js', scripts);
  watch('app/images/**/*').on('change', browserSync.reload);
}

function styles() {
  var plugins = [
    autoprefixer()
  ];

  if (isProd) {
    plugins.push(cssnano());
  }

  return src('app/scss/**/*.scss')
    .pipe(gulpif(isDev, sourcemaps.init()))
    .pipe(plumber({
        errorHandler: notify.onError(function(err) {
            return {
                title: 'scss',
                message: err.message
            };
        })
    }))
    .pipe(postcss(plugins))
    .pipe(gulpif(isDev, sourcemaps.write()))
    .pipe(gulpif(isDev, dest('app/styles/'), dest('dist/styles/')))
    .pipe(browserSync.reload({stream: true}));
}

function scripts() {
  fs.truncate('app/scripts/bundle.min.js', 0, function() {
    console.log('bundle.min.js removed');
  });

  return src("app/scripts/**/*.js")
    .pipe(order([
      "vendor/jquery/jquery.min.js",
      "vendor/**/*.js",
      "app/**/template.js",
      "app/**/*.js"
    ]))
    .pipe(concat("bundle.min.js"))
    .pipe(dest("app/js"))
    .pipe(browserSync.reload({stream: true}));
}

function html() {
  return src('app/templates/views/*.pug')
       .pipe(plumber({
           errorHandler: notify.onError(function(err) {
               return {
                   title: 'Pug',
                   message: err.message
               };
           })
       }))
      .pipe(data(function(file) {
            return JSON.parse(fs.readFileSync('app/templates/data/data.json'));
        }))
      .pipe(pug({
        "pretty": isDev /* for desable html minify*/
      }))
      .pipe(gulpif(isDev, dest('app/'), dest('dist/')))
      .pipe(browserSync.reload({stream: true}));
}

function moveScripts() {
  return src('app/js/**/*.js')
  .pipe(uglify())
  .pipe(dest('dist/js/'));
}

function moveImages() {
  return src('app/images/**/*')
  .pipe(imagemin())
  .pipe(dest('dist/images/'));
}

function moveFonts() {
  return src('app/fonts/**/*')
  .pipe(dest('dist/fonts/'));
}

let serve = series(parallel(styles, html, scripts), initServer);
let dist = parallel(styles, html, moveScripts, moveImages, moveFonts)

exports.serve = serve;
exports.dist = dist;