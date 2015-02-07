/**
 * Export the module.
 */

if (typeof module !== "undefined" && module.exports) {
  module.exports = EventEmitter;
}

/**
 * The EventEmitter class.
 *
 * @public
 */

function EventEmitter() {

  /**
   * A list of events being listened to.
   *
   * @type {Object}
   * @private
   */

  this.events = {};

}

(function() {

  /**
   * Apply functions.
   */

  EventEmitter.prototype = {
    emit: emit,
    on: on,
    off: off,
    once: once
  };

  /**
   * Emit an event.
   *
   * Events may emit an unlimited number of arguments.
   *
   * @param {String} name
   * @param {...Object|Array} [args]
   * @return {EventEmitter}
   * @public
   */

  function emit(name, args) {
    var e = this.events[name];
    if (arguments.length > 2) {
      args = Array.prototype.slice.call(arguments, 1);
    }
    if (Array.isArray(e)) {
      for (var i = 0; i < e.length; i++) {
        e[i].apply(this, args);
      }
    }
    return this;
  };

  /**
   * Listen to the events triggered by the .emit() function.
   *
   * @param {String} name
   * @param {Function} cb
   * @return {EventEmitter}
   * @public
   */

  function on(name, cb) {
    this.events[name] = this.events[name] || [];
    this.events[name].push(cb);
    return this;
  };

  /**
   * Remove event listeners for a specific event.
   *
   * @param {String} [name]
   * @param {Function} [cb]
   * @public
   */

  function off(name, cb) {
    if (!name) {
      this.events = {};
      return this;
    }
    if (!cb) {
      this.events[name] = [];
      return this;
    }
    var e = this.events[name];
    for (var i in e) {
      var fn = e[i];
      if (fn == cb) {
        e.splice(i, 1);
        break;
      }
    }
    return this;
  }

  /**
   * Add event listener that only works once.
   *
   * @param {String} name
   * @param {Function} cb
   * @return {EventEmitter}
   * @public
   */

  function once(name, cb) {
    this.on(name, fn);
    function fn() {
      this.off(name, fn);
      cb();
    };
    return this;
  }

})();
