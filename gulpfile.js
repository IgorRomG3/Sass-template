var gulp = require('gulp'),
  browserSync = require('browser-sync').create();
  sass = require('gulp-sass'),
  spritesmith = require('gulp.spritesmith'),
  notify = require("gulp-notify"),
  autoprefixer = require('autoprefixer'),
  plumber = require('gulp-plumber'),
  htmlmin = require('gulp-htmlmin'),
  uglify = require('gulp-uglify'),
  postcss = require('gulp-postcss')
  cssnano = require('cssnano'),
  pug = require('gulp-pug'),
  data = require('gulp-data'),
  fs = require('fs');

gulp.task('browser-sync', ['sass', 'pug'], function() {
    browserSync.init({
        server: {
            baseDir: "./app"
        }
    });
});

gulp.task('sass', function () {
  var plugins = [
        autoprefixer({browsers: ['last 15 versions', '> 1%', 'ie 10']}),
        cssnano()
    ];
  return gulp.src('app/scss/**/.scss')
    .pipe(plumber({
        errorHandler: notify.onError(function(err) {
            return {
                title: 'SCSS',
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
  return gulp.src('app/templates/pages/*.pug')
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
        "pretty":true /* for desable html minify*/
      }))
      .pipe(gulp.dest('app/'))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('app/img/**/*').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  return spriteData.pipe(gulp.dest('app/img/sprites/'));
});

gulp.task('default', function () {
  gulp.start('browser-sync', 'sass');
	gulp.watch(['app/scss/**/*.scss'], ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch(['app/templates/**/*.pug'], ['pug']);
	gulp.watch('app/js/**/*.js', browserSync.reload);
  gulp.watch('app/img/**/*', browserSync.reload);
});
