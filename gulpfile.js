var gulp = require('gulp');
var gutil = require('gulp-util');
var peg = require('gulp-peg');
var rename = require('gulp-rename');

gulp.task('compile-parser', function() {
  return gulp.src('gen-parser.peg')
    .pipe(peg().on('error', gutil.log))
    .pipe(rename('parser.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['compile-parser']);
