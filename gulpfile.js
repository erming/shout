'use strict';

let childProcess = require('child_process');
let concat = require('gulp-concat');
let gulp = require('gulp');
let path = require('path');
let uglify = require('gulp-uglifyjs');

const SRC = 'client/js/libs/**/*.js';

gulp.task('uglify', function () {
    return gulp.src(SRC)
        .pipe(concat('libs.min.js'))
        .pipe(uglify({
            compress: false,
        }))
        .pipe(gulp.dest('client/dist/js/'));
});

gulp.task('build', function () {
    let handlebars = path.relative(__dirname, './node_modules/handlebars/bin/handlebars');
    let args = [
        String(handlebars),
        'client/views/',
        '-e', 'tpl',
        '-f', 'client/dist/js/shout.templates.js',
    ];

    let option = {
        cwd: path.relative(__dirname, ''),
        stdio: 'inherit',
    };
    childProcess.spawn('node', args, option);
});

gulp.task('default', ['uglify', 'build']);

gulp.task('watch', ['uglify'], function () {
    gulp.watch(SRC, ['uglify']);
});
