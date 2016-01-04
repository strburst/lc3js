var eslint = require('gulp-eslint');
var gulp = require('gulp');
var gutil = require('gulp-util');
var peg = require('gulp-peg');
var rename = require('gulp-rename');

gulp.task('compile-parser', function() {
  return gulp.src('genparser.peg')
    .pipe(peg().on('error', gutil.log))
    .pipe(rename('parser.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!parser.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('default', ['compile-parser', 'lint']);
