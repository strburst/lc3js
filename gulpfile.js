var gulp = require('gulp');
var peg = require('gulp-peg');
var rename = require('gulp-rename');

gulp.task("compile-parser", function() {
  return gulp.src('gen-parser.peg')
    .pipe(peg())
    .pipe(rename('parser.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['compile-parser']);
