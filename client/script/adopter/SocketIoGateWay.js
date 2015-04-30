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

import io from 'socket.io-client';
import Rx from 'rx';

let socket = io();

export let SocketIoGateway = Object.freeze({

    /**
     *  @return {!Rx.Observable<?>}
     */
    error: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('error', (e) => {
                observer.onError(e);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<void>}
     */
    connectError: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('connect_error', () => {
                observer.onNext();
            });
        });
    },

    /**
     *  @return {!Rx.Observable<void>}
     */
    disconnect: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('disconnect', () => {
                observer.onNext();
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    auth: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('auth', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    init: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('init', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    join: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('join', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    message: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('msg', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    more: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('more', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    network: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('network', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    nickname: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('nick', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    part: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('part', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    quit: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('quit', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    toggle: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('toggle', (data) => {
                observer.onNext(data);
            });
        });
    },

    /**
     *  @return {!Rx.Observable<?>}
     */
    users: function () {
        return Rx.Observable.create(function (observer) {
            socket.on('users', (data) => {
                observer.onNext(data);
            });
        });
    },

});
