var gulp = require('gulp');

var browserify = require('browserify');
var jasmine = require('gulp-jasmine');
var jscs = require('gulp-jscs');
var jscsStylish = require('gulp-jscs-stylish');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var source = require('vinyl-source-stream');

gulp.task('build', function () {
  var b = browserify({
    entries: './index.js',
    standalone: 'Parse'
  });

  return b.bundle()
    .pipe(source('fake-parse.js'))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('build-watch', ['build'], function () {
  var paths = [
    'index.js',
    'lib/**/*.js'
  ];
  return gulp.watch(paths, ['build']);
});

gulp.task('standards', function () {
  return gulp.src([
      'gulpfile.js',
      'index.js',
      'lib/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jscs())
    .on('error', function () {
      // Suppress jscs errors, they're rolled into the jshint reporter, below.
    })
    .pipe(jscsStylish.combineWithHintResults())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jasmine', function () {
  return gulp.src('./test/**/*.spec.js')
    .pipe(jasmine({
      verbose: true,
      includeStackTrace: true
    }));
});

gulp.task('jasmine-watch', ['jasmine'], function () {
  var paths = [
    './test/**/*.spec.js',
    './lib/**/*.js'
  ];
  return gulp.watch(paths, ['jasmine']);
});

gulp.task('test', ['standards', 'jasmine']);
