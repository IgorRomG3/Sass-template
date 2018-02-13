var gulp = require('gulp'),
  browserSync = require('browser-sync').create();
  includer = require('gulp-htmlincluder'),
  sass = require('gulp-sass'),
  spritesmith = require('gulp.spritesmith'),
  notify = require("gulp-notify"),
  plumber = require('gulp-plumber');
//	cleanCSS = require('gulp-clean-css'),
//    htmlmin = require('gulp-htmlmin');

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
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass', function () {
  return gulp.src('dev/sass/*.sass')
    .pipe(plumber({
        errorHandler: notify.onError(function(err) {
            return {
                title: 'SASS',
                message: err.message
            };
        })
    }))
    .pipe(sass())
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
	.pipe(gulp.dest('build/js/'))
  .pipe(browserSync.reload({stream: true}));

});

// gulp.task('minify-css', function() {
//  return gulp.src('build/css/*.css')
//    .pipe(cleanCSS({compatibility: 'ie8'}))
//    .pipe(gulp.dest('build/css/*.css'));
// });

// gulp.task('minify', function() {
//  return gulp.src('build/*.html')
//    .pipe(htmlmin({collapseWhitespace: true}))
//    .pipe(gulp.dest('build'));
// });


gulp.task('default', function () {
  gulp.start('browser-sync', 'sass','htmlIncluder','move', 'movejs'),
	gulp.watch(['dev/sass/**/*.sass'], ['sass']),
	gulp.watch(['dev/**/*.html'], ['htmlIncluder']),
	gulp.watch(['dev/img/**/*.*'], ['move']),
  gulp.watch(['dev/js/**/*.js'], ['movejs']);
});
