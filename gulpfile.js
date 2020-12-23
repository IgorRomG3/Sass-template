var gulp = require('gulp'),
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

gulp.task('browser-sync', ['sass', 'pug'], function() {
    browserSync.init({
        server: {
            baseDir: "./app"
        }
    });
});

gulp.task('sass', function () {
  var plugins = [
    autoprefixer()
  ];

  if (isProd) {
    plugins.push(cssnano());
  }

  return gulp.src('app/sass/**/*.sass')
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
    .pipe(gulp.dest('app/css/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('pug', function() {
  return gulp.src('app/templates/views/*.pug')
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
      .pipe(gulp.dest('app/'))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('validateHtml', function() {
  return gulp.src('app/*.html')
         .pipe(htmlValidator())
         .pipe(browserSync.reload({stream: true}));
});

gulp.task('default', function () {
  gulp.start('browser-sync', 'sass');
	gulp.watch(['app/sass/**/*.sass'], ['sass']);
  gulp.watch('app/*.html', ['validateHtml']);
  gulp.watch(['app/templates/**/*.pug'], ['pug']);
	gulp.watch('app/js/**/*.js', browserSync.reload);
  gulp.watch('app/img/**/*', browserSync.reload);
});
