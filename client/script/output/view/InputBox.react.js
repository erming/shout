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

import MessageActionCreator from '../action/MessageActionCreator';
import React from 'react';

let InputBox = React.createClass({

    getInitialState: function () {
        return {
            inputValue: '',
        };
    },

    render: function () {
        return (
            <form id='form'
                  action=''
                  onSubmit={this.onSubmit}>
                <div className='inner'>
                    <button id='submit'
                            type='submit'>Send</button>
                    <div className='input'>
                        <label htmlFor='input'
                               id='nick'></label>
                        <input id='input'
                               type='text'
                               className='mousetrap'
                               autoComplete='off'
                               value={this.state.inputValue}
                               onInput={this.onInput}/>
                    </div>
                </div>
            </form>
        );
    },

    /**
     *  @param  {React.SyntheticEvent}  aEvent
     *  @return {void}
     */
    onInput: function (aEvent) {
        var value = aEvent.target.value;
        this.setState({
            inputValue: value,
        });
    },

    /**
     *  @param  {React.SyntheticEvent}  aEvent
     *  @return {void}
     */
    onSubmit: function (aEvent) {
        aEvent.preventDefault();

        var value = this.state.inputValue;
        MessageActionCreator.sendMessage(value);

        this.setState({
            inputValue: '',
        });
    },
});

export default InputBox;
