'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('test', function() {
  return gulp.src('./test/index.js').pipe(mocha({ reporter: 'spec' }));
});

