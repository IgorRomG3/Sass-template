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
  fs = require('fs'),
  babel = require("gulp-babel");

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
    .pipe(gulpif(isDev, dest('sources/css/'), dest('dist/css/')))
    .pipe(browserSync.reload({stream: true}));
}

function libsScript() {
  return src("sources/scripts/vendor/**/*.js")
    .pipe(order([
      "jquery/jquery.min.js",
      "**/*.js",
    ]))
    .pipe(concat("vendor.min.js"))
    .pipe(dest("sources/js"))
    .pipe(browserSync.reload({stream: true}));
}

function scripts() {
  return src("sources/scripts/app/**/*.js")
    .pipe(order([
      "template.js",
      "**/*.js"
    ]))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ["@babel/preset-env"]
    }))
    .pipe(concat("bundle.min.js"))
    .pipe(gulpif(isDev, sourcemaps.write()))
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

let serve = series(parallel(styles, html, libsScript, scripts), initServer);
let dist = parallel(styles, html, moveScripts, moveImages, moveFonts)

exports.serve = serve;
exports.dist = dist;