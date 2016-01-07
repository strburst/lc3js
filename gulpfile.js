var eslint = require('gulp-eslint');
var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
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

gulp.task('test', function() {
  return gulp.src('test/*.js', { read: false })
    // nyan is the only reporter that doesn't mix test output with other gulp messages
    .pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('default', ['compile-parser', 'lint', 'test']);
