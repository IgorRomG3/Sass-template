const { src, dest, watch, series, parallel } = require('gulp'),
  // gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  htmlValidator = require('gulp-w3c-html-validator'),
  sass = require('gulp-sass'),
  notify = require("gulp-notify"),
  autoprefixer = require('autoprefixer'),
  plumber = require('gulp-plumber'),
  postcss = require('gulp-postcss')
  cssnano = require('cssnano'),
  pug = require('gulp-pug'),
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

	watch(['app/sass/**/*.sass'], styles);
  watch('app/*.html', htmlValidate);
  watch(['app/templates/**/*.pug'], html);
	watch('app/scripts/**/*.js',).on('change', browserSync.reload);
  watch('app/images/**/*').on('change', browserSync.reload);
}

function styles() {
  var plugins = [
    autoprefixer()
  ];

  if (isProd) {
    plugins.push(cssnano());
  }

  return src('app/sass/**/*.sass')
    .pipe(plumber({
        errorHandler: notify.onError(function(err) {
            return {
                title: 'SASS',
                message: err.message
            };
        })
    }))
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    }))
    .pipe(postcss(plugins))
    .pipe(dest('app/styles/'))
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
      .pipe(dest('app/'))
      .pipe(browserSync.reload({stream: true}));
}

function htmlValidate() {
  return src('app/*.html')
         .pipe(htmlValidator())
         .pipe(browserSync.reload({stream: true}));
}

function moveHTML() {
  return src('app/*.html')
  .pipe(dest('dist'));
}

function moveStyles() {
  return src('app/styles/**/*.css')
  .pipe(dest('dist/styles/'));
}

function moveScripts() {
  return src('app/scripts/**/*.js')
  .pipe(dest('dist/scripts/'));
}

function moveImages() {
  return src('app/images/**/*')
  .pipe(dest('dist/images/'));
}

function moveLibs() {
  return src('app/libs/**/*')
  .pipe(dest('dist/libs/'));
}

function moveFonts() {
  return src('app/fonts/**/*')
  .pipe(dest('dist/fonts/'));
}

let serve = series(parallel(styles, html, htmlValidate), initServer);
let build = parallel(moveHTML, moveStyles, moveScripts, moveImages, moveLibs, moveFonts)

exports.default = serve;
exports.build = build;