var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('build', ['css', 'js', 'imgs']);

gulp.task('watch-js', function () {
  gulp.watch('build/**/*', ['js']);
});

gulp.task('watch', function () {
  gulp.watch('build/**/*', ['js']);
});

gulp.task('js', function () {
   return gulp.src('build/js/**/*.js') // match all js files in child dirs
     .pipe(jshint())
     .pipe(jshint.reporter('default'))
     .pipe(uglify())
     .pipe(concat('sclibrary.js'))
     .pipe(gulp.dest('public/js'));
});
