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
  cssnano = require('cssnano');

gulp.task('browser-sync', ['sass'],  function() {
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
	gulp.watch('app/js/**/*.js', browserSync.reload);
  gulp.watch('app/img/**/*', browserSync.reload);
});
