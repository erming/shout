/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

let babelify = require('babelify');
let browserify = require('browserify');
let childProcess = require('child_process');
let concat = require('gulp-concat');
let gulp = require('gulp');
let path = require('path');
let source = require('vinyl-source-stream');
let uglify = require('gulp-uglifyjs');

const isRelease = process.env.NODE_ENV === 'production';

const SRC = [
    'client/js/libs/favico.js',
    'client/js/libs/handlebars.js',
    'client/js/libs/handlebars/**/*.js',
    'client/js/libs/jquery.js',
    'client/js/libs/jquery/**/*.js',
    'client/js/libs/moment.js',
    'client/js/libs/notification.js',
    'client/js/libs/socket.io.js',
    'client/js/libs/string.contains.js',
    'client/js/libs/stringcolor.js',
    'client/js/libs/uri.js',
];

gulp.task('uglify', function () {
    return gulp.src(SRC)
        .pipe(uglify('libs.min.js', {
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

gulp.task('build2', function () {
    const SRC_JS = ['./client/script/shout.js'];

    let option = {
        insertGlobals: false,
        debug: isRelease ? false : true,
    };

    let babel = babelify.configure({
        optional: [
            'utility.inlineEnvironmentVariables',
        ],
    });

    browserify(SRC_JS, option)
        .transform(babel)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('client/dist/'));
});

gulp.task('default', ['uglify', 'build']);

gulp.task('watch', ['uglify'], function () {
    gulp.watch(SRC, ['uglify']);
});
