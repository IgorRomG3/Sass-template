var gulp = require('gulp'),
  browserSync = require('browser-sync').create();
  includer = require('gulp-htmlincluder'),
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
            baseDir: "./build"
        }
    });
});

gulp.task('htmlIncluder', function() {
    gulp.src('dev/**/*.html')
    	.pipe(includer())
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest('build/'))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass', function () {
  var plugins = [
        autoprefixer({browsers: ['last 2 version']}),
        cssnano()
    ];
  return gulp.src('dev/scss/*.scss')
    .pipe(plumber({
        errorHandler: notify.onError(function(err) {
            return {
                title: 'SCSS',
                message: err.message
            };
        })
    }))
    .pipe(sass())
    .pipe(postcss(plugins))
    .pipe(gulp.dest('build/css/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('dev/img/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  return spriteData.pipe(gulp.dest('dev/img/sprite/'));
});

gulp.task('move', function () {
	gulp.src('dev/img/**/*.*')
	.pipe(gulp.dest('build/img/'))
  .pipe(browserSync.reload({stream: true}));

});

gulp.task('movejs', function () {
	gulp.src('dev/js/**/*.js')
  .pipe(uglify())
	.pipe(gulp.dest('build/js/'))
  .pipe(browserSync.reload({stream: true}));

});

gulp.task('default', function () {
  gulp.start('browser-sync', 'sass','htmlIncluder','move', 'movejs'),
	gulp.watch(['dev/scss/**/*.scss'], ['sass']),
	gulp.watch(['dev/**/*.html'], ['htmlIncluder']),
	gulp.watch(['dev/img/**/*.*'], ['move']),
  gulp.watch(['dev/js/**/*.js'], ['movejs']);
});
