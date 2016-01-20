/*!
 * stringcolor
 * Generate a consistent color from any string.
 *
 * Source:
 * https://github.com/erming/stringcolor
 *
 * Version 0.2.0
 */
(function($) {
	/**
	 * Generate hex color code from a string.
	 *
	 * @param {String} string
	 */
	$.stringcolor = function(string) {
		return "#" + stringcolor(string);
	};

	/**
	 * Set one or more CSS properties for the set of matched elements.
	 *
	 * @param {String|Array} property
	 * @param {String} string
	 */
	$.fn.stringcolor = function(property, string) {
		if (!property || !string) {
			throw new Error("$(selector).string_to_color() takes 2 arguments");
		}
		return this.each(function() {
			var props = [].concat(property);
			var $this = $(this);
			$.map(props, function(p) {
				$this.css(p, $.stringcolor(string));
			});
		});
	};
})(jQuery);

/*!
 * Name: string_to_color
 * Author: Brandon Corbin [code@icorbin.com]
 * Website: http://icorbin.com
 */
function string_to_color(str) {
	// Generate a Hash for the String
	var hash = function(word) {
		var h = 0;
		for (var i = 0; i < word.length; i++) {
			h = word.charCodeAt(i) + ((h << 5) - h);
		}
		return h;
	};

	// Convert int to base 16
	var int_to_base16 = function (i) {
		// Also exclude 0, 1, 14, and 15. (White, black, light grey, and dark grey in some order)
		return 2 + Math.abs(i%12);
	};

	return int_to_base16(hash(str))
}

var cache = {};
function stringcolor(str) {
	return cache[str] = cache[str] || string_to_color(str);
}
