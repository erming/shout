;(function(local_setup) {

/**
 * @global
 * @namespace
 */
function emoji(){}
	/**
	 * The set of images to use for graphical emoji.
	 *
	 * @memberof emoji
	 * @type {string}
	 */
	emoji.img_set = 'apple';

	/**
	 * Configuration details for different image sets. This includes a path to a directory containing the
	 * individual images (`path`) and a URL to sprite sheets (`sheet`). All of these images can be found
	 * in the [emoji-data repository]{@link https://github.com/iamcal/emoji-data}. Using a CDN for these
	 * is not a bad idea.
	 *
	 * @memberof emoji
	 * @type {
	 */
	emoji.img_sets = {
		'apple'    : {'path' : '/emoji-data/img-apple-64/'   , 'sheet' : '/emoji-data/sheet_apple_64.png',    'mask' : 1 },
		'google'   : {'path' : '/emoji-data/img-google-64/'  , 'sheet' : '/emoji-data/sheet_google_64.png',   'mask' : 2 },
		'twitter'  : {'path' : '/emoji-data/img-twitter-64/' , 'sheet' : '/emoji-data/sheet_twitter_64.png',  'mask' : 4 },
		'emojione' : {'path' : '/emoji-data/img-emojione-64/', 'sheet' : '/emoji-data/sheet_emojione_64.png', 'mask' : 8 }
	};

	/**
	 * Use a CSS class instead of specifying a sprite or background image for
	 * the span representing the emoticon. This requires a CSS sheet with
	 * emoticon data-uris.
	 *
	 * @memberof emoji
	 * @type bool
	 * @todo document how to build the CSS stylesheet this requires.
	 */
	emoji.use_css_imgs = false;

	/**
	 * Instead of replacing emoticons with the appropriate representations,
	 * replace them with their colon string representation.
	 * @memberof emoji
	 * @type bool
	 */
	emoji.colons_mode = false;
	emoji.text_mode = false;

	/**
	 * If true, sets the "title" property on the span or image that gets
	 * inserted for the emoticon.
	 * @memberof emoji
	 * @type bool
	 */
	emoji.include_title = false;

	/**
	 * If the platform supports native emoticons, use those instead
	 * of the fallbacks.
	 * @memberof emoji
	 * @type bool
	 */
	emoji.allow_native = true;

	/**
	 * Set to true to use CSS sprites instead of individual images on 
	 * platforms that support it.
	 *
	 * @memberof emoji
	 * @type bool
	 */
	emoji.use_sheet = false;

	/**
	 *
	 * Set to true to avoid black & white native Windows emoji being used.
	 *
	 * @memberof emoji
	 * @type bool
	 */
	emoji.avoid_ms_emoji = true;

	// Keeps track of what has been initialized.
	/** @private */
	emoji.inits = {};
	emoji.map = {};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing ascii emoticons
	 * (ie. `:)`)
	 *
	 * @returns {string} A new string with all emoticons in `str`
	 * replaced by a representatation that's supported by the current
	 * environtment.
	 */
	emoji.replace_emoticons = function(str){
		emoji.init_emoticons();
		return str.replace(emoji.rx_emoticons, function(m, $1, $2){
			var val = emoji.map.emoticons[$2];
			return val ? $1+emoji.replacement(val, $2) : m;
		});
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing ascii emoticons
	 * (ie. `:)`)
	 *
	 * @returns {string} A new string with all emoticons in `str`
	 * replaced by their colon string representations (ie. `:smile:`)
	 */
	emoji.replace_emoticons_with_colons = function(str){
		emoji.init_emoticons();
		return str.replace(emoji.rx_emoticons, function(m, $1, $2){
			var val = emoji.data[emoji.map.emoticons[$2]][3][0];
			return val ? $1+':'+val+':' : m;
		});
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing colon string
	 * representations of emoticons (ie. `:smile:`)
	 *
	 * @returns {string} A new string with all colon string emoticons replaced
	 * with the appropriate representation.
	 */
	emoji.replace_colons = function(str){
		emoji.init_colons();

		return str.replace(emoji.rx_colons, function(m){
			var idx = m.substr(1, m.length-2);

			// special case - an emoji with a skintone modified
			if (idx.indexOf('::skin-tone-') > -1){

				var skin_tone = idx.substr(-1, 1);
				var skin_idx = 'skin-tone-'+skin_tone;
				var skin_val = emoji.map.colons[skin_idx];

				idx = idx.substr(0, idx.length - 13);

				var val = emoji.map.colons[idx];
				if (val){
					return emoji.replacement(val, idx, ':', {
						'idx'		: skin_val,
						'actual'	: skin_idx,
						'wrapper'	: ':'
					});
				}else{
					return ':' + idx + ':' + emoji.replacement(skin_val, skin_idx, ':');
				}
			}else{
				var val = emoji.map.colons[idx];
				return val ? emoji.replacement(val, idx, ':') : m;
			}
		});
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing unified unicode
	 * emoticons. (ie. 😄)
	 *
	 * @returns {string} A new string with all unicode emoticons replaced with
	 * the appropriate representation for the current environment.
	 */
	emoji.replace_unified = function(str){
		emoji.init_unified();
		return str.replace(emoji.rx_unified, function(m, p1, p2){
			var val = emoji.map.unified[p1];
			if (!val) return m;
			var idx = null;
			if (p2 == '\uD83C\uDFFB') idx = '1f3fb';
			if (p2 == '\uD83C\uDFFC') idx = '1f3fc';
			if (p2 == '\uD83C\uDFFD') idx = '1f3fd';
			if (p2 == '\uD83C\uDFFE') idx = '1f3fe';
			if (p2 == '\uD83C\uDFFF') idx = '1f3ff';
			if (idx){
				return emoji.replacement(val, null, null, {
					idx	: idx,
					actual	: p2,
					wrapper	: ''
				});
			}
			return emoji.replacement(val);
		});
	};

	// Does the actual replacement of a character with the appropriate
	/** @private */
	emoji.replacement = function(idx, actual, wrapper, variation){

		// for emoji with variation modifiers, set `etxra` to the standalone output for the
		// modifier (used if we can't combine the glyph) and set variation_idx to key of the
		// variation modifier (used below)
		var extra = '';
		var variation_idx = 0;
		if (typeof variation === 'object'){
			extra = emoji.replacement(variation.idx, variation.actual, variation.wrapper);
			variation_idx = idx + '-' + variation.idx;
		}

		// deal with simple modes (colons and text) first
		wrapper = wrapper || '';
		if (emoji.colons_mode) return ':'+emoji.data[idx][3][0]+':'+extra;
		var text_name = (actual) ? wrapper+actual+wrapper : emoji.data[idx][8] || wrapper+emoji.data[idx][3][0]+wrapper;
		if (emoji.text_mode) return text_name + extra;

		// native modes next.
		// for variations selectors, we just need to output them raw, which `extra` will contain.
		emoji.init_env();
		if (emoji.replace_mode == 'unified'  && emoji.allow_native && emoji.data[idx][0][0]) return emoji.data[idx][0][0] + extra;
		if (emoji.replace_mode == 'softbank' && emoji.allow_native && emoji.data[idx][1]) return emoji.data[idx][1] + extra;
		if (emoji.replace_mode == 'google'   && emoji.allow_native && emoji.data[idx][2]) return emoji.data[idx][2] + extra;

		// finally deal with image modes.
		// variation selectors are more complex here - if the image set and particular emoji supports variations, then
		// use the variation image. otherwise, return it as a separate image (already calculated in `extra`).
		// first we set up the params we'll use if we can't use a variation.
		var img = emoji.data[idx][7] || emoji.img_sets[emoji.img_set].path+idx+'.png';
		var title = emoji.include_title ? ' title="'+(actual || emoji.data[idx][3][0])+'"' : '';
		var text  = emoji.include_text  ? wrapper+(actual || emoji.data[idx][3][0])+wrapper : '';
		var px = emoji.data[idx][4];
		var py = emoji.data[idx][5];

		// now we'll see if we can use a varition. if we can, we can override the params above and blank
		// out `extra` so we output a sinlge glyph.
		// we need to check that:
		//  * we requested a variation
		//  * such a variation exists in `emoji.variations_data`
		//  * we're not using a custom image for this glyph
		//  * the variation has an image defined for the current image set
		if (variation_idx && emoji.variations_data[variation_idx] && emoji.variations_data[variation_idx][2] && !emoji.data[idx][9]){
			if (emoji.variations_data[variation_idx][2] & emoji.img_sets[emoji.img_set].mask){
				img = emoji.img_sets[emoji.img_set].path+variation_idx+'.png';
				px = emoji.variations_data[variation_idx][0];
				py = emoji.variations_data[variation_idx][1];
				extra = '';
			}
		}

		if (emoji.supports_css) {
			if (emoji.use_sheet && px != null && py != null){
				var mul = 100 / (emoji.sheet_size - 1);
				var style = 'background: url('+emoji.img_sets[emoji.img_set].sheet+');background-position:'+(mul*px)+'% '+(mul*py)+'%;background-size:'+emoji.sheet_size+'00%';
				return '<span class="emoji-outer emoji-sizer"><span class="emoji-inner" style="'+style+'"'+title+'>'+text+'</span></span>'+extra;
			}else if (emoji.use_css_imgs){
				return '<span class="emoji emoji-'+idx+'"'+title+'>'+text+'</span>'+extra;
			}else{
				return '<span class="emoji emoji-sizer" style="background-image:url('+img+')"'+title+'>'+text+'</span>'+extra;
			}
		}
		return '<img src="'+img+'" class="emoji" '+title+'/>'+extra;
	};

	// Initializes the text emoticon data
	/** @private */
	emoji.init_emoticons = function(){
		if (emoji.inits.emoticons) return;
		emoji.init_colons(); // we require this for the emoticons map
		emoji.inits.emoticons = 1;
		
		var a = [];
		emoji.map.emoticons = {};
		for (var i in emoji.emoticons_data){
			// because we never see some characters in our text except as entities, we must do some replacing
			var emoticon = i.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
			
			if (!emoji.map.colons[emoji.emoticons_data[i]]) continue;

			emoji.map.emoticons[emoticon] = emoji.map.colons[emoji.emoticons_data[i]];
			a.push(emoji.escape_rx(emoticon));
		}
		emoji.rx_emoticons = new RegExp(('(^|\\s)('+a.join('|')+')(?=$|[\\s|\\?\\.,!])'), 'g');
	};

	// Initializes the colon string data
	/** @private */
	emoji.init_colons = function(){
		if (emoji.inits.colons) return;
		emoji.inits.colons = 1;
		emoji.rx_colons = new RegExp('\:[a-zA-Z0-9-_+]+\:(\:skin-tone-[2-6]\:)?', 'g');
		emoji.map.colons = {};
		for (var i in emoji.data){
			for (var j=0; j<emoji.data[i][3].length; j++){
				emoji.map.colons[emoji.data[i][3][j]] = i;
			}
		}
	};

	// initializes the unified unicode emoticon data
	/** @private */
	emoji.init_unified = function(){
		if (emoji.inits.unified) return;
		emoji.inits.unified = 1;

		var a = [];
		emoji.map.unified = {};

		for (var i in emoji.data){
			for (var j=0; j<emoji.data[i][0].length; j++){
				a.push(emoji.data[i][0][j].replace('*', '\\*'));
				emoji.map.unified[emoji.data[i][0][j]] = i;
			}
		}

		a = a.sort(function(a,b){
			 return b.length - a.length;
		});

		emoji.rx_unified = new RegExp('('+a.join('|')+')(\uD83C[\uDFFB-\uDFFF])?', "g");
	};

	// initializes the environment, figuring out what representation
	// of emoticons is best.
	/** @private */
	emoji.init_env = function(){
		if (emoji.inits.env) return;
		emoji.inits.env = 1;
		emoji.replace_mode = 'img';
		emoji.supports_css = false;
		if (typeof(navigator) !== 'undefined') {
			var ua = navigator.userAgent;
			if (window.getComputedStyle){
				var st = window.getComputedStyle(document.body);
				if (st['background-size'] || st['backgroundSize']){
					emoji.supports_css = true;
				}
			}
			if (ua.match(/(iPhone|iPod|iPad|iPhone\s+Simulator)/i)){
				if (ua.match(/OS\s+[12345]/i)){
					emoji.replace_mode = 'softbank';
					return;
				}
				if (ua.match(/OS\s+[6789]/i)){
					emoji.replace_mode = 'unified';
					return;
				}
			}
			if (ua.match(/Mac OS X 10[._ ](?:[789]|1\d)/i)){
				if (!ua.match(/Chrome/i) && !ua.match(/Firefox/i)){
					emoji.replace_mode = 'unified';
					return;
				}
			}
			if (!emoji.avoid_ms_emoji){
				if (ua.match(/Windows NT 6.[1-9]/i) || ua.match(/Windows NT 10.[0-9]/i)){
					if (!ua.match(/Chrome/i) && !ua.match(/MSIE 8/i)){
						emoji.replace_mode = 'unified';
						return;
					}
				}
			}
		}

		// Need a better way to detect android devices that actually
		// support emoji.
		if (false && ua.match(/Android/i)){
			emoji.replace_mode = 'google';
			return;
		}
		if (emoji.supports_css){
			emoji.replace_mode = 'css';
		}
		// nothing fancy detected - use images
	};
	/** @private */
	emoji.escape_rx = function(text){
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	emoji.sheet_size = 41;
	/** @private */
	emoji.data = {
		"00a9":[["\u00A9\uFE0F","\u00A9"],"\uE24E","\uDBBA\uDF29",["copyright"],0,0,11,0],
		"00ae":[["\u00AE\uFE0F","\u00AE"],"\uE24F","\uDBBA\uDF2D",["registered"],0,1,11,0],
		"203c":[["\u203C\uFE0F","\u203C"],"","\uDBBA\uDF06",["bangbang"],0,2,15,0],
		"2049":[["\u2049\uFE0F","\u2049"],"","\uDBBA\uDF05",["interrobang"],0,3,15,0],
		"2122":[["\u2122\uFE0F","\u2122"],"\uE537","\uDBBA\uDF2A",["tm"],0,4,11,0],
		"2139":[["\u2139\uFE0F","\u2139"],"","\uDBBA\uDF47",["information_source"],0,5,15,0],
		"2194":[["\u2194\uFE0F","\u2194"],"","\uDBBA\uDEF6",["left_right_arrow"],0,6,15,0],
		"2195":[["\u2195\uFE0F","\u2195"],"","\uDBBA\uDEF7",["arrow_up_down"],0,7,15,0],
		"2196":[["\u2196\uFE0F","\u2196"],"\uE237","\uDBBA\uDEF2",["arrow_upper_left"],0,8,15,0],
		"2197":[["\u2197\uFE0F","\u2197"],"\uE236","\uDBBA\uDEF0",["arrow_upper_right"],0,9,15,0],
		"2198":[["\u2198\uFE0F","\u2198"],"\uE238","\uDBBA\uDEF1",["arrow_lower_right"],0,10,15,0],
		"2199":[["\u2199\uFE0F","\u2199"],"\uE239","\uDBBA\uDEF3",["arrow_lower_left"],0,11,15,0],
		"21a9":[["\u21A9\uFE0F","\u21A9"],"","\uDBBA\uDF83",["leftwards_arrow_with_hook"],0,12,15,0],
		"21aa":[["\u21AA\uFE0F","\u21AA"],"","\uDBBA\uDF88",["arrow_right_hook"],0,13,15,0],
		"231a":[["\u231A\uFE0F","\u231A"],"","\uDBB8\uDC1D",["watch"],0,14,15,0],
		"231b":[["\u231B\uFE0F","\u231B"],"","\uDBB8\uDC1C",["hourglass"],0,15,15,0],
		"2328":[["\u2328"],"","",["keyboard"],0,16,7,0],
		"23e9":[["\u23E9"],"\uE23C","\uDBBA\uDEFE",["fast_forward"],0,17,15,0],
		"23ea":[["\u23EA"],"\uE23D","\uDBBA\uDEFF",["rewind"],0,18,15,0],
		"23eb":[["\u23EB"],"","\uDBBA\uDF03",["arrow_double_up"],0,19,15,0],
		"23ec":[["\u23EC"],"","\uDBBA\uDF02",["arrow_double_down"],0,20,15,0],
		"23ed":[["\u23ED"],"","",["black_right_pointing_double_triangle_with_vertical_bar"],0,21,7,0],
		"23ee":[["\u23EE"],"","",["black_left_pointing_double_triangle_with_vertical_bar"],0,22,7,0],
		"23ef":[["\u23EF"],"","",["black_right_pointing_triangle_with_double_vertical_bar"],0,23,7,0],
		"23f0":[["\u23F0"],"\uE02D","\uDBB8\uDC2A",["alarm_clock"],0,24,15,0],
		"23f1":[["\u23F1"],"","",["stopwatch"],0,25,7,0],
		"23f2":[["\u23F2"],"","",["timer_clock"],0,26,7,0],
		"23f3":[["\u23F3"],"","\uDBB8\uDC1B",["hourglass_flowing_sand"],0,27,15,0],
		"23f8":[["\u23F8"],"","",["double_vertical_bar"],0,28,7,0],
		"23f9":[["\u23F9"],"","",["black_square_for_stop"],0,29,7,0],
		"23fa":[["\u23FA"],"","",["black_circle_for_record"],0,30,7,0],
		"24c2":[["\u24C2\uFE0F","\u24C2"],"\uE434","\uDBB9\uDFE1",["m"],0,31,15,0],
		"25aa":[["\u25AA\uFE0F","\u25AA"],"\uE21A","\uDBBA\uDF6E",["black_small_square"],0,32,15,0],
		"25ab":[["\u25AB\uFE0F","\u25AB"],"\uE21B","\uDBBA\uDF6D",["white_small_square"],0,33,15,0],
		"25b6":[["\u25B6\uFE0F","\u25B6"],"\uE23A","\uDBBA\uDEFC",["arrow_forward"],0,34,15,0],
		"25c0":[["\u25C0\uFE0F","\u25C0"],"\uE23B","\uDBBA\uDEFD",["arrow_backward"],0,35,15,0],
		"25fb":[["\u25FB\uFE0F","\u25FB"],"\uE21B","\uDBBA\uDF71",["white_medium_square"],0,36,15,0],
		"25fc":[["\u25FC\uFE0F","\u25FC"],"\uE21A","\uDBBA\uDF72",["black_medium_square"],0,37,15,0],
		"25fd":[["\u25FD\uFE0F","\u25FD"],"\uE21B","\uDBBA\uDF6F",["white_medium_small_square"],0,38,15,0],
		"25fe":[["\u25FE\uFE0F","\u25FE"],"\uE21A","\uDBBA\uDF70",["black_medium_small_square"],0,39,15,0],
		"2600":[["\u2600\uFE0F","\u2600"],"\uE04A","\uDBB8\uDC00",["sunny"],0,40,15,0],
		"2601":[["\u2601\uFE0F","\u2601"],"\uE049","\uDBB8\uDC01",["cloud"],1,0,15,0],
		"2602":[["\u2602"],"","",["umbrella"],1,1,7,0],
		"2603":[["\u2603"],"","",["showman"],1,2,7,0],
		"2604":[["\u2604"],"","",["comet"],1,3,7,0],
		"260e":[["\u260E\uFE0F","\u260E"],"\uE009","\uDBB9\uDD23",["phone","telephone"],1,4,15,0],
		"2611":[["\u2611\uFE0F","\u2611"],"","\uDBBA\uDF8B",["ballot_box_with_check"],1,5,15,0],
		"2614":[["\u2614\uFE0F","\u2614"],"\uE04B","\uDBB8\uDC02",["umbrella"],1,6,15,0],
		"2615":[["\u2615\uFE0F","\u2615"],"\uE045","\uDBBA\uDD81",["coffee"],1,7,15,0],
		"2618":[["\u2618"],"","",["shamrock"],1,8,7,0],
		"261d":[["\u261D\uFE0F","\u261D"],"\uE00F","\uDBBA\uDF98",["point_up"],1,9,15,0],
		"2620":[["\u2620"],"","",["skull_and_crossbones"],1,15,7,0],
		"2622":[["\u2622"],"","",["radioactive_sign"],1,16,7,0],
		"2623":[["\u2623"],"","",["biohazard_sign"],1,17,7,0],
		"2626":[["\u2626"],"","",["orthodox_cross"],1,18,7,0],
		"262a":[["\u262A"],"","",["star_and_crescent"],1,19,7,0],
		"262e":[["\u262E"],"","",["peace_symbol"],1,20,7,0],
		"262f":[["\u262F"],"","",["yin_yang"],1,21,7,0],
		"2638":[["\u2638"],"","",["wheel_of_dharma"],1,22,7,0],
		"2639":[["\u2639"],"","",["white_frowning_face"],1,23,7,0],
		"263a":[["\u263A\uFE0F","\u263A"],"\uE414","\uDBB8\uDF36",["relaxed"],1,24,15,0],
		"2648":[["\u2648\uFE0F","\u2648"],"\uE23F","\uDBB8\uDC2B",["aries"],1,25,15,0],
		"2649":[["\u2649\uFE0F","\u2649"],"\uE240","\uDBB8\uDC2C",["taurus"],1,26,15,0],
		"264a":[["\u264A\uFE0F","\u264A"],"\uE241","\uDBB8\uDC2D",["gemini"],1,27,15,0],
		"264b":[["\u264B\uFE0F","\u264B"],"\uE242","\uDBB8\uDC2E",["cancer"],1,28,15,0],
		"264c":[["\u264C\uFE0F","\u264C"],"\uE243","\uDBB8\uDC2F",["leo"],1,29,15,0],
		"264d":[["\u264D\uFE0F","\u264D"],"\uE244","\uDBB8\uDC30",["virgo"],1,30,15,0],
		"264e":[["\u264E\uFE0F","\u264E"],"\uE245","\uDBB8\uDC31",["libra"],1,31,15,0],
		"264f":[["\u264F\uFE0F","\u264F"],"\uE246","\uDBB8\uDC32",["scorpius"],1,32,15,0],
		"2650":[["\u2650\uFE0F","\u2650"],"\uE247","\uDBB8\uDC33",["sagittarius"],1,33,15,0],
		"2651":[["\u2651\uFE0F","\u2651"],"\uE248","\uDBB8\uDC34",["capricorn"],1,34,15,0],
		"2652":[["\u2652\uFE0F","\u2652"],"\uE249","\uDBB8\uDC35",["aquarius"],1,35,15,0],
		"2653":[["\u2653\uFE0F","\u2653"],"\uE24A","\uDBB8\uDC36",["pisces"],1,36,15,0],
		"2660":[["\u2660\uFE0F","\u2660"],"\uE20E","\uDBBA\uDF1B",["spades"],1,37,15,0],
		"2663":[["\u2663\uFE0F","\u2663"],"\uE20F","\uDBBA\uDF1D",["clubs"],1,38,15,0],
		"2665":[["\u2665\uFE0F","\u2665"],"\uE20C","\uDBBA\uDF1A",["hearts"],1,39,15,0],
		"2666":[["\u2666\uFE0F","\u2666"],"\uE20D","\uDBBA\uDF1C",["diamonds"],1,40,15,0],
		"2668":[["\u2668\uFE0F","\u2668"],"\uE123","\uDBB9\uDFFA",["hotsprings"],2,0,15,0],
		"267b":[["\u267B\uFE0F","\u267B"],"","\uDBBA\uDF2C",["recycle"],2,1,15,0],
		"267f":[["\u267F\uFE0F","\u267F"],"\uE20A","\uDBBA\uDF20",["wheelchair"],2,2,15,0],
		"2692":[["\u2692"],"","",["hammer_and_pick"],2,3,7,0],
		"2693":[["\u2693\uFE0F","\u2693"],"\uE202","\uDBB9\uDCC1",["anchor"],2,4,15,0],
		"2694":[["\u2694"],"","",["crossed_swords"],2,5,7,0],
		"2696":[["\u2696"],"","",["scales"],2,6,7,0],
		"2697":[["\u2697"],"","",["alembic"],2,7,7,0],
		"2699":[["\u2699"],"","",["gear"],2,8,7,0],
		"269b":[["\u269B"],"","",["atom_symbol"],2,9,7,0],
		"269c":[["\u269C"],"","",["fleur_de_lis"],2,10,7,0],
		"26a0":[["\u26A0\uFE0F","\u26A0"],"\uE252","\uDBBA\uDF23",["warning"],2,11,15,0],
		"26a1":[["\u26A1\uFE0F","\u26A1"],"\uE13D","\uDBB8\uDC04",["zap"],2,12,15,0],
		"26aa":[["\u26AA\uFE0F","\u26AA"],"\uE219","\uDBBA\uDF65",["white_circle"],2,13,15,0],
		"26ab":[["\u26AB\uFE0F","\u26AB"],"\uE219","\uDBBA\uDF66",["black_circle"],2,14,15,0],
		"26b0":[["\u26B0"],"","",["coffin"],2,15,7,0],
		"26b1":[["\u26B1"],"","",["funeral_urn"],2,16,7,0],
		"26bd":[["\u26BD\uFE0F","\u26BD"],"\uE018","\uDBB9\uDFD4",["soccer"],2,17,15,0],
		"26be":[["\u26BE\uFE0F","\u26BE"],"\uE016","\uDBB9\uDFD1",["baseball"],2,18,15,0],
		"26c4":[["\u26C4\uFE0F","\u26C4"],"\uE048","\uDBB8\uDC03",["snowman"],2,19,15,0],
		"26c5":[["\u26C5\uFE0F","\u26C5"],"\uE04A\uE049","\uDBB8\uDC0F",["partly_sunny"],2,20,15,0],
		"26c8":[["\u26C8"],"","",["thunder_cloud_and_rain"],2,21,7,0],
		"26ce":[["\u26CE"],"\uE24B","\uDBB8\uDC37",["ophiuchus"],2,22,15,0],
		"26cf":[["\u26CF"],"","",["pick"],2,23,7,0],
		"26d1":[["\u26D1"],"","",["helmet_with_white_cross"],2,24,7,0],
		"26d3":[["\u26D3"],"","",["chains"],2,25,7,0],
		"26d4":[["\u26D4\uFE0F","\u26D4"],"\uE137","\uDBBA\uDF26",["no_entry"],2,26,15,0],
		"26e9":[["\u26E9"],"","",["shinto_shrine"],2,27,7,0],
		"26ea":[["\u26EA\uFE0F","\u26EA"],"\uE037","\uDBB9\uDCBB",["church"],2,28,15,0],
		"26f0":[["\u26F0"],"","",["mountain"],2,29,7,0],
		"26f1":[["\u26F1"],"","",["umbrella_on_ground"],2,30,7,0],
		"26f2":[["\u26F2\uFE0F","\u26F2"],"\uE121","\uDBB9\uDCBC",["fountain"],2,31,15,0],
		"26f3":[["\u26F3\uFE0F","\u26F3"],"\uE014","\uDBB9\uDFD2",["golf"],2,32,15,0],
		"26f4":[["\u26F4"],"","",["ferry"],2,33,7,0],
		"26f5":[["\u26F5\uFE0F","\u26F5"],"\uE01C","\uDBB9\uDFEA",["boat","sailboat"],2,34,15,0],
		"26f7":[["\u26F7"],"","",["skier"],2,35,7,0],
		"26f8":[["\u26F8"],"","",["ice_skate"],2,36,7,0],
		"26f9":[["\u26F9"],"","",["person_with_ball"],2,37,7,0],
		"26fa":[["\u26FA\uFE0F","\u26FA"],"\uE122","\uDBB9\uDFFB",["tent"],3,2,15,0],
		"26fd":[["\u26FD\uFE0F","\u26FD"],"\uE03A","\uDBB9\uDFF5",["fuelpump"],3,3,15,0],
		"2702":[["\u2702\uFE0F","\u2702"],"\uE313","\uDBB9\uDD3E",["scissors"],3,4,15,0],
		"2705":[["\u2705"],"","\uDBBA\uDF4A",["white_check_mark"],3,5,15,0],
		"2708":[["\u2708\uFE0F","\u2708"],"\uE01D","\uDBB9\uDFE9",["airplane"],3,6,15,0],
		"2709":[["\u2709\uFE0F","\u2709"],"\uE103","\uDBB9\uDD29",["email","envelope"],3,7,15,0],
		"270a":[["\u270A"],"\uE010","\uDBBA\uDF93",["fist"],3,8,15,0],
		"270b":[["\u270B"],"\uE012","\uDBBA\uDF95",["hand","raised_hand"],3,14,15,0],
		"270c":[["\u270C\uFE0F","\u270C"],"\uE011","\uDBBA\uDF94",["v"],3,20,15,0],
		"270d":[["\u270D"],"","",["writing_hand"],3,26,7,0],
		"270f":[["\u270F\uFE0F","\u270F"],"\uE301","\uDBB9\uDD39",["pencil2"],3,32,15,0],
		"2712":[["\u2712\uFE0F","\u2712"],"","\uDBB9\uDD36",["black_nib"],3,33,15,0],
		"2714":[["\u2714\uFE0F","\u2714"],"","\uDBBA\uDF49",["heavy_check_mark"],3,34,15,0],
		"2716":[["\u2716\uFE0F","\u2716"],"\uE333","\uDBBA\uDF53",["heavy_multiplication_x"],3,35,15,0],
		"271d":[["\u271D"],"","",["latin_cross"],3,36,7,0],
		"2721":[["\u2721"],"","",["star_of_david"],3,37,7,0],
		"2728":[["\u2728"],"\uE32E","\uDBBA\uDF60",["sparkles"],3,38,15,0],
		"2733":[["\u2733\uFE0F","\u2733"],"\uE206","\uDBBA\uDF62",["eight_spoked_asterisk"],3,39,15,0],
		"2734":[["\u2734\uFE0F","\u2734"],"\uE205","\uDBBA\uDF61",["eight_pointed_black_star"],3,40,15,0],
		"2744":[["\u2744\uFE0F","\u2744"],"","\uDBB8\uDC0E",["snowflake"],4,0,15,0],
		"2747":[["\u2747\uFE0F","\u2747"],"\uE32E","\uDBBA\uDF77",["sparkle"],4,1,15,0],
		"274c":[["\u274C"],"\uE333","\uDBBA\uDF45",["x"],4,2,15,0],
		"274e":[["\u274E"],"\uE333","\uDBBA\uDF46",["negative_squared_cross_mark"],4,3,15,0],
		"2753":[["\u2753"],"\uE020","\uDBBA\uDF09",["question"],4,4,15,0],
		"2754":[["\u2754"],"\uE336","\uDBBA\uDF0A",["grey_question"],4,5,15,0],
		"2755":[["\u2755"],"\uE337","\uDBBA\uDF0B",["grey_exclamation"],4,6,15,0],
		"2757":[["\u2757\uFE0F","\u2757"],"\uE021","\uDBBA\uDF04",["exclamation","heavy_exclamation_mark"],4,7,15,0],
		"2763":[["\u2763"],"","",["heavy_heart_exclamation_mark_ornament"],4,8,7,0],
		"2764":[["\u2764\uFE0F","\u2764"],"\uE022","\uDBBA\uDF0C",["heart"],4,9,15,0,"<3"],
		"2795":[["\u2795"],"","\uDBBA\uDF51",["heavy_plus_sign"],4,10,15,0],
		"2796":[["\u2796"],"","\uDBBA\uDF52",["heavy_minus_sign"],4,11,15,0],
		"2797":[["\u2797"],"","\uDBBA\uDF54",["heavy_division_sign"],4,12,15,0],
		"27a1":[["\u27A1\uFE0F","\u27A1"],"\uE234","\uDBBA\uDEFA",["arrow_right"],4,13,15,0],
		"27b0":[["\u27B0"],"","\uDBBA\uDF08",["curly_loop"],4,14,15,0],
		"27bf":[["\u27BF"],"\uE211","\uDBBA\uDC2B",["loop"],4,15,15,0],
		"2934":[["\u2934\uFE0F","\u2934"],"\uE236","\uDBBA\uDEF4",["arrow_heading_up"],4,16,15,0],
		"2935":[["\u2935\uFE0F","\u2935"],"\uE238","\uDBBA\uDEF5",["arrow_heading_down"],4,17,15,0],
		"2b05":[["\u2B05\uFE0F","\u2B05"],"\uE235","\uDBBA\uDEFB",["arrow_left"],4,18,15,0],
		"2b06":[["\u2B06\uFE0F","\u2B06"],"\uE232","\uDBBA\uDEF8",["arrow_up"],4,19,15,0],
		"2b07":[["\u2B07\uFE0F","\u2B07"],"\uE233","\uDBBA\uDEF9",["arrow_down"],4,20,15,0],
		"2b1b":[["\u2B1B\uFE0F","\u2B1B"],"\uE21A","\uDBBA\uDF6C",["black_large_square"],4,21,15,0],
		"2b1c":[["\u2B1C\uFE0F","\u2B1C"],"\uE21B","\uDBBA\uDF6B",["white_large_square"],4,22,15,0],
		"2b50":[["\u2B50\uFE0F","\u2B50"],"\uE32F","\uDBBA\uDF68",["star"],4,23,15,0],
		"2b55":[["\u2B55\uFE0F","\u2B55"],"\uE332","\uDBBA\uDF44",["o"],4,24,15,0],
		"3030":[["\u3030\uFE0F","\u3030"],"","\uDBBA\uDF07",["wavy_dash"],4,25,15,0],
		"303d":[["\u303D\uFE0F","\u303D"],"\uE12C","\uDBBA\uDC1B",["part_alternation_mark"],4,26,15,0],
		"3297":[["\u3297\uFE0F","\u3297"],"\uE30D","\uDBBA\uDF43",["congratulations"],4,27,15,0],
		"3299":[["\u3299\uFE0F","\u3299"],"\uE315","\uDBBA\uDF2B",["secret"],4,28,15,0],
		"1f004":[["\uD83C\uDC04\uFE0F","\uD83C\uDC04"],"\uE12D","\uDBBA\uDC0B",["mahjong"],4,29,15,0],
		"1f0cf":[["\uD83C\uDCCF"],"","\uDBBA\uDC12",["black_joker"],4,30,15,0],
		"1f170":[["\uD83C\uDD70\uFE0F","\uD83C\uDD70"],"\uE532","\uDBB9\uDD0B",["a"],4,31,15,0],
		"1f171":[["\uD83C\uDD71\uFE0F","\uD83C\uDD71"],"\uE533","\uDBB9\uDD0C",["b"],4,32,15,0],
		"1f17e":[["\uD83C\uDD7E\uFE0F","\uD83C\uDD7E"],"\uE535","\uDBB9\uDD0E",["o2"],4,33,15,0],
		"1f17f":[["\uD83C\uDD7F\uFE0F","\uD83C\uDD7F"],"\uE14F","\uDBB9\uDFF6",["parking"],4,34,15,0],
		"1f18e":[["\uD83C\uDD8E"],"\uE534","\uDBB9\uDD0D",["ab"],4,35,15,0],
		"1f191":[["\uD83C\uDD91"],"","\uDBBA\uDF84",["cl"],4,36,15,0],
		"1f192":[["\uD83C\uDD92"],"\uE214","\uDBBA\uDF38",["cool"],4,37,15,0],
		"1f193":[["\uD83C\uDD93"],"","\uDBBA\uDF21",["free"],4,38,15,0],
		"1f194":[["\uD83C\uDD94"],"\uE229","\uDBBA\uDF81",["id"],4,39,15,0],
		"1f195":[["\uD83C\uDD95"],"\uE212","\uDBBA\uDF36",["new"],4,40,15,0],
		"1f196":[["\uD83C\uDD96"],"","\uDBBA\uDF28",["ng"],5,0,15,0],
		"1f197":[["\uD83C\uDD97"],"\uE24D","\uDBBA\uDF27",["ok"],5,1,15,0],
		"1f198":[["\uD83C\uDD98"],"","\uDBBA\uDF4F",["sos"],5,2,15,0],
		"1f199":[["\uD83C\uDD99"],"\uE213","\uDBBA\uDF37",["up"],5,3,15,0],
		"1f19a":[["\uD83C\uDD9A"],"\uE12E","\uDBBA\uDF32",["vs"],5,4,15,0],
		"1f201":[["\uD83C\uDE01"],"\uE203","\uDBBA\uDF24",["koko"],5,5,15,0],
		"1f202":[["\uD83C\uDE02\uFE0F","\uD83C\uDE02"],"\uE228","\uDBBA\uDF3F",["sa"],5,6,15,0],
		"1f21a":[["\uD83C\uDE1A\uFE0F","\uD83C\uDE1A"],"\uE216","\uDBBA\uDF3A",["u7121"],5,7,15,0],
		"1f22f":[["\uD83C\uDE2F\uFE0F","\uD83C\uDE2F"],"\uE22C","\uDBBA\uDF40",["u6307"],5,8,15,0],
		"1f232":[["\uD83C\uDE32"],"","\uDBBA\uDF2E",["u7981"],5,9,15,0],
		"1f233":[["\uD83C\uDE33"],"\uE22B","\uDBBA\uDF2F",["u7a7a"],5,10,15,0],
		"1f234":[["\uD83C\uDE34"],"","\uDBBA\uDF30",["u5408"],5,11,15,0],
		"1f235":[["\uD83C\uDE35"],"\uE22A","\uDBBA\uDF31",["u6e80"],5,12,15,0],
		"1f236":[["\uD83C\uDE36"],"\uE215","\uDBBA\uDF39",["u6709"],5,13,15,0],
		"1f237":[["\uD83C\uDE37\uFE0F","\uD83C\uDE37"],"\uE217","\uDBBA\uDF3B",["u6708"],5,14,15,0],
		"1f238":[["\uD83C\uDE38"],"\uE218","\uDBBA\uDF3C",["u7533"],5,15,15,0],
		"1f239":[["\uD83C\uDE39"],"\uE227","\uDBBA\uDF3E",["u5272"],5,16,15,0],
		"1f23a":[["\uD83C\uDE3A"],"\uE22D","\uDBBA\uDF41",["u55b6"],5,17,15,0],
		"1f250":[["\uD83C\uDE50"],"\uE226","\uDBBA\uDF3D",["ideograph_advantage"],5,18,15,0],
		"1f251":[["\uD83C\uDE51"],"","\uDBBA\uDF50",["accept"],5,19,15,0],
		"1f300":[["\uD83C\uDF00"],"\uE443","\uDBB8\uDC05",["cyclone"],5,20,15,0],
		"1f301":[["\uD83C\uDF01"],"","\uDBB8\uDC06",["foggy"],5,21,15,0],
		"1f302":[["\uD83C\uDF02"],"\uE43C","\uDBB8\uDC07",["closed_umbrella"],5,22,15,0],
		"1f303":[["\uD83C\uDF03"],"\uE44B","\uDBB8\uDC08",["night_with_stars"],5,23,15,0],
		"1f304":[["\uD83C\uDF04"],"\uE04D","\uDBB8\uDC09",["sunrise_over_mountains"],5,24,15,0],
		"1f305":[["\uD83C\uDF05"],"\uE449","\uDBB8\uDC0A",["sunrise"],5,25,15,0],
		"1f306":[["\uD83C\uDF06"],"\uE146","\uDBB8\uDC0B",["city_sunset"],5,26,15,0],
		"1f307":[["\uD83C\uDF07"],"\uE44A","\uDBB8\uDC0C",["city_sunrise"],5,27,15,0],
		"1f308":[["\uD83C\uDF08"],"\uE44C","\uDBB8\uDC0D",["rainbow"],5,28,15,0],
		"1f309":[["\uD83C\uDF09"],"\uE44B","\uDBB8\uDC10",["bridge_at_night"],5,29,15,0],
		"1f30a":[["\uD83C\uDF0A"],"\uE43E","\uDBB8\uDC38",["ocean"],5,30,15,0],
		"1f30b":[["\uD83C\uDF0B"],"","\uDBB8\uDC3A",["volcano"],5,31,15,0],
		"1f30c":[["\uD83C\uDF0C"],"\uE44B","\uDBB8\uDC3B",["milky_way"],5,32,15,0],
		"1f30d":[["\uD83C\uDF0D"],"","",["earth_africa"],5,33,15,0],
		"1f30e":[["\uD83C\uDF0E"],"","",["earth_americas"],5,34,15,0],
		"1f30f":[["\uD83C\uDF0F"],"","\uDBB8\uDC39",["earth_asia"],5,35,15,0],
		"1f310":[["\uD83C\uDF10"],"","",["globe_with_meridians"],5,36,15,0],
		"1f311":[["\uD83C\uDF11"],"","\uDBB8\uDC11",["new_moon"],5,37,15,0],
		"1f312":[["\uD83C\uDF12"],"","",["waxing_crescent_moon"],5,38,15,0],
		"1f313":[["\uD83C\uDF13"],"\uE04C","\uDBB8\uDC13",["first_quarter_moon"],5,39,15,0],
		"1f314":[["\uD83C\uDF14"],"\uE04C","\uDBB8\uDC12",["moon","waxing_gibbous_moon"],5,40,15,0],
		"1f315":[["\uD83C\uDF15"],"","\uDBB8\uDC15",["full_moon"],6,0,15,0],
		"1f316":[["\uD83C\uDF16"],"","",["waning_gibbous_moon"],6,1,15,0],
		"1f317":[["\uD83C\uDF17"],"","",["last_quarter_moon"],6,2,15,0],
		"1f318":[["\uD83C\uDF18"],"","",["waning_crescent_moon"],6,3,15,0],
		"1f319":[["\uD83C\uDF19"],"\uE04C","\uDBB8\uDC14",["crescent_moon"],6,4,15,0],
		"1f31a":[["\uD83C\uDF1A"],"","",["new_moon_with_face"],6,5,15,0],
		"1f31b":[["\uD83C\uDF1B"],"\uE04C","\uDBB8\uDC16",["first_quarter_moon_with_face"],6,6,15,0],
		"1f31c":[["\uD83C\uDF1C"],"","",["last_quarter_moon_with_face"],6,7,15,0],
		"1f31d":[["\uD83C\uDF1D"],"","",["full_moon_with_face"],6,8,15,0],
		"1f31e":[["\uD83C\uDF1E"],"","",["sun_with_face"],6,9,15,0],
		"1f31f":[["\uD83C\uDF1F"],"\uE335","\uDBBA\uDF69",["star2"],6,10,15,0],
		"1f320":[["\uD83C\uDF20"],"","\uDBBA\uDF6A",["stars"],6,11,15,0],
		"1f321":[["\uD83C\uDF21"],"","",["thermometer"],6,12,15,0],
		"1f324":[["\uD83C\uDF24"],"","",["mostly_sunny","sun_small_cloud"],6,13,7,0],
		"1f325":[["\uD83C\uDF25"],"","",["barely_sunny","sun_behind_cloud"],6,14,7,0],
		"1f326":[["\uD83C\uDF26"],"","",["partly_sunny_rain","sun_behind_rain_cloud"],6,15,7,0],
		"1f327":[["\uD83C\uDF27"],"","",["rain_cloud"],6,16,15,0],
		"1f328":[["\uD83C\uDF28"],"","",["snow_cloud"],6,17,15,0],
		"1f329":[["\uD83C\uDF29"],"","",["lightning","lightning_cloud"],6,18,15,0],
		"1f32a":[["\uD83C\uDF2A"],"","",["tornado","tornado_cloud"],6,19,15,0],
		"1f32b":[["\uD83C\uDF2B"],"","",["fog"],6,20,15,0],
		"1f32c":[["\uD83C\uDF2C"],"","",["wind_blowing_face"],6,21,15,0],
		"1f32d":[["\uD83C\uDF2D"],"","",["hotdog"],6,22,7,0],
		"1f32e":[["\uD83C\uDF2E"],"","",["taco"],6,23,7,0],
		"1f32f":[["\uD83C\uDF2F"],"","",["burrito"],6,24,7,0],
		"1f330":[["\uD83C\uDF30"],"","\uDBB8\uDC4C",["chestnut"],6,25,15,0],
		"1f331":[["\uD83C\uDF31"],"\uE110","\uDBB8\uDC3E",["seedling"],6,26,15,0],
		"1f332":[["\uD83C\uDF32"],"","",["evergreen_tree"],6,27,15,0],
		"1f333":[["\uD83C\uDF33"],"","",["deciduous_tree"],6,28,15,0],
		"1f334":[["\uD83C\uDF34"],"\uE307","\uDBB8\uDC47",["palm_tree"],6,29,15,0],
		"1f335":[["\uD83C\uDF35"],"\uE308","\uDBB8\uDC48",["cactus"],6,30,15,0],
		"1f336":[["\uD83C\uDF36"],"","",["hot_pepper"],6,31,15,0],
		"1f337":[["\uD83C\uDF37"],"\uE304","\uDBB8\uDC3D",["tulip"],6,32,15,0],
		"1f338":[["\uD83C\uDF38"],"\uE030","\uDBB8\uDC40",["cherry_blossom"],6,33,15,0],
		"1f339":[["\uD83C\uDF39"],"\uE032","\uDBB8\uDC41",["rose"],6,34,15,0],
		"1f33a":[["\uD83C\uDF3A"],"\uE303","\uDBB8\uDC45",["hibiscus"],6,35,15,0],
		"1f33b":[["\uD83C\uDF3B"],"\uE305","\uDBB8\uDC46",["sunflower"],6,36,15,0],
		"1f33c":[["\uD83C\uDF3C"],"\uE305","\uDBB8\uDC4D",["blossom"],6,37,15,0],
		"1f33d":[["\uD83C\uDF3D"],"","\uDBB8\uDC4A",["corn"],6,38,15,0],
		"1f33e":[["\uD83C\uDF3E"],"\uE444","\uDBB8\uDC49",["ear_of_rice"],6,39,15,0],
		"1f33f":[["\uD83C\uDF3F"],"\uE110","\uDBB8\uDC4E",["herb"],6,40,15,0],
		"1f340":[["\uD83C\uDF40"],"\uE110","\uDBB8\uDC3C",["four_leaf_clover"],7,0,15,0],
		"1f341":[["\uD83C\uDF41"],"\uE118","\uDBB8\uDC3F",["maple_leaf"],7,1,15,0],
		"1f342":[["\uD83C\uDF42"],"\uE119","\uDBB8\uDC42",["fallen_leaf"],7,2,15,0],
		"1f343":[["\uD83C\uDF43"],"\uE447","\uDBB8\uDC43",["leaves"],7,3,15,0],
		"1f344":[["\uD83C\uDF44"],"","\uDBB8\uDC4B",["mushroom"],7,4,15,0],
		"1f345":[["\uD83C\uDF45"],"\uE349","\uDBB8\uDC55",["tomato"],7,5,15,0],
		"1f346":[["\uD83C\uDF46"],"\uE34A","\uDBB8\uDC56",["eggplant"],7,6,15,0],
		"1f347":[["\uD83C\uDF47"],"","\uDBB8\uDC59",["grapes"],7,7,15,0],
		"1f348":[["\uD83C\uDF48"],"","\uDBB8\uDC57",["melon"],7,8,15,0],
		"1f349":[["\uD83C\uDF49"],"\uE348","\uDBB8\uDC54",["watermelon"],7,9,15,0],
		"1f34a":[["\uD83C\uDF4A"],"\uE346","\uDBB8\uDC52",["tangerine"],7,10,15,0],
		"1f34b":[["\uD83C\uDF4B"],"","",["lemon"],7,11,15,0],
		"1f34c":[["\uD83C\uDF4C"],"","\uDBB8\uDC50",["banana"],7,12,15,0],
		"1f34d":[["\uD83C\uDF4D"],"","\uDBB8\uDC58",["pineapple"],7,13,15,0],
		"1f34e":[["\uD83C\uDF4E"],"\uE345","\uDBB8\uDC51",["apple"],7,14,15,0],
		"1f34f":[["\uD83C\uDF4F"],"\uE345","\uDBB8\uDC5B",["green_apple"],7,15,15,0],
		"1f350":[["\uD83C\uDF50"],"","",["pear"],7,16,15,0],
		"1f351":[["\uD83C\uDF51"],"","\uDBB8\uDC5A",["peach"],7,17,15,0],
		"1f352":[["\uD83C\uDF52"],"","\uDBB8\uDC4F",["cherries"],7,18,15,0],
		"1f353":[["\uD83C\uDF53"],"\uE347","\uDBB8\uDC53",["strawberry"],7,19,15,0],
		"1f354":[["\uD83C\uDF54"],"\uE120","\uDBBA\uDD60",["hamburger"],7,20,15,0],
		"1f355":[["\uD83C\uDF55"],"","\uDBBA\uDD75",["pizza"],7,21,15,0],
		"1f356":[["\uD83C\uDF56"],"","\uDBBA\uDD72",["meat_on_bone"],7,22,15,0],
		"1f357":[["\uD83C\uDF57"],"","\uDBBA\uDD76",["poultry_leg"],7,23,15,0],
		"1f358":[["\uD83C\uDF58"],"\uE33D","\uDBBA\uDD69",["rice_cracker"],7,24,15,0],
		"1f359":[["\uD83C\uDF59"],"\uE342","\uDBBA\uDD61",["rice_ball"],7,25,15,0],
		"1f35a":[["\uD83C\uDF5A"],"\uE33E","\uDBBA\uDD6A",["rice"],7,26,15,0],
		"1f35b":[["\uD83C\uDF5B"],"\uE341","\uDBBA\uDD6C",["curry"],7,27,15,0],
		"1f35c":[["\uD83C\uDF5C"],"\uE340","\uDBBA\uDD63",["ramen"],7,28,15,0],
		"1f35d":[["\uD83C\uDF5D"],"\uE33F","\uDBBA\uDD6B",["spaghetti"],7,29,15,0],
		"1f35e":[["\uD83C\uDF5E"],"\uE339","\uDBBA\uDD64",["bread"],7,30,15,0],
		"1f35f":[["\uD83C\uDF5F"],"\uE33B","\uDBBA\uDD67",["fries"],7,31,15,0],
		"1f360":[["\uD83C\uDF60"],"","\uDBBA\uDD74",["sweet_potato"],7,32,15,0],
		"1f361":[["\uD83C\uDF61"],"\uE33C","\uDBBA\uDD68",["dango"],7,33,15,0],
		"1f362":[["\uD83C\uDF62"],"\uE343","\uDBBA\uDD6D",["oden"],7,34,15,0],
		"1f363":[["\uD83C\uDF63"],"\uE344","\uDBBA\uDD6E",["sushi"],7,35,15,0],
		"1f364":[["\uD83C\uDF64"],"","\uDBBA\uDD7F",["fried_shrimp"],7,36,15,0],
		"1f365":[["\uD83C\uDF65"],"","\uDBBA\uDD73",["fish_cake"],7,37,15,0],
		"1f366":[["\uD83C\uDF66"],"\uE33A","\uDBBA\uDD66",["icecream"],7,38,15,0],
		"1f367":[["\uD83C\uDF67"],"\uE43F","\uDBBA\uDD71",["shaved_ice"],7,39,15,0],
		"1f368":[["\uD83C\uDF68"],"","\uDBBA\uDD77",["ice_cream"],7,40,15,0],
		"1f369":[["\uD83C\uDF69"],"","\uDBBA\uDD78",["doughnut"],8,0,15,0],
		"1f36a":[["\uD83C\uDF6A"],"","\uDBBA\uDD79",["cookie"],8,1,15,0],
		"1f36b":[["\uD83C\uDF6B"],"","\uDBBA\uDD7A",["chocolate_bar"],8,2,15,0],
		"1f36c":[["\uD83C\uDF6C"],"","\uDBBA\uDD7B",["candy"],8,3,15,0],
		"1f36d":[["\uD83C\uDF6D"],"","\uDBBA\uDD7C",["lollipop"],8,4,15,0],
		"1f36e":[["\uD83C\uDF6E"],"","\uDBBA\uDD7D",["custard"],8,5,15,0],
		"1f36f":[["\uD83C\uDF6F"],"","\uDBBA\uDD7E",["honey_pot"],8,6,15,0],
		"1f370":[["\uD83C\uDF70"],"\uE046","\uDBBA\uDD62",["cake"],8,7,15,0],
		"1f371":[["\uD83C\uDF71"],"\uE34C","\uDBBA\uDD6F",["bento"],8,8,15,0],
		"1f372":[["\uD83C\uDF72"],"\uE34D","\uDBBA\uDD70",["stew"],8,9,15,0],
		"1f373":[["\uD83C\uDF73"],"\uE147","\uDBBA\uDD65",["egg"],8,10,15,0],
		"1f374":[["\uD83C\uDF74"],"\uE043","\uDBBA\uDD80",["fork_and_knife"],8,11,15,0],
		"1f375":[["\uD83C\uDF75"],"\uE338","\uDBBA\uDD84",["tea"],8,12,15,0],
		"1f376":[["\uD83C\uDF76"],"\uE30B","\uDBBA\uDD85",["sake"],8,13,15,0],
		"1f377":[["\uD83C\uDF77"],"\uE044","\uDBBA\uDD86",["wine_glass"],8,14,15,0],
		"1f378":[["\uD83C\uDF78"],"\uE044","\uDBBA\uDD82",["cocktail"],8,15,15,0],
		"1f379":[["\uD83C\uDF79"],"\uE044","\uDBBA\uDD88",["tropical_drink"],8,16,15,0],
		"1f37a":[["\uD83C\uDF7A"],"\uE047","\uDBBA\uDD83",["beer"],8,17,15,0],
		"1f37b":[["\uD83C\uDF7B"],"\uE30C","\uDBBA\uDD87",["beers"],8,18,15,0],
		"1f37c":[["\uD83C\uDF7C"],"","",["baby_bottle"],8,19,15,0],
		"1f37d":[["\uD83C\uDF7D"],"","",["knife_fork_plate"],8,20,15,0],
		"1f37e":[["\uD83C\uDF7E"],"","",["champagne"],8,21,7,0],
		"1f37f":[["\uD83C\uDF7F"],"","",["popcorn"],8,22,7,0],
		"1f380":[["\uD83C\uDF80"],"\uE314","\uDBB9\uDD0F",["ribbon"],8,23,15,0],
		"1f381":[["\uD83C\uDF81"],"\uE112","\uDBB9\uDD10",["gift"],8,24,15,0],
		"1f382":[["\uD83C\uDF82"],"\uE34B","\uDBB9\uDD11",["birthday"],8,25,15,0],
		"1f383":[["\uD83C\uDF83"],"\uE445","\uDBB9\uDD1F",["jack_o_lantern"],8,26,15,0],
		"1f384":[["\uD83C\uDF84"],"\uE033","\uDBB9\uDD12",["christmas_tree"],8,27,15,0],
		"1f385":[["\uD83C\uDF85"],"\uE448","\uDBB9\uDD13",["santa"],8,28,15,0],
		"1f386":[["\uD83C\uDF86"],"\uE117","\uDBB9\uDD15",["fireworks"],8,34,15,0],
		"1f387":[["\uD83C\uDF87"],"\uE440","\uDBB9\uDD1D",["sparkler"],8,35,15,0],
		"1f388":[["\uD83C\uDF88"],"\uE310","\uDBB9\uDD16",["balloon"],8,36,15,0],
		"1f389":[["\uD83C\uDF89"],"\uE312","\uDBB9\uDD17",["tada"],8,37,15,0],
		"1f38a":[["\uD83C\uDF8A"],"","\uDBB9\uDD20",["confetti_ball"],8,38,15,0],
		"1f38b":[["\uD83C\uDF8B"],"","\uDBB9\uDD21",["tanabata_tree"],8,39,15,0],
		"1f38c":[["\uD83C\uDF8C"],"\uE143","\uDBB9\uDD14",["crossed_flags"],8,40,15,0],
		"1f38d":[["\uD83C\uDF8D"],"\uE436","\uDBB9\uDD18",["bamboo"],9,0,15,0],
		"1f38e":[["\uD83C\uDF8E"],"\uE438","\uDBB9\uDD19",["dolls"],9,1,15,0],
		"1f38f":[["\uD83C\uDF8F"],"\uE43B","\uDBB9\uDD1C",["flags"],9,2,15,0],
		"1f390":[["\uD83C\uDF90"],"\uE442","\uDBB9\uDD1E",["wind_chime"],9,3,15,0],
		"1f391":[["\uD83C\uDF91"],"\uE446","\uDBB8\uDC17",["rice_scene"],9,4,15,0],
		"1f392":[["\uD83C\uDF92"],"\uE43A","\uDBB9\uDD1B",["school_satchel"],9,5,15,0],
		"1f393":[["\uD83C\uDF93"],"\uE439","\uDBB9\uDD1A",["mortar_board"],9,6,15,0],
		"1f396":[["\uD83C\uDF96"],"","",["medal"],9,7,15,0],
		"1f397":[["\uD83C\uDF97"],"","",["reminder_ribbon"],9,8,15,0],
		"1f399":[["\uD83C\uDF99"],"","",["studio_microphone"],9,9,15,0],
		"1f39a":[["\uD83C\uDF9A"],"","",["level_slider"],9,10,15,0],
		"1f39b":[["\uD83C\uDF9B"],"","",["control_knobs"],9,11,15,0],
		"1f39e":[["\uD83C\uDF9E"],"","",["film_frames"],9,12,15,0],
		"1f39f":[["\uD83C\uDF9F"],"","",["admission_tickets"],9,13,15,0],
		"1f3a0":[["\uD83C\uDFA0"],"","\uDBB9\uDFFC",["carousel_horse"],9,14,15,0],
		"1f3a1":[["\uD83C\uDFA1"],"\uE124","\uDBB9\uDFFD",["ferris_wheel"],9,15,15,0],
		"1f3a2":[["\uD83C\uDFA2"],"\uE433","\uDBB9\uDFFE",["roller_coaster"],9,16,15,0],
		"1f3a3":[["\uD83C\uDFA3"],"\uE019","\uDBB9\uDFFF",["fishing_pole_and_fish"],9,17,15,0],
		"1f3a4":[["\uD83C\uDFA4"],"\uE03C","\uDBBA\uDC00",["microphone"],9,18,15,0],
		"1f3a5":[["\uD83C\uDFA5"],"\uE03D","\uDBBA\uDC01",["movie_camera"],9,19,15,0],
		"1f3a6":[["\uD83C\uDFA6"],"\uE507","\uDBBA\uDC02",["cinema"],9,20,15,0],
		"1f3a7":[["\uD83C\uDFA7"],"\uE30A","\uDBBA\uDC03",["headphones"],9,21,15,0],
		"1f3a8":[["\uD83C\uDFA8"],"\uE502","\uDBBA\uDC04",["art"],9,22,15,0],
		"1f3a9":[["\uD83C\uDFA9"],"\uE503","\uDBBA\uDC05",["tophat"],9,23,15,0],
		"1f3aa":[["\uD83C\uDFAA"],"","\uDBBA\uDC06",["circus_tent"],9,24,15,0],
		"1f3ab":[["\uD83C\uDFAB"],"\uE125","\uDBBA\uDC07",["ticket"],9,25,15,0],
		"1f3ac":[["\uD83C\uDFAC"],"\uE324","\uDBBA\uDC08",["clapper"],9,26,15,0],
		"1f3ad":[["\uD83C\uDFAD"],"\uE503","\uDBBA\uDC09",["performing_arts"],9,27,15,0],
		"1f3ae":[["\uD83C\uDFAE"],"","\uDBBA\uDC0A",["video_game"],9,28,15,0],
		"1f3af":[["\uD83C\uDFAF"],"\uE130","\uDBBA\uDC0C",["dart"],9,29,15,0],
		"1f3b0":[["\uD83C\uDFB0"],"\uE133","\uDBBA\uDC0D",["slot_machine"],9,30,15,0],
		"1f3b1":[["\uD83C\uDFB1"],"\uE42C","\uDBBA\uDC0E",["8ball"],9,31,15,0],
		"1f3b2":[["\uD83C\uDFB2"],"","\uDBBA\uDC0F",["game_die"],9,32,15,0],
		"1f3b3":[["\uD83C\uDFB3"],"","\uDBBA\uDC10",["bowling"],9,33,15,0],
		"1f3b4":[["\uD83C\uDFB4"],"","\uDBBA\uDC11",["flower_playing_cards"],9,34,15,0],
		"1f3b5":[["\uD83C\uDFB5"],"\uE03E","\uDBBA\uDC13",["musical_note"],9,35,15,0],
		"1f3b6":[["\uD83C\uDFB6"],"\uE326","\uDBBA\uDC14",["notes"],9,36,15,0],
		"1f3b7":[["\uD83C\uDFB7"],"\uE040","\uDBBA\uDC15",["saxophone"],9,37,15,0],
		"1f3b8":[["\uD83C\uDFB8"],"\uE041","\uDBBA\uDC16",["guitar"],9,38,15,0],
		"1f3b9":[["\uD83C\uDFB9"],"","\uDBBA\uDC17",["musical_keyboard"],9,39,15,0],
		"1f3ba":[["\uD83C\uDFBA"],"\uE042","\uDBBA\uDC18",["trumpet"],9,40,15,0],
		"1f3bb":[["\uD83C\uDFBB"],"","\uDBBA\uDC19",["violin"],10,0,15,0],
		"1f3bc":[["\uD83C\uDFBC"],"\uE326","\uDBBA\uDC1A",["musical_score"],10,1,15,0],
		"1f3bd":[["\uD83C\uDFBD"],"","\uDBB9\uDFD0",["running_shirt_with_sash"],10,2,15,0],
		"1f3be":[["\uD83C\uDFBE"],"\uE015","\uDBB9\uDFD3",["tennis"],10,3,15,0],
		"1f3bf":[["\uD83C\uDFBF"],"\uE013","\uDBB9\uDFD5",["ski"],10,4,15,0],
		"1f3c0":[["\uD83C\uDFC0"],"\uE42A","\uDBB9\uDFD6",["basketball"],10,5,15,0],
		"1f3c1":[["\uD83C\uDFC1"],"\uE132","\uDBB9\uDFD7",["checkered_flag"],10,6,15,0],
		"1f3c2":[["\uD83C\uDFC2"],"","\uDBB9\uDFD8",["snowboarder"],10,7,15,0],
		"1f3c3":[["\uD83C\uDFC3"],"\uE115","\uDBB9\uDFD9",["runner","running"],10,8,15,0],
		"1f3c4":[["\uD83C\uDFC4"],"\uE017","\uDBB9\uDFDA",["surfer"],10,14,15,0],
		"1f3c5":[["\uD83C\uDFC5"],"","",["sports_medal"],10,20,15,0],
		"1f3c6":[["\uD83C\uDFC6"],"\uE131","\uDBB9\uDFDB",["trophy"],10,21,15,0],
		"1f3c7":[["\uD83C\uDFC7"],"","",["horse_racing"],10,22,15,0],
		"1f3c8":[["\uD83C\uDFC8"],"\uE42B","\uDBB9\uDFDD",["football"],10,28,15,0],
		"1f3c9":[["\uD83C\uDFC9"],"","",["rugby_football"],10,29,15,0],
		"1f3ca":[["\uD83C\uDFCA"],"\uE42D","\uDBB9\uDFDE",["swimmer"],10,30,15,0],
		"1f3cb":[["\uD83C\uDFCB"],"","",["weight_lifter"],10,36,15,0],
		"1f3cc":[["\uD83C\uDFCC"],"","",["golfer"],11,1,15,0],
		"1f3cd":[["\uD83C\uDFCD"],"","",["racing_motorcycle"],11,2,15,0],
		"1f3ce":[["\uD83C\uDFCE"],"","",["racing_car"],11,3,15,0],
		"1f3cf":[["\uD83C\uDFCF"],"","",["cricket_bat_and_ball"],11,4,7,0],
		"1f3d0":[["\uD83C\uDFD0"],"","",["volleyball"],11,5,7,0],
		"1f3d1":[["\uD83C\uDFD1"],"","",["field_hockey_stick_and_ball"],11,6,7,0],
		"1f3d2":[["\uD83C\uDFD2"],"","",["ice_hockey_stick_and_puck"],11,7,7,0],
		"1f3d3":[["\uD83C\uDFD3"],"","",["table_tennis_paddle_and_ball"],11,8,7,0],
		"1f3d4":[["\uD83C\uDFD4"],"","",["snow_capped_mountain"],11,9,15,0],
		"1f3d5":[["\uD83C\uDFD5"],"","",["camping"],11,10,15,0],
		"1f3d6":[["\uD83C\uDFD6"],"","",["beach_with_umbrella"],11,11,15,0],
		"1f3d7":[["\uD83C\uDFD7"],"","",["building_construction"],11,12,15,0],
		"1f3d8":[["\uD83C\uDFD8"],"","",["house_buildings"],11,13,15,0],
		"1f3d9":[["\uD83C\uDFD9"],"","",["cityscape"],11,14,15,0],
		"1f3da":[["\uD83C\uDFDA"],"","",["derelict_house_building"],11,15,15,0],
		"1f3db":[["\uD83C\uDFDB"],"","",["classical_building"],11,16,15,0],
		"1f3dc":[["\uD83C\uDFDC"],"","",["desert"],11,17,15,0],
		"1f3dd":[["\uD83C\uDFDD"],"","",["desert_island"],11,18,15,0],
		"1f3de":[["\uD83C\uDFDE"],"","",["national_park"],11,19,15,0],
		"1f3df":[["\uD83C\uDFDF"],"","",["stadium"],11,20,15,0],
		"1f3e0":[["\uD83C\uDFE0"],"\uE036","\uDBB9\uDCB0",["house"],11,21,15,0],
		"1f3e1":[["\uD83C\uDFE1"],"\uE036","\uDBB9\uDCB1",["house_with_garden"],11,22,15,0],
		"1f3e2":[["\uD83C\uDFE2"],"\uE038","\uDBB9\uDCB2",["office"],11,23,15,0],
		"1f3e3":[["\uD83C\uDFE3"],"\uE153","\uDBB9\uDCB3",["post_office"],11,24,15,0],
		"1f3e4":[["\uD83C\uDFE4"],"","",["european_post_office"],11,25,15,0],
		"1f3e5":[["\uD83C\uDFE5"],"\uE155","\uDBB9\uDCB4",["hospital"],11,26,15,0],
		"1f3e6":[["\uD83C\uDFE6"],"\uE14D","\uDBB9\uDCB5",["bank"],11,27,15,0],
		"1f3e7":[["\uD83C\uDFE7"],"\uE154","\uDBB9\uDCB6",["atm"],11,28,15,0],
		"1f3e8":[["\uD83C\uDFE8"],"\uE158","\uDBB9\uDCB7",["hotel"],11,29,15,0],
		"1f3e9":[["\uD83C\uDFE9"],"\uE501","\uDBB9\uDCB8",["love_hotel"],11,30,15,0],
		"1f3ea":[["\uD83C\uDFEA"],"\uE156","\uDBB9\uDCB9",["convenience_store"],11,31,15,0],
		"1f3eb":[["\uD83C\uDFEB"],"\uE157","\uDBB9\uDCBA",["school"],11,32,15,0],
		"1f3ec":[["\uD83C\uDFEC"],"\uE504","\uDBB9\uDCBD",["department_store"],11,33,15,0],
		"1f3ed":[["\uD83C\uDFED"],"\uE508","\uDBB9\uDCC0",["factory"],11,34,15,0],
		"1f3ee":[["\uD83C\uDFEE"],"\uE30B","\uDBB9\uDCC2",["izakaya_lantern","lantern"],11,35,15,0],
		"1f3ef":[["\uD83C\uDFEF"],"\uE505","\uDBB9\uDCBE",["japanese_castle"],11,36,15,0],
		"1f3f0":[["\uD83C\uDFF0"],"\uE506","\uDBB9\uDCBF",["european_castle"],11,37,15,0],
		"1f3f3":[["\uD83C\uDFF3"],"","",["waving_white_flag"],11,38,15,0],
		"1f3f4":[["\uD83C\uDFF4"],"","",["waving_black_flag"],11,39,15,0],
		"1f3f5":[["\uD83C\uDFF5"],"","",["rosette"],11,40,15,0],
		"1f3f7":[["\uD83C\uDFF7"],"","",["label"],12,0,15,0],
		"1f3f8":[["\uD83C\uDFF8"],"","",["badminton_racquet_and_shuttlecock"],12,1,7,0],
		"1f3f9":[["\uD83C\uDFF9"],"","",["bow_and_arrow"],12,2,7,0],
		"1f3fa":[["\uD83C\uDFFA"],"","",["amphora"],12,3,7,0],
		"1f3fb":[["\uD83C\uDFFB"],"","",["skin-tone-2"],12,4,5,0],
		"1f3fc":[["\uD83C\uDFFC"],"","",["skin-tone-3"],12,5,5,0],
		"1f3fd":[["\uD83C\uDFFD"],"","",["skin-tone-4"],12,6,5,0],
		"1f3fe":[["\uD83C\uDFFE"],"","",["skin-tone-5"],12,7,5,0],
		"1f3ff":[["\uD83C\uDFFF"],"","",["skin-tone-6"],12,8,5,0],
		"1f400":[["\uD83D\uDC00"],"","",["rat"],12,9,15,0],
		"1f401":[["\uD83D\uDC01"],"","",["mouse2"],12,10,15,0],
		"1f402":[["\uD83D\uDC02"],"","",["ox"],12,11,15,0],
		"1f403":[["\uD83D\uDC03"],"","",["water_buffalo"],12,12,15,0],
		"1f404":[["\uD83D\uDC04"],"","",["cow2"],12,13,15,0],
		"1f405":[["\uD83D\uDC05"],"","",["tiger2"],12,14,15,0],
		"1f406":[["\uD83D\uDC06"],"","",["leopard"],12,15,15,0],
		"1f407":[["\uD83D\uDC07"],"","",["rabbit2"],12,16,15,0],
		"1f408":[["\uD83D\uDC08"],"","",["cat2"],12,17,15,0],
		"1f409":[["\uD83D\uDC09"],"","",["dragon"],12,18,15,0],
		"1f40a":[["\uD83D\uDC0A"],"","",["crocodile"],12,19,15,0],
		"1f40b":[["\uD83D\uDC0B"],"","",["whale2"],12,20,15,0],
		"1f40c":[["\uD83D\uDC0C"],"","\uDBB8\uDDB9",["snail"],12,21,15,0],
		"1f40d":[["\uD83D\uDC0D"],"\uE52D","\uDBB8\uDDD3",["snake"],12,22,15,0],
		"1f40e":[["\uD83D\uDC0E"],"\uE134","\uDBB9\uDFDC",["racehorse"],12,23,15,0],
		"1f40f":[["\uD83D\uDC0F"],"","",["ram"],12,24,15,0],
		"1f410":[["\uD83D\uDC10"],"","",["goat"],12,25,15,0],
		"1f411":[["\uD83D\uDC11"],"\uE529","\uDBB8\uDDCF",["sheep"],12,26,15,0],
		"1f412":[["\uD83D\uDC12"],"\uE528","\uDBB8\uDDCE",["monkey"],12,27,15,0],
		"1f413":[["\uD83D\uDC13"],"","",["rooster"],12,28,15,0],
		"1f414":[["\uD83D\uDC14"],"\uE52E","\uDBB8\uDDD4",["chicken"],12,29,15,0],
		"1f415":[["\uD83D\uDC15"],"","",["dog2"],12,30,15,0],
		"1f416":[["\uD83D\uDC16"],"","",["pig2"],12,31,15,0],
		"1f417":[["\uD83D\uDC17"],"\uE52F","\uDBB8\uDDD5",["boar"],12,32,15,0],
		"1f418":[["\uD83D\uDC18"],"\uE526","\uDBB8\uDDCC",["elephant"],12,33,15,0],
		"1f419":[["\uD83D\uDC19"],"\uE10A","\uDBB8\uDDC5",["octopus"],12,34,15,0],
		"1f41a":[["\uD83D\uDC1A"],"\uE441","\uDBB8\uDDC6",["shell"],12,35,15,0],
		"1f41b":[["\uD83D\uDC1B"],"\uE525","\uDBB8\uDDCB",["bug"],12,36,15,0],
		"1f41c":[["\uD83D\uDC1C"],"","\uDBB8\uDDDA",["ant"],12,37,15,0],
		"1f41d":[["\uD83D\uDC1D"],"","\uDBB8\uDDE1",["bee","honeybee"],12,38,15,0],
		"1f41e":[["\uD83D\uDC1E"],"","\uDBB8\uDDE2",["beetle"],12,39,15,0],
		"1f41f":[["\uD83D\uDC1F"],"\uE019","\uDBB8\uDDBD",["fish"],12,40,15,0],
		"1f420":[["\uD83D\uDC20"],"\uE522","\uDBB8\uDDC9",["tropical_fish"],13,0,15,0],
		"1f421":[["\uD83D\uDC21"],"\uE019","\uDBB8\uDDD9",["blowfish"],13,1,15,0],
		"1f422":[["\uD83D\uDC22"],"","\uDBB8\uDDDC",["turtle"],13,2,15,0],
		"1f423":[["\uD83D\uDC23"],"\uE523","\uDBB8\uDDDD",["hatching_chick"],13,3,15,0],
		"1f424":[["\uD83D\uDC24"],"\uE523","\uDBB8\uDDBA",["baby_chick"],13,4,15,0],
		"1f425":[["\uD83D\uDC25"],"\uE523","\uDBB8\uDDBB",["hatched_chick"],13,5,15,0],
		"1f426":[["\uD83D\uDC26"],"\uE521","\uDBB8\uDDC8",["bird"],13,6,15,0],
		"1f427":[["\uD83D\uDC27"],"\uE055","\uDBB8\uDDBC",["penguin"],13,7,15,0],
		"1f428":[["\uD83D\uDC28"],"\uE527","\uDBB8\uDDCD",["koala"],13,8,15,0],
		"1f429":[["\uD83D\uDC29"],"\uE052","\uDBB8\uDDD8",["poodle"],13,9,15,0],
		"1f42a":[["\uD83D\uDC2A"],"","",["dromedary_camel"],13,10,15,0],
		"1f42b":[["\uD83D\uDC2B"],"\uE530","\uDBB8\uDDD6",["camel"],13,11,15,0],
		"1f42c":[["\uD83D\uDC2C"],"\uE520","\uDBB8\uDDC7",["dolphin","flipper"],13,12,15,0],
		"1f42d":[["\uD83D\uDC2D"],"\uE053","\uDBB8\uDDC2",["mouse"],13,13,15,0],
		"1f42e":[["\uD83D\uDC2E"],"\uE52B","\uDBB8\uDDD1",["cow"],13,14,15,0],
		"1f42f":[["\uD83D\uDC2F"],"\uE050","\uDBB8\uDDC0",["tiger"],13,15,15,0],
		"1f430":[["\uD83D\uDC30"],"\uE52C","\uDBB8\uDDD2",["rabbit"],13,16,15,0],
		"1f431":[["\uD83D\uDC31"],"\uE04F","\uDBB8\uDDB8",["cat"],13,17,15,0],
		"1f432":[["\uD83D\uDC32"],"","\uDBB8\uDDDE",["dragon_face"],13,18,15,0],
		"1f433":[["\uD83D\uDC33"],"\uE054","\uDBB8\uDDC3",["whale"],13,19,15,0],
		"1f434":[["\uD83D\uDC34"],"\uE01A","\uDBB8\uDDBE",["horse"],13,20,15,0],
		"1f435":[["\uD83D\uDC35"],"\uE109","\uDBB8\uDDC4",["monkey_face"],13,21,15,0],
		"1f436":[["\uD83D\uDC36"],"\uE052","\uDBB8\uDDB7",["dog"],13,22,15,0],
		"1f437":[["\uD83D\uDC37"],"\uE10B","\uDBB8\uDDBF",["pig"],13,23,15,0],
		"1f438":[["\uD83D\uDC38"],"\uE531","\uDBB8\uDDD7",["frog"],13,24,15,0],
		"1f439":[["\uD83D\uDC39"],"\uE524","\uDBB8\uDDCA",["hamster"],13,25,15,0],
		"1f43a":[["\uD83D\uDC3A"],"\uE52A","\uDBB8\uDDD0",["wolf"],13,26,15,0],
		"1f43b":[["\uD83D\uDC3B"],"\uE051","\uDBB8\uDDC1",["bear"],13,27,15,0],
		"1f43c":[["\uD83D\uDC3C"],"","\uDBB8\uDDDF",["panda_face"],13,28,15,0],
		"1f43d":[["\uD83D\uDC3D"],"\uE10B","\uDBB8\uDDE0",["pig_nose"],13,29,15,0],
		"1f43e":[["\uD83D\uDC3E"],"\uE536","\uDBB8\uDDDB",["feet","paw_prints"],13,30,15,0],
		"1f43f":[["\uD83D\uDC3F"],"","",["chipmunk"],13,31,15,0],
		"1f440":[["\uD83D\uDC40"],"\uE419","\uDBB8\uDD90",["eyes"],13,32,15,0],
		"1f441":[["\uD83D\uDC41"],"","",["eye"],13,33,15,0],
		"1f442":[["\uD83D\uDC42"],"\uE41B","\uDBB8\uDD91",["ear"],13,34,15,0],
		"1f443":[["\uD83D\uDC43"],"\uE41A","\uDBB8\uDD92",["nose"],13,40,15,0],
		"1f444":[["\uD83D\uDC44"],"\uE41C","\uDBB8\uDD93",["lips"],14,5,15,0],
		"1f445":[["\uD83D\uDC45"],"\uE409","\uDBB8\uDD94",["tongue"],14,6,15,0],
		"1f446":[["\uD83D\uDC46"],"\uE22E","\uDBBA\uDF99",["point_up_2"],14,7,15,0],
		"1f447":[["\uD83D\uDC47"],"\uE22F","\uDBBA\uDF9A",["point_down"],14,13,15,0],
		"1f448":[["\uD83D\uDC48"],"\uE230","\uDBBA\uDF9B",["point_left"],14,19,15,0],
		"1f449":[["\uD83D\uDC49"],"\uE231","\uDBBA\uDF9C",["point_right"],14,25,15,0],
		"1f44a":[["\uD83D\uDC4A"],"\uE00D","\uDBBA\uDF96",["facepunch","punch"],14,31,15,0],
		"1f44b":[["\uD83D\uDC4B"],"\uE41E","\uDBBA\uDF9D",["wave"],14,37,15,0],
		"1f44c":[["\uD83D\uDC4C"],"\uE420","\uDBBA\uDF9F",["ok_hand"],15,2,15,0],
		"1f44d":[["\uD83D\uDC4D"],"\uE00E","\uDBBA\uDF97",["+1","thumbsup"],15,8,15,0],
		"1f44e":[["\uD83D\uDC4E"],"\uE421","\uDBBA\uDFA0",["-1","thumbsdown"],15,14,15,0],
		"1f44f":[["\uD83D\uDC4F"],"\uE41F","\uDBBA\uDF9E",["clap"],15,20,15,0],
		"1f450":[["\uD83D\uDC50"],"\uE422","\uDBBA\uDFA1",["open_hands"],15,26,15,0],
		"1f451":[["\uD83D\uDC51"],"\uE10E","\uDBB9\uDCD1",["crown"],15,32,15,0],
		"1f452":[["\uD83D\uDC52"],"\uE318","\uDBB9\uDCD4",["womans_hat"],15,33,15,0],
		"1f453":[["\uD83D\uDC53"],"","\uDBB9\uDCCE",["eyeglasses"],15,34,15,0],
		"1f454":[["\uD83D\uDC54"],"\uE302","\uDBB9\uDCD3",["necktie"],15,35,15,0],
		"1f455":[["\uD83D\uDC55"],"\uE006","\uDBB9\uDCCF",["shirt","tshirt"],15,36,15,0],
		"1f456":[["\uD83D\uDC56"],"","\uDBB9\uDCD0",["jeans"],15,37,15,0],
		"1f457":[["\uD83D\uDC57"],"\uE319","\uDBB9\uDCD5",["dress"],15,38,15,0],
		"1f458":[["\uD83D\uDC58"],"\uE321","\uDBB9\uDCD9",["kimono"],15,39,15,0],
		"1f459":[["\uD83D\uDC59"],"\uE322","\uDBB9\uDCDA",["bikini"],15,40,15,0],
		"1f45a":[["\uD83D\uDC5A"],"\uE006","\uDBB9\uDCDB",["womans_clothes"],16,0,15,0],
		"1f45b":[["\uD83D\uDC5B"],"","\uDBB9\uDCDC",["purse"],16,1,15,0],
		"1f45c":[["\uD83D\uDC5C"],"\uE323","\uDBB9\uDCF0",["handbag"],16,2,15,0],
		"1f45d":[["\uD83D\uDC5D"],"","\uDBB9\uDCF1",["pouch"],16,3,15,0],
		"1f45e":[["\uD83D\uDC5E"],"\uE007","\uDBB9\uDCCC",["mans_shoe","shoe"],16,4,15,0],
		"1f45f":[["\uD83D\uDC5F"],"\uE007","\uDBB9\uDCCD",["athletic_shoe"],16,5,15,0],
		"1f460":[["\uD83D\uDC60"],"\uE13E","\uDBB9\uDCD6",["high_heel"],16,6,15,0],
		"1f461":[["\uD83D\uDC61"],"\uE31A","\uDBB9\uDCD7",["sandal"],16,7,15,0],
		"1f462":[["\uD83D\uDC62"],"\uE31B","\uDBB9\uDCD8",["boot"],16,8,15,0],
		"1f463":[["\uD83D\uDC63"],"\uE536","\uDBB9\uDD53",["footprints"],16,9,15,0],
		"1f464":[["\uD83D\uDC64"],"","\uDBB8\uDD9A",["bust_in_silhouette"],16,10,15,0],
		"1f465":[["\uD83D\uDC65"],"","",["busts_in_silhouette"],16,11,15,0],
		"1f466":[["\uD83D\uDC66"],"\uE001","\uDBB8\uDD9B",["boy"],16,12,15,0],
		"1f467":[["\uD83D\uDC67"],"\uE002","\uDBB8\uDD9C",["girl"],16,18,15,0],
		"1f468":[["\uD83D\uDC68"],"\uE004","\uDBB8\uDD9D",["man"],16,24,15,0],
		"1f469":[["\uD83D\uDC69"],"\uE005","\uDBB8\uDD9E",["woman"],16,30,15,0],
		"1f46a":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC66","\uD83D\uDC6A"],"","\uDBB8\uDD9F",["family","man-woman-boy"],16,36,15,0],
		"1f46b":[["\uD83D\uDC6B"],"\uE428","\uDBB8\uDDA0",["couple","man_and_woman_holding_hands"],16,37,15,0],
		"1f46c":[["\uD83D\uDC6C"],"","",["two_men_holding_hands"],16,38,15,0],
		"1f46d":[["\uD83D\uDC6D"],"","",["two_women_holding_hands"],16,39,15,0],
		"1f46e":[["\uD83D\uDC6E"],"\uE152","\uDBB8\uDDA1",["cop"],16,40,15,0],
		"1f46f":[["\uD83D\uDC6F"],"\uE429","\uDBB8\uDDA2",["dancers"],17,5,15,0],
		"1f470":[["\uD83D\uDC70"],"","\uDBB8\uDDA3",["bride_with_veil"],17,6,15,0],
		"1f471":[["\uD83D\uDC71"],"\uE515","\uDBB8\uDDA4",["person_with_blond_hair"],17,12,15,0],
		"1f472":[["\uD83D\uDC72"],"\uE516","\uDBB8\uDDA5",["man_with_gua_pi_mao"],17,18,15,0],
		"1f473":[["\uD83D\uDC73"],"\uE517","\uDBB8\uDDA6",["man_with_turban"],17,24,15,0],
		"1f474":[["\uD83D\uDC74"],"\uE518","\uDBB8\uDDA7",["older_man"],17,30,15,0],
		"1f475":[["\uD83D\uDC75"],"\uE519","\uDBB8\uDDA8",["older_woman"],17,36,15,0],
		"1f476":[["\uD83D\uDC76"],"\uE51A","\uDBB8\uDDA9",["baby"],18,1,15,0],
		"1f477":[["\uD83D\uDC77"],"\uE51B","\uDBB8\uDDAA",["construction_worker"],18,7,15,0],
		"1f478":[["\uD83D\uDC78"],"\uE51C","\uDBB8\uDDAB",["princess"],18,13,15,0],
		"1f479":[["\uD83D\uDC79"],"","\uDBB8\uDDAC",["japanese_ogre"],18,19,15,0],
		"1f47a":[["\uD83D\uDC7A"],"","\uDBB8\uDDAD",["japanese_goblin"],18,20,15,0],
		"1f47b":[["\uD83D\uDC7B"],"\uE11B","\uDBB8\uDDAE",["ghost"],18,21,15,0],
		"1f47c":[["\uD83D\uDC7C"],"\uE04E","\uDBB8\uDDAF",["angel"],18,22,15,0],
		"1f47d":[["\uD83D\uDC7D"],"\uE10C","\uDBB8\uDDB0",["alien"],18,28,15,0],
		"1f47e":[["\uD83D\uDC7E"],"\uE12B","\uDBB8\uDDB1",["space_invader"],18,29,15,0],
		"1f47f":[["\uD83D\uDC7F"],"\uE11A","\uDBB8\uDDB2",["imp"],18,30,15,0],
		"1f480":[["\uD83D\uDC80"],"\uE11C","\uDBB8\uDDB3",["skull"],18,31,15,0],
		"1f481":[["\uD83D\uDC81"],"\uE253","\uDBB8\uDDB4",["information_desk_person"],18,32,15,0],
		"1f482":[["\uD83D\uDC82"],"\uE51E","\uDBB8\uDDB5",["guardsman"],18,38,15,0],
		"1f483":[["\uD83D\uDC83"],"\uE51F","\uDBB8\uDDB6",["dancer"],19,3,15,0],
		"1f484":[["\uD83D\uDC84"],"\uE31C","\uDBB8\uDD95",["lipstick"],19,9,15,0],
		"1f485":[["\uD83D\uDC85"],"\uE31D","\uDBB8\uDD96",["nail_care"],19,10,15,0],
		"1f486":[["\uD83D\uDC86"],"\uE31E","\uDBB8\uDD97",["massage"],19,16,15,0],
		"1f487":[["\uD83D\uDC87"],"\uE31F","\uDBB8\uDD98",["haircut"],19,22,15,0],
		"1f488":[["\uD83D\uDC88"],"\uE320","\uDBB8\uDD99",["barber"],19,28,15,0],
		"1f489":[["\uD83D\uDC89"],"\uE13B","\uDBB9\uDD09",["syringe"],19,29,15,0],
		"1f48a":[["\uD83D\uDC8A"],"\uE30F","\uDBB9\uDD0A",["pill"],19,30,15,0],
		"1f48b":[["\uD83D\uDC8B"],"\uE003","\uDBBA\uDC23",["kiss"],19,31,15,0],
		"1f48c":[["\uD83D\uDC8C"],"\uE103\uE328","\uDBBA\uDC24",["love_letter"],19,32,15,0],
		"1f48d":[["\uD83D\uDC8D"],"\uE034","\uDBBA\uDC25",["ring"],19,33,15,0],
		"1f48e":[["\uD83D\uDC8E"],"\uE035","\uDBBA\uDC26",["gem"],19,34,15,0],
		"1f48f":[["\uD83D\uDC8F"],"\uE111","\uDBBA\uDC27",["couplekiss"],19,35,15,0],
		"1f490":[["\uD83D\uDC90"],"\uE306","\uDBBA\uDC28",["bouquet"],19,36,15,0],
		"1f491":[["\uD83D\uDC91"],"\uE425","\uDBBA\uDC29",["couple_with_heart"],19,37,15,0],
		"1f492":[["\uD83D\uDC92"],"\uE43D","\uDBBA\uDC2A",["wedding"],19,38,15,0],
		"1f493":[["\uD83D\uDC93"],"\uE327","\uDBBA\uDF0D",["heartbeat"],19,39,15,0],
		"1f494":[["\uD83D\uDC94"],"\uE023","\uDBBA\uDF0E",["broken_heart"],19,40,15,0,"<\/3"],
		"1f495":[["\uD83D\uDC95"],"\uE327","\uDBBA\uDF0F",["two_hearts"],20,0,15,0],
		"1f496":[["\uD83D\uDC96"],"\uE327","\uDBBA\uDF10",["sparkling_heart"],20,1,15,0],
		"1f497":[["\uD83D\uDC97"],"\uE328","\uDBBA\uDF11",["heartpulse"],20,2,15,0],
		"1f498":[["\uD83D\uDC98"],"\uE329","\uDBBA\uDF12",["cupid"],20,3,15,0],
		"1f499":[["\uD83D\uDC99"],"\uE32A","\uDBBA\uDF13",["blue_heart"],20,4,15,0,"<3"],
		"1f49a":[["\uD83D\uDC9A"],"\uE32B","\uDBBA\uDF14",["green_heart"],20,5,15,0,"<3"],
		"1f49b":[["\uD83D\uDC9B"],"\uE32C","\uDBBA\uDF15",["yellow_heart"],20,6,15,0,"<3"],
		"1f49c":[["\uD83D\uDC9C"],"\uE32D","\uDBBA\uDF16",["purple_heart"],20,7,15,0,"<3"],
		"1f49d":[["\uD83D\uDC9D"],"\uE437","\uDBBA\uDF17",["gift_heart"],20,8,15,0],
		"1f49e":[["\uD83D\uDC9E"],"\uE327","\uDBBA\uDF18",["revolving_hearts"],20,9,15,0],
		"1f49f":[["\uD83D\uDC9F"],"\uE204","\uDBBA\uDF19",["heart_decoration"],20,10,15,0],
		"1f4a0":[["\uD83D\uDCA0"],"","\uDBBA\uDF55",["diamond_shape_with_a_dot_inside"],20,11,15,0],
		"1f4a1":[["\uD83D\uDCA1"],"\uE10F","\uDBBA\uDF56",["bulb"],20,12,15,0],
		"1f4a2":[["\uD83D\uDCA2"],"\uE334","\uDBBA\uDF57",["anger"],20,13,15,0],
		"1f4a3":[["\uD83D\uDCA3"],"\uE311","\uDBBA\uDF58",["bomb"],20,14,15,0],
		"1f4a4":[["\uD83D\uDCA4"],"\uE13C","\uDBBA\uDF59",["zzz"],20,15,15,0],
		"1f4a5":[["\uD83D\uDCA5"],"","\uDBBA\uDF5A",["boom","collision"],20,16,15,0],
		"1f4a6":[["\uD83D\uDCA6"],"\uE331","\uDBBA\uDF5B",["sweat_drops"],20,17,15,0],
		"1f4a7":[["\uD83D\uDCA7"],"\uE331","\uDBBA\uDF5C",["droplet"],20,18,15,0],
		"1f4a8":[["\uD83D\uDCA8"],"\uE330","\uDBBA\uDF5D",["dash"],20,19,15,0],
		"1f4a9":[["\uD83D\uDCA9"],"\uE05A","\uDBB9\uDCF4",["hankey","poop","shit"],20,20,15,0],
		"1f4aa":[["\uD83D\uDCAA"],"\uE14C","\uDBBA\uDF5E",["muscle"],20,21,15,0],
		"1f4ab":[["\uD83D\uDCAB"],"\uE407","\uDBBA\uDF5F",["dizzy"],20,27,15,0],
		"1f4ac":[["\uD83D\uDCAC"],"","\uDBB9\uDD32",["speech_balloon"],20,28,15,0],
		"1f4ad":[["\uD83D\uDCAD"],"","",["thought_balloon"],20,29,15,0],
		"1f4ae":[["\uD83D\uDCAE"],"","\uDBBA\uDF7A",["white_flower"],20,30,15,0],
		"1f4af":[["\uD83D\uDCAF"],"","\uDBBA\uDF7B",["100"],20,31,15,0],
		"1f4b0":[["\uD83D\uDCB0"],"\uE12F","\uDBB9\uDCDD",["moneybag"],20,32,15,0],
		"1f4b1":[["\uD83D\uDCB1"],"\uE149","\uDBB9\uDCDE",["currency_exchange"],20,33,15,0],
		"1f4b2":[["\uD83D\uDCB2"],"\uE12F","\uDBB9\uDCE0",["heavy_dollar_sign"],20,34,15,0],
		"1f4b3":[["\uD83D\uDCB3"],"","\uDBB9\uDCE1",["credit_card"],20,35,15,0],
		"1f4b4":[["\uD83D\uDCB4"],"","\uDBB9\uDCE2",["yen"],20,36,15,0],
		"1f4b5":[["\uD83D\uDCB5"],"\uE12F","\uDBB9\uDCE3",["dollar"],20,37,15,0],
		"1f4b6":[["\uD83D\uDCB6"],"","",["euro"],20,38,15,0],
		"1f4b7":[["\uD83D\uDCB7"],"","",["pound"],20,39,15,0],
		"1f4b8":[["\uD83D\uDCB8"],"","\uDBB9\uDCE4",["money_with_wings"],20,40,15,0],
		"1f4b9":[["\uD83D\uDCB9"],"\uE14A","\uDBB9\uDCDF",["chart"],21,0,15,0],
		"1f4ba":[["\uD83D\uDCBA"],"\uE11F","\uDBB9\uDD37",["seat"],21,1,15,0],
		"1f4bb":[["\uD83D\uDCBB"],"\uE00C","\uDBB9\uDD38",["computer"],21,2,15,0],
		"1f4bc":[["\uD83D\uDCBC"],"\uE11E","\uDBB9\uDD3B",["briefcase"],21,3,15,0],
		"1f4bd":[["\uD83D\uDCBD"],"\uE316","\uDBB9\uDD3C",["minidisc"],21,4,15,0],
		"1f4be":[["\uD83D\uDCBE"],"\uE316","\uDBB9\uDD3D",["floppy_disk"],21,5,15,0],
		"1f4bf":[["\uD83D\uDCBF"],"\uE126","\uDBBA\uDC1D",["cd"],21,6,15,0],
		"1f4c0":[["\uD83D\uDCC0"],"\uE127","\uDBBA\uDC1E",["dvd"],21,7,15,0],
		"1f4c1":[["\uD83D\uDCC1"],"","\uDBB9\uDD43",["file_folder"],21,8,15,0],
		"1f4c2":[["\uD83D\uDCC2"],"","\uDBB9\uDD44",["open_file_folder"],21,9,15,0],
		"1f4c3":[["\uD83D\uDCC3"],"\uE301","\uDBB9\uDD40",["page_with_curl"],21,10,15,0],
		"1f4c4":[["\uD83D\uDCC4"],"\uE301","\uDBB9\uDD41",["page_facing_up"],21,11,15,0],
		"1f4c5":[["\uD83D\uDCC5"],"","\uDBB9\uDD42",["date"],21,12,15,0],
		"1f4c6":[["\uD83D\uDCC6"],"","\uDBB9\uDD49",["calendar"],21,13,15,0],
		"1f4c7":[["\uD83D\uDCC7"],"\uE148","\uDBB9\uDD4D",["card_index"],21,14,15,0],
		"1f4c8":[["\uD83D\uDCC8"],"\uE14A","\uDBB9\uDD4B",["chart_with_upwards_trend"],21,15,15,0],
		"1f4c9":[["\uD83D\uDCC9"],"","\uDBB9\uDD4C",["chart_with_downwards_trend"],21,16,15,0],
		"1f4ca":[["\uD83D\uDCCA"],"\uE14A","\uDBB9\uDD4A",["bar_chart"],21,17,15,0],
		"1f4cb":[["\uD83D\uDCCB"],"\uE301","\uDBB9\uDD48",["clipboard"],21,18,15,0],
		"1f4cc":[["\uD83D\uDCCC"],"","\uDBB9\uDD4E",["pushpin"],21,19,15,0],
		"1f4cd":[["\uD83D\uDCCD"],"","\uDBB9\uDD3F",["round_pushpin"],21,20,15,0],
		"1f4ce":[["\uD83D\uDCCE"],"","\uDBB9\uDD3A",["paperclip"],21,21,15,0],
		"1f4cf":[["\uD83D\uDCCF"],"","\uDBB9\uDD50",["straight_ruler"],21,22,15,0],
		"1f4d0":[["\uD83D\uDCD0"],"","\uDBB9\uDD51",["triangular_ruler"],21,23,15,0],
		"1f4d1":[["\uD83D\uDCD1"],"\uE301","\uDBB9\uDD52",["bookmark_tabs"],21,24,15,0],
		"1f4d2":[["\uD83D\uDCD2"],"\uE148","\uDBB9\uDD4F",["ledger"],21,25,15,0],
		"1f4d3":[["\uD83D\uDCD3"],"\uE148","\uDBB9\uDD45",["notebook"],21,26,15,0],
		"1f4d4":[["\uD83D\uDCD4"],"\uE148","\uDBB9\uDD47",["notebook_with_decorative_cover"],21,27,15,0],
		"1f4d5":[["\uD83D\uDCD5"],"\uE148","\uDBB9\uDD02",["closed_book"],21,28,15,0],
		"1f4d6":[["\uD83D\uDCD6"],"\uE148","\uDBB9\uDD46",["book","open_book"],21,29,15,0],
		"1f4d7":[["\uD83D\uDCD7"],"\uE148","\uDBB9\uDCFF",["green_book"],21,30,15,0],
		"1f4d8":[["\uD83D\uDCD8"],"\uE148","\uDBB9\uDD00",["blue_book"],21,31,15,0],
		"1f4d9":[["\uD83D\uDCD9"],"\uE148","\uDBB9\uDD01",["orange_book"],21,32,15,0],
		"1f4da":[["\uD83D\uDCDA"],"\uE148","\uDBB9\uDD03",["books"],21,33,15,0],
		"1f4db":[["\uD83D\uDCDB"],"","\uDBB9\uDD04",["name_badge"],21,34,15,0],
		"1f4dc":[["\uD83D\uDCDC"],"","\uDBB9\uDCFD",["scroll"],21,35,15,0],
		"1f4dd":[["\uD83D\uDCDD"],"\uE301","\uDBB9\uDD27",["memo","pencil"],21,36,15,0],
		"1f4de":[["\uD83D\uDCDE"],"\uE009","\uDBB9\uDD24",["telephone_receiver"],21,37,15,0],
		"1f4df":[["\uD83D\uDCDF"],"","\uDBB9\uDD22",["pager"],21,38,15,0],
		"1f4e0":[["\uD83D\uDCE0"],"\uE00B","\uDBB9\uDD28",["fax"],21,39,15,0],
		"1f4e1":[["\uD83D\uDCE1"],"\uE14B","\uDBB9\uDD31",["satellite"],21,40,15,0],
		"1f4e2":[["\uD83D\uDCE2"],"\uE142","\uDBB9\uDD2F",["loudspeaker"],22,0,15,0],
		"1f4e3":[["\uD83D\uDCE3"],"\uE317","\uDBB9\uDD30",["mega"],22,1,15,0],
		"1f4e4":[["\uD83D\uDCE4"],"","\uDBB9\uDD33",["outbox_tray"],22,2,15,0],
		"1f4e5":[["\uD83D\uDCE5"],"","\uDBB9\uDD34",["inbox_tray"],22,3,15,0],
		"1f4e6":[["\uD83D\uDCE6"],"\uE112","\uDBB9\uDD35",["package"],22,4,15,0],
		"1f4e7":[["\uD83D\uDCE7"],"\uE103","\uDBBA\uDF92",["e-mail"],22,5,15,0],
		"1f4e8":[["\uD83D\uDCE8"],"\uE103","\uDBB9\uDD2A",["incoming_envelope"],22,6,15,0],
		"1f4e9":[["\uD83D\uDCE9"],"\uE103","\uDBB9\uDD2B",["envelope_with_arrow"],22,7,15,0],
		"1f4ea":[["\uD83D\uDCEA"],"\uE101","\uDBB9\uDD2C",["mailbox_closed"],22,8,15,0],
		"1f4eb":[["\uD83D\uDCEB"],"\uE101","\uDBB9\uDD2D",["mailbox"],22,9,15,0],
		"1f4ec":[["\uD83D\uDCEC"],"","",["mailbox_with_mail"],22,10,15,0],
		"1f4ed":[["\uD83D\uDCED"],"","",["mailbox_with_no_mail"],22,11,15,0],
		"1f4ee":[["\uD83D\uDCEE"],"\uE102","\uDBB9\uDD2E",["postbox"],22,12,15,0],
		"1f4ef":[["\uD83D\uDCEF"],"","",["postal_horn"],22,13,15,0],
		"1f4f0":[["\uD83D\uDCF0"],"","\uDBBA\uDC22",["newspaper"],22,14,15,0],
		"1f4f1":[["\uD83D\uDCF1"],"\uE00A","\uDBB9\uDD25",["iphone"],22,15,15,0],
		"1f4f2":[["\uD83D\uDCF2"],"\uE104","\uDBB9\uDD26",["calling"],22,16,15,0],
		"1f4f3":[["\uD83D\uDCF3"],"\uE250","\uDBBA\uDC39",["vibration_mode"],22,17,15,0],
		"1f4f4":[["\uD83D\uDCF4"],"\uE251","\uDBBA\uDC3A",["mobile_phone_off"],22,18,15,0],
		"1f4f5":[["\uD83D\uDCF5"],"","",["no_mobile_phones"],22,19,15,0],
		"1f4f6":[["\uD83D\uDCF6"],"\uE20B","\uDBBA\uDC38",["signal_strength"],22,20,15,0],
		"1f4f7":[["\uD83D\uDCF7"],"\uE008","\uDBB9\uDCEF",["camera"],22,21,15,0],
		"1f4f8":[["\uD83D\uDCF8"],"","",["camera_with_flash"],22,22,15,0],
		"1f4f9":[["\uD83D\uDCF9"],"\uE03D","\uDBB9\uDCF9",["video_camera"],22,23,15,0],
		"1f4fa":[["\uD83D\uDCFA"],"\uE12A","\uDBBA\uDC1C",["tv"],22,24,15,0],
		"1f4fb":[["\uD83D\uDCFB"],"\uE128","\uDBBA\uDC1F",["radio"],22,25,15,0],
		"1f4fc":[["\uD83D\uDCFC"],"\uE129","\uDBBA\uDC20",["vhs"],22,26,15,0],
		"1f4fd":[["\uD83D\uDCFD"],"","",["film_projector"],22,27,15,0],
		"1f4ff":[["\uD83D\uDCFF"],"","",["prayer_beads"],22,28,7,0],
		"1f500":[["\uD83D\uDD00"],"","",["twisted_rightwards_arrows"],22,29,15,0],
		"1f501":[["\uD83D\uDD01"],"","",["repeat"],22,30,15,0],
		"1f502":[["\uD83D\uDD02"],"","",["repeat_one"],22,31,15,0],
		"1f503":[["\uD83D\uDD03"],"","\uDBBA\uDF91",["arrows_clockwise"],22,32,15,0],
		"1f504":[["\uD83D\uDD04"],"","",["arrows_counterclockwise"],22,33,15,0],
		"1f505":[["\uD83D\uDD05"],"","",["low_brightness"],22,34,15,0],
		"1f506":[["\uD83D\uDD06"],"","",["high_brightness"],22,35,15,0],
		"1f507":[["\uD83D\uDD07"],"","",["mute"],22,36,15,0],
		"1f508":[["\uD83D\uDD08"],"","",["speaker"],22,37,15,0],
		"1f509":[["\uD83D\uDD09"],"","",["sound"],22,38,15,0],
		"1f50a":[["\uD83D\uDD0A"],"\uE141","\uDBBA\uDC21",["loud_sound"],22,39,15,0],
		"1f50b":[["\uD83D\uDD0B"],"","\uDBB9\uDCFC",["battery"],22,40,15,0],
		"1f50c":[["\uD83D\uDD0C"],"","\uDBB9\uDCFE",["electric_plug"],23,0,15,0],
		"1f50d":[["\uD83D\uDD0D"],"\uE114","\uDBBA\uDF85",["mag"],23,1,15,0],
		"1f50e":[["\uD83D\uDD0E"],"\uE114","\uDBBA\uDF8D",["mag_right"],23,2,15,0],
		"1f50f":[["\uD83D\uDD0F"],"\uE144","\uDBBA\uDF90",["lock_with_ink_pen"],23,3,15,0],
		"1f510":[["\uD83D\uDD10"],"\uE144","\uDBBA\uDF8A",["closed_lock_with_key"],23,4,15,0],
		"1f511":[["\uD83D\uDD11"],"\uE03F","\uDBBA\uDF82",["key"],23,5,15,0],
		"1f512":[["\uD83D\uDD12"],"\uE144","\uDBBA\uDF86",["lock"],23,6,15,0],
		"1f513":[["\uD83D\uDD13"],"\uE145","\uDBBA\uDF87",["unlock"],23,7,15,0],
		"1f514":[["\uD83D\uDD14"],"\uE325","\uDBB9\uDCF2",["bell"],23,8,15,0],
		"1f515":[["\uD83D\uDD15"],"","",["no_bell"],23,9,15,0],
		"1f516":[["\uD83D\uDD16"],"","\uDBBA\uDF8F",["bookmark"],23,10,15,0],
		"1f517":[["\uD83D\uDD17"],"","\uDBBA\uDF4B",["link"],23,11,15,0],
		"1f518":[["\uD83D\uDD18"],"","\uDBBA\uDF8C",["radio_button"],23,12,15,0],
		"1f519":[["\uD83D\uDD19"],"\uE235","\uDBBA\uDF8E",["back"],23,13,15,0],
		"1f51a":[["\uD83D\uDD1A"],"","\uDBB8\uDC1A",["end"],23,14,15,0],
		"1f51b":[["\uD83D\uDD1B"],"","\uDBB8\uDC19",["on"],23,15,15,0],
		"1f51c":[["\uD83D\uDD1C"],"","\uDBB8\uDC18",["soon"],23,16,15,0],
		"1f51d":[["\uD83D\uDD1D"],"\uE24C","\uDBBA\uDF42",["top"],23,17,15,0],
		"1f51e":[["\uD83D\uDD1E"],"\uE207","\uDBBA\uDF25",["underage"],23,18,15,0],
		"1f51f":[["\uD83D\uDD1F"],"","\uDBBA\uDC3B",["keycap_ten"],23,19,15,0],
		"1f520":[["\uD83D\uDD20"],"","\uDBBA\uDF7C",["capital_abcd"],23,20,15,0],
		"1f521":[["\uD83D\uDD21"],"","\uDBBA\uDF7D",["abcd"],23,21,15,0],
		"1f522":[["\uD83D\uDD22"],"","\uDBBA\uDF7E",["1234"],23,22,15,0],
		"1f523":[["\uD83D\uDD23"],"","\uDBBA\uDF7F",["symbols"],23,23,15,0],
		"1f524":[["\uD83D\uDD24"],"","\uDBBA\uDF80",["abc"],23,24,15,0],
		"1f525":[["\uD83D\uDD25"],"\uE11D","\uDBB9\uDCF6",["fire"],23,25,15,0],
		"1f526":[["\uD83D\uDD26"],"","\uDBB9\uDCFB",["flashlight"],23,26,15,0],
		"1f527":[["\uD83D\uDD27"],"","\uDBB9\uDCC9",["wrench"],23,27,15,0],
		"1f528":[["\uD83D\uDD28"],"\uE116","\uDBB9\uDCCA",["hammer"],23,28,15,0],
		"1f529":[["\uD83D\uDD29"],"","\uDBB9\uDCCB",["nut_and_bolt"],23,29,15,0],
		"1f52a":[["\uD83D\uDD2A"],"","\uDBB9\uDCFA",["hocho","knife"],23,30,15,0],
		"1f52b":[["\uD83D\uDD2B"],"\uE113","\uDBB9\uDCF5",["gun"],23,31,15,0],
		"1f52c":[["\uD83D\uDD2C"],"","",["microscope"],23,32,15,0],
		"1f52d":[["\uD83D\uDD2D"],"","",["telescope"],23,33,15,0],
		"1f52e":[["\uD83D\uDD2E"],"\uE23E","\uDBB9\uDCF7",["crystal_ball"],23,34,15,0],
		"1f52f":[["\uD83D\uDD2F"],"\uE23E","\uDBB9\uDCF8",["six_pointed_star"],23,35,15,0],
		"1f530":[["\uD83D\uDD30"],"\uE209","\uDBB8\uDC44",["beginner"],23,36,15,0],
		"1f531":[["\uD83D\uDD31"],"\uE031","\uDBB9\uDCD2",["trident"],23,37,15,0],
		"1f532":[["\uD83D\uDD32"],"\uE21A","\uDBBA\uDF64",["black_square_button"],23,38,15,0],
		"1f533":[["\uD83D\uDD33"],"\uE21B","\uDBBA\uDF67",["white_square_button"],23,39,15,0],
		"1f534":[["\uD83D\uDD34"],"\uE219","\uDBBA\uDF63",["red_circle"],23,40,15,0],
		"1f535":[["\uD83D\uDD35"],"\uE21A","\uDBBA\uDF64",["large_blue_circle"],24,0,15,0],
		"1f536":[["\uD83D\uDD36"],"\uE21B","\uDBBA\uDF73",["large_orange_diamond"],24,1,15,0],
		"1f537":[["\uD83D\uDD37"],"\uE21B","\uDBBA\uDF74",["large_blue_diamond"],24,2,15,0],
		"1f538":[["\uD83D\uDD38"],"\uE21B","\uDBBA\uDF75",["small_orange_diamond"],24,3,15,0],
		"1f539":[["\uD83D\uDD39"],"\uE21B","\uDBBA\uDF76",["small_blue_diamond"],24,4,15,0],
		"1f53a":[["\uD83D\uDD3A"],"","\uDBBA\uDF78",["small_red_triangle"],24,5,15,0],
		"1f53b":[["\uD83D\uDD3B"],"","\uDBBA\uDF79",["small_red_triangle_down"],24,6,15,0],
		"1f53c":[["\uD83D\uDD3C"],"","\uDBBA\uDF01",["arrow_up_small"],24,7,15,0],
		"1f53d":[["\uD83D\uDD3D"],"","\uDBBA\uDF00",["arrow_down_small"],24,8,15,0],
		"1f549":[["\uD83D\uDD49"],"","",["om_symbol"],24,9,15,0],
		"1f54a":[["\uD83D\uDD4A"],"","",["dove_of_peace"],24,10,15,0],
		"1f54b":[["\uD83D\uDD4B"],"","",["kaaba"],24,11,7,0],
		"1f54c":[["\uD83D\uDD4C"],"","",["mosque"],24,12,7,0],
		"1f54d":[["\uD83D\uDD4D"],"","",["synagogue"],24,13,7,0],
		"1f54e":[["\uD83D\uDD4E"],"","",["menorah_with_nine_branches"],24,14,7,0],
		"1f550":[["\uD83D\uDD50"],"\uE024","\uDBB8\uDC1E",["clock1"],24,15,15,0],
		"1f551":[["\uD83D\uDD51"],"\uE025","\uDBB8\uDC1F",["clock2"],24,16,15,0],
		"1f552":[["\uD83D\uDD52"],"\uE026","\uDBB8\uDC20",["clock3"],24,17,15,0],
		"1f553":[["\uD83D\uDD53"],"\uE027","\uDBB8\uDC21",["clock4"],24,18,15,0],
		"1f554":[["\uD83D\uDD54"],"\uE028","\uDBB8\uDC22",["clock5"],24,19,15,0],
		"1f555":[["\uD83D\uDD55"],"\uE029","\uDBB8\uDC23",["clock6"],24,20,15,0],
		"1f556":[["\uD83D\uDD56"],"\uE02A","\uDBB8\uDC24",["clock7"],24,21,15,0],
		"1f557":[["\uD83D\uDD57"],"\uE02B","\uDBB8\uDC25",["clock8"],24,22,15,0],
		"1f558":[["\uD83D\uDD58"],"\uE02C","\uDBB8\uDC26",["clock9"],24,23,15,0],
		"1f559":[["\uD83D\uDD59"],"\uE02D","\uDBB8\uDC27",["clock10"],24,24,15,0],
		"1f55a":[["\uD83D\uDD5A"],"\uE02E","\uDBB8\uDC28",["clock11"],24,25,15,0],
		"1f55b":[["\uD83D\uDD5B"],"\uE02F","\uDBB8\uDC29",["clock12"],24,26,15,0],
		"1f55c":[["\uD83D\uDD5C"],"","",["clock130"],24,27,15,0],
		"1f55d":[["\uD83D\uDD5D"],"","",["clock230"],24,28,15,0],
		"1f55e":[["\uD83D\uDD5E"],"","",["clock330"],24,29,15,0],
		"1f55f":[["\uD83D\uDD5F"],"","",["clock430"],24,30,15,0],
		"1f560":[["\uD83D\uDD60"],"","",["clock530"],24,31,15,0],
		"1f561":[["\uD83D\uDD61"],"","",["clock630"],24,32,15,0],
		"1f562":[["\uD83D\uDD62"],"","",["clock730"],24,33,15,0],
		"1f563":[["\uD83D\uDD63"],"","",["clock830"],24,34,15,0],
		"1f564":[["\uD83D\uDD64"],"","",["clock930"],24,35,15,0],
		"1f565":[["\uD83D\uDD65"],"","",["clock1030"],24,36,15,0],
		"1f566":[["\uD83D\uDD66"],"","",["clock1130"],24,37,15,0],
		"1f567":[["\uD83D\uDD67"],"","",["clock1230"],24,38,15,0],
		"1f56f":[["\uD83D\uDD6F"],"","",["candle"],24,39,15,0],
		"1f570":[["\uD83D\uDD70"],"","",["mantelpiece_clock"],24,40,15,0],
		"1f573":[["\uD83D\uDD73"],"","",["hole"],25,0,15,0],
		"1f574":[["\uD83D\uDD74"],"","",["man_in_business_suit_levitating"],25,1,15,0],
		"1f575":[["\uD83D\uDD75"],"","",["sleuth_or_spy"],25,2,15,0],
		"1f576":[["\uD83D\uDD76"],"","",["dark_sunglasses"],25,3,15,0],
		"1f577":[["\uD83D\uDD77"],"","",["spider"],25,4,15,0],
		"1f578":[["\uD83D\uDD78"],"","",["spider_web"],25,5,15,0],
		"1f579":[["\uD83D\uDD79"],"","",["joystick"],25,6,15,0],
		"1f587":[["\uD83D\uDD87"],"","",["linked_paperclips"],25,7,15,0],
		"1f58a":[["\uD83D\uDD8A"],"","",["lower_left_ballpoint_pen"],25,8,15,0],
		"1f58b":[["\uD83D\uDD8B"],"","",["lower_left_fountain_pen"],25,9,15,0],
		"1f58c":[["\uD83D\uDD8C"],"","",["lower_left_paintbrush"],25,10,15,0],
		"1f58d":[["\uD83D\uDD8D"],"","",["lower_left_crayon"],25,11,15,0],
		"1f590":[["\uD83D\uDD90"],"","",["raised_hand_with_fingers_splayed"],25,12,15,0],
		"1f595":[["\uD83D\uDD95"],"","",["middle_finger","reversed_hand_with_middle_finger_extended"],25,18,15,0],
		"1f596":[["\uD83D\uDD96"],"","",["spock-hand"],25,24,15,0],
		"1f5a5":[["\uD83D\uDDA5"],"","",["desktop_computer"],25,30,15,0],
		"1f5a8":[["\uD83D\uDDA8"],"","",["printer"],25,31,15,0],
		"1f5b1":[["\uD83D\uDDB1"],"","",["three_button_mouse"],25,32,7,0],
		"1f5b2":[["\uD83D\uDDB2"],"","",["trackball"],25,33,15,0],
		"1f5bc":[["\uD83D\uDDBC"],"","",["frame_with_picture"],25,34,15,0],
		"1f5c2":[["\uD83D\uDDC2"],"","",["card_index_dividers"],25,35,15,0],
		"1f5c3":[["\uD83D\uDDC3"],"","",["card_file_box"],25,36,15,0],
		"1f5c4":[["\uD83D\uDDC4"],"","",["file_cabinet"],25,37,15,0],
		"1f5d1":[["\uD83D\uDDD1"],"","",["wastebasket"],25,38,15,0],
		"1f5d2":[["\uD83D\uDDD2"],"","",["spiral_note_pad"],25,39,15,0],
		"1f5d3":[["\uD83D\uDDD3"],"","",["spiral_calendar_pad"],25,40,15,0],
		"1f5dc":[["\uD83D\uDDDC"],"","",["compression"],26,0,15,0],
		"1f5dd":[["\uD83D\uDDDD"],"","",["old_key"],26,1,15,0],
		"1f5de":[["\uD83D\uDDDE"],"","",["rolled_up_newspaper"],26,2,15,0],
		"1f5e1":[["\uD83D\uDDE1"],"","",["dagger_knife"],26,3,15,0],
		"1f5e3":[["\uD83D\uDDE3"],"","",["speaking_head_in_silhouette"],26,4,15,0],
		"1f5e8":[["\uD83D\uDDE8"],"","",["left_speech_bubble"],26,5,15,0],
		"1f5ef":[["\uD83D\uDDEF"],"","",["right_anger_bubble"],26,6,15,0],
		"1f5f3":[["\uD83D\uDDF3"],"","",["ballot_box_with_ballot"],26,7,15,0],
		"1f5fa":[["\uD83D\uDDFA"],"","",["world_map"],26,8,15,0],
		"1f5fb":[["\uD83D\uDDFB"],"\uE03B","\uDBB9\uDCC3",["mount_fuji"],26,9,15,0],
		"1f5fc":[["\uD83D\uDDFC"],"\uE509","\uDBB9\uDCC4",["tokyo_tower"],26,10,15,0],
		"1f5fd":[["\uD83D\uDDFD"],"\uE51D","\uDBB9\uDCC6",["statue_of_liberty"],26,11,15,0],
		"1f5fe":[["\uD83D\uDDFE"],"","\uDBB9\uDCC7",["japan"],26,12,15,0],
		"1f5ff":[["\uD83D\uDDFF"],"","\uDBB9\uDCC8",["moyai"],26,13,15,0],
		"1f600":[["\uD83D\uDE00"],"","",["grinning"],26,14,15,0,":D"],
		"1f601":[["\uD83D\uDE01"],"\uE404","\uDBB8\uDF33",["grin"],26,15,15,0],
		"1f602":[["\uD83D\uDE02"],"\uE412","\uDBB8\uDF34",["joy"],26,16,15,0],
		"1f603":[["\uD83D\uDE03"],"\uE057","\uDBB8\uDF30",["smiley"],26,17,15,0,":)"],
		"1f604":[["\uD83D\uDE04"],"\uE415","\uDBB8\uDF38",["smile"],26,18,15,0,":)"],
		"1f605":[["\uD83D\uDE05"],"\uE415\uE331","\uDBB8\uDF31",["sweat_smile"],26,19,15,0],
		"1f606":[["\uD83D\uDE06"],"\uE40A","\uDBB8\uDF32",["laughing","satisfied"],26,20,15,0],
		"1f607":[["\uD83D\uDE07"],"","",["innocent"],26,21,15,0],
		"1f608":[["\uD83D\uDE08"],"","",["smiling_imp"],26,22,15,0],
		"1f609":[["\uD83D\uDE09"],"\uE405","\uDBB8\uDF47",["wink"],26,23,15,0,";)"],
		"1f60a":[["\uD83D\uDE0A"],"\uE056","\uDBB8\uDF35",["blush"],26,24,15,0,":)"],
		"1f60b":[["\uD83D\uDE0B"],"\uE056","\uDBB8\uDF2B",["yum"],26,25,15,0],
		"1f60c":[["\uD83D\uDE0C"],"\uE40A","\uDBB8\uDF3E",["relieved"],26,26,15,0],
		"1f60d":[["\uD83D\uDE0D"],"\uE106","\uDBB8\uDF27",["heart_eyes"],26,27,15,0],
		"1f60e":[["\uD83D\uDE0E"],"","",["sunglasses"],26,28,15,0],
		"1f60f":[["\uD83D\uDE0F"],"\uE402","\uDBB8\uDF43",["smirk"],26,29,15,0],
		"1f610":[["\uD83D\uDE10"],"","",["neutral_face"],26,30,15,0],
		"1f611":[["\uD83D\uDE11"],"","",["expressionless"],26,31,15,0],
		"1f612":[["\uD83D\uDE12"],"\uE40E","\uDBB8\uDF26",["unamused"],26,32,15,0,":("],
		"1f613":[["\uD83D\uDE13"],"\uE108","\uDBB8\uDF44",["sweat"],26,33,15,0],
		"1f614":[["\uD83D\uDE14"],"\uE403","\uDBB8\uDF40",["pensive"],26,34,15,0],
		"1f615":[["\uD83D\uDE15"],"","",["confused"],26,35,15,0],
		"1f616":[["\uD83D\uDE16"],"\uE407","\uDBB8\uDF3F",["confounded"],26,36,15,0],
		"1f617":[["\uD83D\uDE17"],"","",["kissing"],26,37,15,0],
		"1f618":[["\uD83D\uDE18"],"\uE418","\uDBB8\uDF2C",["kissing_heart"],26,38,15,0],
		"1f619":[["\uD83D\uDE19"],"","",["kissing_smiling_eyes"],26,39,15,0],
		"1f61a":[["\uD83D\uDE1A"],"\uE417","\uDBB8\uDF2D",["kissing_closed_eyes"],26,40,15,0],
		"1f61b":[["\uD83D\uDE1B"],"","",["stuck_out_tongue"],27,0,15,0,":p"],
		"1f61c":[["\uD83D\uDE1C"],"\uE105","\uDBB8\uDF29",["stuck_out_tongue_winking_eye"],27,1,15,0,";p"],
		"1f61d":[["\uD83D\uDE1D"],"\uE409","\uDBB8\uDF2A",["stuck_out_tongue_closed_eyes"],27,2,15,0],
		"1f61e":[["\uD83D\uDE1E"],"\uE058","\uDBB8\uDF23",["disappointed"],27,3,15,0,":("],
		"1f61f":[["\uD83D\uDE1F"],"","",["worried"],27,4,15,0],
		"1f620":[["\uD83D\uDE20"],"\uE059","\uDBB8\uDF20",["angry"],27,5,15,0],
		"1f621":[["\uD83D\uDE21"],"\uE416","\uDBB8\uDF3D",["rage"],27,6,15,0],
		"1f622":[["\uD83D\uDE22"],"\uE413","\uDBB8\uDF39",["cry"],27,7,15,0,":'("],
		"1f623":[["\uD83D\uDE23"],"\uE406","\uDBB8\uDF3C",["persevere"],27,8,15,0],
		"1f624":[["\uD83D\uDE24"],"\uE404","\uDBB8\uDF28",["triumph"],27,9,15,0],
		"1f625":[["\uD83D\uDE25"],"\uE401","\uDBB8\uDF45",["disappointed_relieved"],27,10,15,0],
		"1f626":[["\uD83D\uDE26"],"","",["frowning"],27,11,15,0],
		"1f627":[["\uD83D\uDE27"],"","",["anguished"],27,12,15,0],
		"1f628":[["\uD83D\uDE28"],"\uE40B","\uDBB8\uDF3B",["fearful"],27,13,15,0],
		"1f629":[["\uD83D\uDE29"],"\uE403","\uDBB8\uDF21",["weary"],27,14,15,0],
		"1f62a":[["\uD83D\uDE2A"],"\uE408","\uDBB8\uDF42",["sleepy"],27,15,15,0],
		"1f62b":[["\uD83D\uDE2B"],"\uE406","\uDBB8\uDF46",["tired_face"],27,16,15,0],
		"1f62c":[["\uD83D\uDE2C"],"","",["grimacing"],27,17,15,0],
		"1f62d":[["\uD83D\uDE2D"],"\uE411","\uDBB8\uDF3A",["sob"],27,18,15,0,":'("],
		"1f62e":[["\uD83D\uDE2E"],"","",["open_mouth"],27,19,15,0],
		"1f62f":[["\uD83D\uDE2F"],"","",["hushed"],27,20,15,0],
		"1f630":[["\uD83D\uDE30"],"\uE40F","\uDBB8\uDF25",["cold_sweat"],27,21,15,0],
		"1f631":[["\uD83D\uDE31"],"\uE107","\uDBB8\uDF41",["scream"],27,22,15,0],
		"1f632":[["\uD83D\uDE32"],"\uE410","\uDBB8\uDF22",["astonished"],27,23,15,0],
		"1f633":[["\uD83D\uDE33"],"\uE40D","\uDBB8\uDF2F",["flushed"],27,24,15,0],
		"1f634":[["\uD83D\uDE34"],"","",["sleeping"],27,25,15,0],
		"1f635":[["\uD83D\uDE35"],"\uE406","\uDBB8\uDF24",["dizzy_face"],27,26,15,0],
		"1f636":[["\uD83D\uDE36"],"","",["no_mouth"],27,27,15,0],
		"1f637":[["\uD83D\uDE37"],"\uE40C","\uDBB8\uDF2E",["mask"],27,28,15,0],
		"1f638":[["\uD83D\uDE38"],"\uE404","\uDBB8\uDF49",["smile_cat"],27,29,15,0],
		"1f639":[["\uD83D\uDE39"],"\uE412","\uDBB8\uDF4A",["joy_cat"],27,30,15,0],
		"1f63a":[["\uD83D\uDE3A"],"\uE057","\uDBB8\uDF48",["smiley_cat"],27,31,15,0],
		"1f63b":[["\uD83D\uDE3B"],"\uE106","\uDBB8\uDF4C",["heart_eyes_cat"],27,32,15,0],
		"1f63c":[["\uD83D\uDE3C"],"\uE404","\uDBB8\uDF4F",["smirk_cat"],27,33,15,0],
		"1f63d":[["\uD83D\uDE3D"],"\uE418","\uDBB8\uDF4B",["kissing_cat"],27,34,15,0],
		"1f63e":[["\uD83D\uDE3E"],"\uE416","\uDBB8\uDF4E",["pouting_cat"],27,35,15,0],
		"1f63f":[["\uD83D\uDE3F"],"\uE413","\uDBB8\uDF4D",["crying_cat_face"],27,36,15,0],
		"1f640":[["\uD83D\uDE40"],"\uE403","\uDBB8\uDF50",["scream_cat"],27,37,15,0],
		"1f641":[["\uD83D\uDE41"],"","",["slightly_frowning_face"],27,38,15,0],
		"1f642":[["\uD83D\uDE42"],"","",["slightly_smiling_face"],27,39,15,0],
		"1f643":[["\uD83D\uDE43"],"","",["upside_down_face"],27,40,7,0],
		"1f644":[["\uD83D\uDE44"],"","",["face_with_rolling_eyes"],28,0,7,0],
		"1f645":[["\uD83D\uDE45"],"\uE423","\uDBB8\uDF51",["no_good"],28,1,15,0],
		"1f646":[["\uD83D\uDE46"],"\uE424","\uDBB8\uDF52",["ok_woman"],28,7,15,0],
		"1f647":[["\uD83D\uDE47"],"\uE426","\uDBB8\uDF53",["bow"],28,13,15,0],
		"1f648":[["\uD83D\uDE48"],"","\uDBB8\uDF54",["see_no_evil"],28,19,15,0],
		"1f649":[["\uD83D\uDE49"],"","\uDBB8\uDF56",["hear_no_evil"],28,20,15,0],
		"1f64a":[["\uD83D\uDE4A"],"","\uDBB8\uDF55",["speak_no_evil"],28,21,15,0],
		"1f64b":[["\uD83D\uDE4B"],"\uE012","\uDBB8\uDF57",["raising_hand"],28,22,15,0],
		"1f64c":[["\uD83D\uDE4C"],"\uE427","\uDBB8\uDF58",["raised_hands"],28,28,15,0],
		"1f64d":[["\uD83D\uDE4D"],"\uE403","\uDBB8\uDF59",["person_frowning"],28,34,15,0],
		"1f64e":[["\uD83D\uDE4E"],"\uE416","\uDBB8\uDF5A",["person_with_pouting_face"],28,40,15,0],
		"1f64f":[["\uD83D\uDE4F"],"\uE41D","\uDBB8\uDF5B",["pray"],29,5,15,0],
		"1f680":[["\uD83D\uDE80"],"\uE10D","\uDBB9\uDFED",["rocket"],29,11,15,0],
		"1f681":[["\uD83D\uDE81"],"","",["helicopter"],29,12,15,0],
		"1f682":[["\uD83D\uDE82"],"","",["steam_locomotive"],29,13,15,0],
		"1f683":[["\uD83D\uDE83"],"\uE01E","\uDBB9\uDFDF",["railway_car"],29,14,15,0],
		"1f684":[["\uD83D\uDE84"],"\uE435","\uDBB9\uDFE2",["bullettrain_side"],29,15,15,0],
		"1f685":[["\uD83D\uDE85"],"\uE01F","\uDBB9\uDFE3",["bullettrain_front"],29,16,15,0],
		"1f686":[["\uD83D\uDE86"],"","",["train2"],29,17,15,0],
		"1f687":[["\uD83D\uDE87"],"\uE434","\uDBB9\uDFE0",["metro"],29,18,15,0],
		"1f688":[["\uD83D\uDE88"],"","",["light_rail"],29,19,15,0],
		"1f689":[["\uD83D\uDE89"],"\uE039","\uDBB9\uDFEC",["station"],29,20,15,0],
		"1f68a":[["\uD83D\uDE8A"],"","",["tram"],29,21,15,0],
		"1f68b":[["\uD83D\uDE8B"],"","",["train"],29,22,15,0],
		"1f68c":[["\uD83D\uDE8C"],"\uE159","\uDBB9\uDFE6",["bus"],29,23,15,0],
		"1f68d":[["\uD83D\uDE8D"],"","",["oncoming_bus"],29,24,15,0],
		"1f68e":[["\uD83D\uDE8E"],"","",["trolleybus"],29,25,15,0],
		"1f68f":[["\uD83D\uDE8F"],"\uE150","\uDBB9\uDFE7",["busstop"],29,26,15,0],
		"1f690":[["\uD83D\uDE90"],"","",["minibus"],29,27,15,0],
		"1f691":[["\uD83D\uDE91"],"\uE431","\uDBB9\uDFF3",["ambulance"],29,28,15,0],
		"1f692":[["\uD83D\uDE92"],"\uE430","\uDBB9\uDFF2",["fire_engine"],29,29,15,0],
		"1f693":[["\uD83D\uDE93"],"\uE432","\uDBB9\uDFF4",["police_car"],29,30,15,0],
		"1f694":[["\uD83D\uDE94"],"","",["oncoming_police_car"],29,31,15,0],
		"1f695":[["\uD83D\uDE95"],"\uE15A","\uDBB9\uDFEF",["taxi"],29,32,15,0],
		"1f696":[["\uD83D\uDE96"],"","",["oncoming_taxi"],29,33,15,0],
		"1f697":[["\uD83D\uDE97"],"\uE01B","\uDBB9\uDFE4",["car","red_car"],29,34,15,0],
		"1f698":[["\uD83D\uDE98"],"","",["oncoming_automobile"],29,35,15,0],
		"1f699":[["\uD83D\uDE99"],"\uE42E","\uDBB9\uDFE5",["blue_car"],29,36,15,0],
		"1f69a":[["\uD83D\uDE9A"],"\uE42F","\uDBB9\uDFF1",["truck"],29,37,15,0],
		"1f69b":[["\uD83D\uDE9B"],"","",["articulated_lorry"],29,38,15,0],
		"1f69c":[["\uD83D\uDE9C"],"","",["tractor"],29,39,15,0],
		"1f69d":[["\uD83D\uDE9D"],"","",["monorail"],29,40,15,0],
		"1f69e":[["\uD83D\uDE9E"],"","",["mountain_railway"],30,0,15,0],
		"1f69f":[["\uD83D\uDE9F"],"","",["suspension_railway"],30,1,15,0],
		"1f6a0":[["\uD83D\uDEA0"],"","",["mountain_cableway"],30,2,15,0],
		"1f6a1":[["\uD83D\uDEA1"],"","",["aerial_tramway"],30,3,15,0],
		"1f6a2":[["\uD83D\uDEA2"],"\uE202","\uDBB9\uDFE8",["ship"],30,4,15,0],
		"1f6a3":[["\uD83D\uDEA3"],"","",["rowboat"],30,5,15,0],
		"1f6a4":[["\uD83D\uDEA4"],"\uE135","\uDBB9\uDFEE",["speedboat"],30,11,15,0],
		"1f6a5":[["\uD83D\uDEA5"],"\uE14E","\uDBB9\uDFF7",["traffic_light"],30,12,15,0],
		"1f6a6":[["\uD83D\uDEA6"],"","",["vertical_traffic_light"],30,13,15,0],
		"1f6a7":[["\uD83D\uDEA7"],"\uE137","\uDBB9\uDFF8",["construction"],30,14,15,0],
		"1f6a8":[["\uD83D\uDEA8"],"\uE432","\uDBB9\uDFF9",["rotating_light"],30,15,15,0],
		"1f6a9":[["\uD83D\uDEA9"],"","\uDBBA\uDF22",["triangular_flag_on_post"],30,16,15,0],
		"1f6aa":[["\uD83D\uDEAA"],"","\uDBB9\uDCF3",["door"],30,17,15,0],
		"1f6ab":[["\uD83D\uDEAB"],"","\uDBBA\uDF48",["no_entry_sign"],30,18,15,0],
		"1f6ac":[["\uD83D\uDEAC"],"\uE30E","\uDBBA\uDF1E",["smoking"],30,19,15,0],
		"1f6ad":[["\uD83D\uDEAD"],"\uE208","\uDBBA\uDF1F",["no_smoking"],30,20,15,0],
		"1f6ae":[["\uD83D\uDEAE"],"","",["put_litter_in_its_place"],30,21,15,0],
		"1f6af":[["\uD83D\uDEAF"],"","",["do_not_litter"],30,22,15,0],
		"1f6b0":[["\uD83D\uDEB0"],"","",["potable_water"],30,23,15,0],
		"1f6b1":[["\uD83D\uDEB1"],"","",["non-potable_water"],30,24,15,0],
		"1f6b2":[["\uD83D\uDEB2"],"\uE136","\uDBB9\uDFEB",["bike"],30,25,15,0],
		"1f6b3":[["\uD83D\uDEB3"],"","",["no_bicycles"],30,26,15,0],
		"1f6b4":[["\uD83D\uDEB4"],"","",["bicyclist"],30,27,15,0],
		"1f6b5":[["\uD83D\uDEB5"],"","",["mountain_bicyclist"],30,33,15,0],
		"1f6b6":[["\uD83D\uDEB6"],"\uE201","\uDBB9\uDFF0",["walking"],30,39,15,0],
		"1f6b7":[["\uD83D\uDEB7"],"","",["no_pedestrians"],31,4,15,0],
		"1f6b8":[["\uD83D\uDEB8"],"","",["children_crossing"],31,5,15,0],
		"1f6b9":[["\uD83D\uDEB9"],"\uE138","\uDBBA\uDF33",["mens"],31,6,15,0],
		"1f6ba":[["\uD83D\uDEBA"],"\uE139","\uDBBA\uDF34",["womens"],31,7,15,0],
		"1f6bb":[["\uD83D\uDEBB"],"\uE151","\uDBB9\uDD06",["restroom"],31,8,15,0],
		"1f6bc":[["\uD83D\uDEBC"],"\uE13A","\uDBBA\uDF35",["baby_symbol"],31,9,15,0],
		"1f6bd":[["\uD83D\uDEBD"],"\uE140","\uDBB9\uDD07",["toilet"],31,10,15,0],
		"1f6be":[["\uD83D\uDEBE"],"\uE309","\uDBB9\uDD08",["wc"],31,11,15,0],
		"1f6bf":[["\uD83D\uDEBF"],"","",["shower"],31,12,15,0],
		"1f6c0":[["\uD83D\uDEC0"],"\uE13F","\uDBB9\uDD05",["bath"],31,13,15,0],
		"1f6c1":[["\uD83D\uDEC1"],"","",["bathtub"],31,19,15,0],
		"1f6c2":[["\uD83D\uDEC2"],"","",["passport_control"],31,20,15,0],
		"1f6c3":[["\uD83D\uDEC3"],"","",["customs"],31,21,15,0],
		"1f6c4":[["\uD83D\uDEC4"],"","",["baggage_claim"],31,22,15,0],
		"1f6c5":[["\uD83D\uDEC5"],"","",["left_luggage"],31,23,15,0],
		"1f6cb":[["\uD83D\uDECB"],"","",["couch_and_lamp"],31,24,15,0],
		"1f6cc":[["\uD83D\uDECC"],"","",["sleeping_accommodation"],31,25,15,0],
		"1f6cd":[["\uD83D\uDECD"],"","",["shopping_bags"],31,26,15,0],
		"1f6ce":[["\uD83D\uDECE"],"","",["bellhop_bell"],31,27,15,0],
		"1f6cf":[["\uD83D\uDECF"],"","",["bed"],31,28,15,0],
		"1f6d0":[["\uD83D\uDED0"],"","",["place_of_worship"],31,29,7,0],
		"1f6e0":[["\uD83D\uDEE0"],"","",["hammer_and_wrench"],31,30,15,0],
		"1f6e1":[["\uD83D\uDEE1"],"","",["shield"],31,31,15,0],
		"1f6e2":[["\uD83D\uDEE2"],"","",["oil_drum"],31,32,15,0],
		"1f6e3":[["\uD83D\uDEE3"],"","",["motorway"],31,33,15,0],
		"1f6e4":[["\uD83D\uDEE4"],"","",["railway_track"],31,34,15,0],
		"1f6e5":[["\uD83D\uDEE5"],"","",["motor_boat"],31,35,15,0],
		"1f6e9":[["\uD83D\uDEE9"],"","",["small_airplane"],31,36,15,0],
		"1f6eb":[["\uD83D\uDEEB"],"","",["airplane_departure"],31,37,15,0],
		"1f6ec":[["\uD83D\uDEEC"],"","",["airplane_arriving"],31,38,15,0],
		"1f6f0":[["\uD83D\uDEF0"],"","",["satellite"],31,39,15,0],
		"1f6f3":[["\uD83D\uDEF3"],"","",["passenger_ship"],31,40,15,0],
		"1f910":[["\uD83E\uDD10"],"","",["zipper_mouth_face"],32,0,7,0],
		"1f911":[["\uD83E\uDD11"],"","",["money_mouth_face"],32,1,7,0],
		"1f912":[["\uD83E\uDD12"],"","",["face_with_thermometer"],32,2,7,0],
		"1f913":[["\uD83E\uDD13"],"","",["nerd_face"],32,3,7,0],
		"1f914":[["\uD83E\uDD14"],"","",["thinking_face"],32,4,7,0],
		"1f915":[["\uD83E\uDD15"],"","",["face_with_head_bandage"],32,5,7,0],
		"1f916":[["\uD83E\uDD16"],"","",["robot_face"],32,6,7,0],
		"1f917":[["\uD83E\uDD17"],"","",["hugging_face"],32,7,7,0],
		"1f918":[["\uD83E\uDD18"],"","",["the_horns","sign_of_the_horns"],32,8,7,0],
		"1f980":[["\uD83E\uDD80"],"","",["crab"],32,14,7,0],
		"1f981":[["\uD83E\uDD81"],"","",["lion_face"],32,15,7,0],
		"1f982":[["\uD83E\uDD82"],"","",["scorpion"],32,16,7,0],
		"1f983":[["\uD83E\uDD83"],"","",["turkey"],32,17,7,0],
		"1f984":[["\uD83E\uDD84"],"","",["unicorn_face"],32,18,7,0],
		"1f9c0":[["\uD83E\uDDC0"],"","",["cheese_wedge"],32,19,7,0],
		"0023-20e3":[["\u0023\uFE0F\u20E3","\u0023\u20E3"],"\uE210","\uDBBA\uDC2C",["hash"],32,20,15,0],
		"002a-20e3":[["\u002A\u20E3"],"","",["keycap_star"],32,21,7,0],
		"0030-20e3":[["\u0030\uFE0F\u20E3","\u0030\u20E3"],"\uE225","\uDBBA\uDC37",["zero"],32,22,15,0],
		"0031-20e3":[["\u0031\uFE0F\u20E3","\u0031\u20E3"],"\uE21C","\uDBBA\uDC2E",["one"],32,23,15,0],
		"0032-20e3":[["\u0032\uFE0F\u20E3","\u0032\u20E3"],"\uE21D","\uDBBA\uDC2F",["two"],32,24,15,0],
		"0033-20e3":[["\u0033\uFE0F\u20E3","\u0033\u20E3"],"\uE21E","\uDBBA\uDC30",["three"],32,25,15,0],
		"0034-20e3":[["\u0034\uFE0F\u20E3","\u0034\u20E3"],"\uE21F","\uDBBA\uDC31",["four"],32,26,15,0],
		"0035-20e3":[["\u0035\uFE0F\u20E3","\u0035\u20E3"],"\uE220","\uDBBA\uDC32",["five"],32,27,15,0],
		"0036-20e3":[["\u0036\uFE0F\u20E3","\u0036\u20E3"],"\uE221","\uDBBA\uDC33",["six"],32,28,15,0],
		"0037-20e3":[["\u0037\uFE0F\u20E3","\u0037\u20E3"],"\uE222","\uDBBA\uDC34",["seven"],32,29,15,0],
		"0038-20e3":[["\u0038\uFE0F\u20E3","\u0038\u20E3"],"\uE223","\uDBBA\uDC35",["eight"],32,30,15,0],
		"0039-20e3":[["\u0039\uFE0F\u20E3","\u0039\u20E3"],"\uE224","\uDBBA\uDC36",["nine"],32,31,15,0],
		"1f1e6-1f1e8":[["\uD83C\uDDE6\uD83C\uDDE8"],"","",["flag-ac"],32,32,13,0],
		"1f1e6-1f1e9":[["\uD83C\uDDE6\uD83C\uDDE9"],"","",["flag-ad"],32,33,15,0],
		"1f1e6-1f1ea":[["\uD83C\uDDE6\uD83C\uDDEA"],"","",["flag-ae"],32,34,15,0],
		"1f1e6-1f1eb":[["\uD83C\uDDE6\uD83C\uDDEB"],"","",["flag-af"],32,35,15,0],
		"1f1e6-1f1ec":[["\uD83C\uDDE6\uD83C\uDDEC"],"","",["flag-ag"],32,36,15,0],
		"1f1e6-1f1ee":[["\uD83C\uDDE6\uD83C\uDDEE"],"","",["flag-ai"],32,37,15,0],
		"1f1e6-1f1f1":[["\uD83C\uDDE6\uD83C\uDDF1"],"","",["flag-al"],32,38,15,0],
		"1f1e6-1f1f2":[["\uD83C\uDDE6\uD83C\uDDF2"],"","",["flag-am"],32,39,15,0],
		"1f1e6-1f1f4":[["\uD83C\uDDE6\uD83C\uDDF4"],"","",["flag-ao"],32,40,15,0],
		"1f1e6-1f1f6":[["\uD83C\uDDE6\uD83C\uDDF6"],"","",["flag-aq"],33,0,5,0],
		"1f1e6-1f1f7":[["\uD83C\uDDE6\uD83C\uDDF7"],"","",["flag-ar"],33,1,15,0],
		"1f1e6-1f1f8":[["\uD83C\uDDE6\uD83C\uDDF8"],"","",["flag-as"],33,2,7,0],
		"1f1e6-1f1f9":[["\uD83C\uDDE6\uD83C\uDDF9"],"","",["flag-at"],33,3,15,0],
		"1f1e6-1f1fa":[["\uD83C\uDDE6\uD83C\uDDFA"],"","",["flag-au"],33,4,15,0],
		"1f1e6-1f1fc":[["\uD83C\uDDE6\uD83C\uDDFC"],"","",["flag-aw"],33,5,15,0],
		"1f1e6-1f1fd":[["\uD83C\uDDE6\uD83C\uDDFD"],"","",["flag-ax"],33,6,7,0],
		"1f1e6-1f1ff":[["\uD83C\uDDE6\uD83C\uDDFF"],"","",["flag-az"],33,7,15,0],
		"1f1e7-1f1e6":[["\uD83C\uDDE7\uD83C\uDDE6"],"","",["flag-ba"],33,8,15,0],
		"1f1e7-1f1e7":[["\uD83C\uDDE7\uD83C\uDDE7"],"","",["flag-bb"],33,9,15,0],
		"1f1e7-1f1e9":[["\uD83C\uDDE7\uD83C\uDDE9"],"","",["flag-bd"],33,10,15,0],
		"1f1e7-1f1ea":[["\uD83C\uDDE7\uD83C\uDDEA"],"","",["flag-be"],33,11,15,0],
		"1f1e7-1f1eb":[["\uD83C\uDDE7\uD83C\uDDEB"],"","",["flag-bf"],33,12,15,0],
		"1f1e7-1f1ec":[["\uD83C\uDDE7\uD83C\uDDEC"],"","",["flag-bg"],33,13,15,0],
		"1f1e7-1f1ed":[["\uD83C\uDDE7\uD83C\uDDED"],"","",["flag-bh"],33,14,15,0],
		"1f1e7-1f1ee":[["\uD83C\uDDE7\uD83C\uDDEE"],"","",["flag-bi"],33,15,15,0],
		"1f1e7-1f1ef":[["\uD83C\uDDE7\uD83C\uDDEF"],"","",["flag-bj"],33,16,15,0],
		"1f1e7-1f1f1":[["\uD83C\uDDE7\uD83C\uDDF1"],"","",["flag-bl"],33,17,5,0],
		"1f1e7-1f1f2":[["\uD83C\uDDE7\uD83C\uDDF2"],"","",["flag-bm"],33,18,15,0],
		"1f1e7-1f1f3":[["\uD83C\uDDE7\uD83C\uDDF3"],"","",["flag-bn"],33,19,15,0],
		"1f1e7-1f1f4":[["\uD83C\uDDE7\uD83C\uDDF4"],"","",["flag-bo"],33,20,15,0],
		"1f1e7-1f1f6":[["\uD83C\uDDE7\uD83C\uDDF6"],"","",["flag-bq"],33,21,5,0],
		"1f1e7-1f1f7":[["\uD83C\uDDE7\uD83C\uDDF7"],"","",["flag-br"],33,22,15,0],
		"1f1e7-1f1f8":[["\uD83C\uDDE7\uD83C\uDDF8"],"","",["flag-bs"],33,23,15,0],
		"1f1e7-1f1f9":[["\uD83C\uDDE7\uD83C\uDDF9"],"","",["flag-bt"],33,24,15,0],
		"1f1e7-1f1fb":[["\uD83C\uDDE7\uD83C\uDDFB"],"","",["flag-bv"],33,25,5,0],
		"1f1e7-1f1fc":[["\uD83C\uDDE7\uD83C\uDDFC"],"","",["flag-bw"],33,26,15,0],
		"1f1e7-1f1fe":[["\uD83C\uDDE7\uD83C\uDDFE"],"","",["flag-by"],33,27,15,0],
		"1f1e7-1f1ff":[["\uD83C\uDDE7\uD83C\uDDFF"],"","",["flag-bz"],33,28,15,0],
		"1f1e8-1f1e6":[["\uD83C\uDDE8\uD83C\uDDE6"],"","",["flag-ca"],33,29,15,0],
		"1f1e8-1f1e8":[["\uD83C\uDDE8\uD83C\uDDE8"],"","",["flag-cc"],33,30,7,0],
		"1f1e8-1f1e9":[["\uD83C\uDDE8\uD83C\uDDE9"],"","",["flag-cd"],33,31,15,0],
		"1f1e8-1f1eb":[["\uD83C\uDDE8\uD83C\uDDEB"],"","",["flag-cf"],33,32,15,0],
		"1f1e8-1f1ec":[["\uD83C\uDDE8\uD83C\uDDEC"],"","",["flag-cg"],33,33,15,0],
		"1f1e8-1f1ed":[["\uD83C\uDDE8\uD83C\uDDED"],"","",["flag-ch"],33,34,15,0],
		"1f1e8-1f1ee":[["\uD83C\uDDE8\uD83C\uDDEE"],"","",["flag-ci"],33,35,15,0],
		"1f1e8-1f1f0":[["\uD83C\uDDE8\uD83C\uDDF0"],"","",["flag-ck"],33,36,7,0],
		"1f1e8-1f1f1":[["\uD83C\uDDE8\uD83C\uDDF1"],"","",["flag-cl"],33,37,15,0],
		"1f1e8-1f1f2":[["\uD83C\uDDE8\uD83C\uDDF2"],"","",["flag-cm"],33,38,15,0],
		"1f1e8-1f1f3":[["\uD83C\uDDE8\uD83C\uDDF3"],"\uE513","\uDBB9\uDCED",["flag-cn","cn"],33,39,15,0],
		"1f1e8-1f1f4":[["\uD83C\uDDE8\uD83C\uDDF4"],"","",["flag-co"],33,40,15,0],
		"1f1e8-1f1f5":[["\uD83C\uDDE8\uD83C\uDDF5"],"","",["flag-cp"],34,0,5,0],
		"1f1e8-1f1f7":[["\uD83C\uDDE8\uD83C\uDDF7"],"","",["flag-cr"],34,1,15,0],
		"1f1e8-1f1fa":[["\uD83C\uDDE8\uD83C\uDDFA"],"","",["flag-cu"],34,2,15,0],
		"1f1e8-1f1fb":[["\uD83C\uDDE8\uD83C\uDDFB"],"","",["flag-cv"],34,3,15,0],
		"1f1e8-1f1fc":[["\uD83C\uDDE8\uD83C\uDDFC"],"","",["flag-cw"],34,4,7,0],
		"1f1e8-1f1fd":[["\uD83C\uDDE8\uD83C\uDDFD"],"","",["flag-cx"],34,5,7,0],
		"1f1e8-1f1fe":[["\uD83C\uDDE8\uD83C\uDDFE"],"","",["flag-cy"],34,6,15,0],
		"1f1e8-1f1ff":[["\uD83C\uDDE8\uD83C\uDDFF"],"","",["flag-cz"],34,7,15,0],
		"1f1e9-1f1ea":[["\uD83C\uDDE9\uD83C\uDDEA"],"\uE50E","\uDBB9\uDCE8",["flag-de","de"],34,8,15,0],
		"1f1e9-1f1ec":[["\uD83C\uDDE9\uD83C\uDDEC"],"","",["flag-dg"],34,9,5,0],
		"1f1e9-1f1ef":[["\uD83C\uDDE9\uD83C\uDDEF"],"","",["flag-dj"],34,10,15,0],
		"1f1e9-1f1f0":[["\uD83C\uDDE9\uD83C\uDDF0"],"","",["flag-dk"],34,11,15,0],
		"1f1e9-1f1f2":[["\uD83C\uDDE9\uD83C\uDDF2"],"","",["flag-dm"],34,12,15,0],
		"1f1e9-1f1f4":[["\uD83C\uDDE9\uD83C\uDDF4"],"","",["flag-do"],34,13,15,0],
		"1f1e9-1f1ff":[["\uD83C\uDDE9\uD83C\uDDFF"],"","",["flag-dz"],34,14,15,0],
		"1f1ea-1f1e6":[["\uD83C\uDDEA\uD83C\uDDE6"],"","",["flag-ea"],34,15,5,0],
		"1f1ea-1f1e8":[["\uD83C\uDDEA\uD83C\uDDE8"],"","",["flag-ec"],34,16,15,0],
		"1f1ea-1f1ea":[["\uD83C\uDDEA\uD83C\uDDEA"],"","",["flag-ee"],34,17,15,0],
		"1f1ea-1f1ec":[["\uD83C\uDDEA\uD83C\uDDEC"],"","",["flag-eg"],34,18,15,0],
		"1f1ea-1f1ed":[["\uD83C\uDDEA\uD83C\uDDED"],"","",["flag-eh"],34,19,13,0],
		"1f1ea-1f1f7":[["\uD83C\uDDEA\uD83C\uDDF7"],"","",["flag-er"],34,20,15,0],
		"1f1ea-1f1f8":[["\uD83C\uDDEA\uD83C\uDDF8"],"\uE511","\uDBB9\uDCEB",["flag-es","es"],34,21,15,0],
		"1f1ea-1f1f9":[["\uD83C\uDDEA\uD83C\uDDF9"],"","",["flag-et"],34,22,15,0],
		"1f1ea-1f1fa":[["\uD83C\uDDEA\uD83C\uDDFA"],"","",["flag-eu"],34,23,7,0],
		"1f1eb-1f1ee":[["\uD83C\uDDEB\uD83C\uDDEE"],"","",["flag-fi"],34,24,15,0],
		"1f1eb-1f1ef":[["\uD83C\uDDEB\uD83C\uDDEF"],"","",["flag-fj"],34,25,15,0],
		"1f1eb-1f1f0":[["\uD83C\uDDEB\uD83C\uDDF0"],"","",["flag-fk"],34,26,13,0],
		"1f1eb-1f1f2":[["\uD83C\uDDEB\uD83C\uDDF2"],"","",["flag-fm"],34,27,15,0],
		"1f1eb-1f1f4":[["\uD83C\uDDEB\uD83C\uDDF4"],"","",["flag-fo"],34,28,15,0],
		"1f1eb-1f1f7":[["\uD83C\uDDEB\uD83C\uDDF7"],"\uE50D","\uDBB9\uDCE7",["flag-fr","fr"],34,29,15,0],
		"1f1ec-1f1e6":[["\uD83C\uDDEC\uD83C\uDDE6"],"","",["flag-ga"],34,30,15,0],
		"1f1ec-1f1e7":[["\uD83C\uDDEC\uD83C\uDDE7"],"\uE510","\uDBB9\uDCEA",["flag-gb","gb","uk"],34,31,15,0],
		"1f1ec-1f1e9":[["\uD83C\uDDEC\uD83C\uDDE9"],"","",["flag-gd"],34,32,15,0],
		"1f1ec-1f1ea":[["\uD83C\uDDEC\uD83C\uDDEA"],"","",["flag-ge"],34,33,15,0],
		"1f1ec-1f1eb":[["\uD83C\uDDEC\uD83C\uDDEB"],"","",["flag-gf"],34,34,5,0],
		"1f1ec-1f1ec":[["\uD83C\uDDEC\uD83C\uDDEC"],"","",["flag-gg"],34,35,7,0],
		"1f1ec-1f1ed":[["\uD83C\uDDEC\uD83C\uDDED"],"","",["flag-gh"],34,36,15,0],
		"1f1ec-1f1ee":[["\uD83C\uDDEC\uD83C\uDDEE"],"","",["flag-gi"],34,37,15,0],
		"1f1ec-1f1f1":[["\uD83C\uDDEC\uD83C\uDDF1"],"","",["flag-gl"],34,38,15,0],
		"1f1ec-1f1f2":[["\uD83C\uDDEC\uD83C\uDDF2"],"","",["flag-gm"],34,39,15,0],
		"1f1ec-1f1f3":[["\uD83C\uDDEC\uD83C\uDDF3"],"","",["flag-gn"],34,40,15,0],
		"1f1ec-1f1f5":[["\uD83C\uDDEC\uD83C\uDDF5"],"","",["flag-gp"],35,0,5,0],
		"1f1ec-1f1f6":[["\uD83C\uDDEC\uD83C\uDDF6"],"","",["flag-gq"],35,1,15,0],
		"1f1ec-1f1f7":[["\uD83C\uDDEC\uD83C\uDDF7"],"","",["flag-gr"],35,2,15,0],
		"1f1ec-1f1f8":[["\uD83C\uDDEC\uD83C\uDDF8"],"","",["flag-gs"],35,3,5,0],
		"1f1ec-1f1f9":[["\uD83C\uDDEC\uD83C\uDDF9"],"","",["flag-gt"],35,4,15,0],
		"1f1ec-1f1fa":[["\uD83C\uDDEC\uD83C\uDDFA"],"","",["flag-gu"],35,5,15,0],
		"1f1ec-1f1fc":[["\uD83C\uDDEC\uD83C\uDDFC"],"","",["flag-gw"],35,6,15,0],
		"1f1ec-1f1fe":[["\uD83C\uDDEC\uD83C\uDDFE"],"","",["flag-gy"],35,7,15,0],
		"1f1ed-1f1f0":[["\uD83C\uDDED\uD83C\uDDF0"],"","",["flag-hk"],35,8,15,0],
		"1f1ed-1f1f2":[["\uD83C\uDDED\uD83C\uDDF2"],"","",["flag-hm"],35,9,5,0],
		"1f1ed-1f1f3":[["\uD83C\uDDED\uD83C\uDDF3"],"","",["flag-hn"],35,10,15,0],
		"1f1ed-1f1f7":[["\uD83C\uDDED\uD83C\uDDF7"],"","",["flag-hr"],35,11,15,0],
		"1f1ed-1f1f9":[["\uD83C\uDDED\uD83C\uDDF9"],"","",["flag-ht"],35,12,15,0],
		"1f1ed-1f1fa":[["\uD83C\uDDED\uD83C\uDDFA"],"","",["flag-hu"],35,13,15,0],
		"1f1ee-1f1e8":[["\uD83C\uDDEE\uD83C\uDDE8"],"","",["flag-ic"],35,14,5,0],
		"1f1ee-1f1e9":[["\uD83C\uDDEE\uD83C\uDDE9"],"","",["flag-id"],35,15,15,0],
		"1f1ee-1f1ea":[["\uD83C\uDDEE\uD83C\uDDEA"],"","",["flag-ie"],35,16,15,0],
		"1f1ee-1f1f1":[["\uD83C\uDDEE\uD83C\uDDF1"],"","",["flag-il"],35,17,15,0],
		"1f1ee-1f1f2":[["\uD83C\uDDEE\uD83C\uDDF2"],"","",["flag-im"],35,18,7,0],
		"1f1ee-1f1f3":[["\uD83C\uDDEE\uD83C\uDDF3"],"","",["flag-in"],35,19,15,0],
		"1f1ee-1f1f4":[["\uD83C\uDDEE\uD83C\uDDF4"],"","",["flag-io"],35,20,7,0],
		"1f1ee-1f1f6":[["\uD83C\uDDEE\uD83C\uDDF6"],"","",["flag-iq"],35,21,15,0],
		"1f1ee-1f1f7":[["\uD83C\uDDEE\uD83C\uDDF7"],"","",["flag-ir"],35,22,15,0],
		"1f1ee-1f1f8":[["\uD83C\uDDEE\uD83C\uDDF8"],"","",["flag-is"],35,23,15,0],
		"1f1ee-1f1f9":[["\uD83C\uDDEE\uD83C\uDDF9"],"\uE50F","\uDBB9\uDCE9",["flag-it","it"],35,24,15,0],
		"1f1ef-1f1ea":[["\uD83C\uDDEF\uD83C\uDDEA"],"","",["flag-je"],35,25,15,0],
		"1f1ef-1f1f2":[["\uD83C\uDDEF\uD83C\uDDF2"],"","",["flag-jm"],35,26,15,0],
		"1f1ef-1f1f4":[["\uD83C\uDDEF\uD83C\uDDF4"],"","",["flag-jo"],35,27,15,0],
		"1f1ef-1f1f5":[["\uD83C\uDDEF\uD83C\uDDF5"],"\uE50B","\uDBB9\uDCE5",["flag-jp","jp"],35,28,15,0],
		"1f1f0-1f1ea":[["\uD83C\uDDF0\uD83C\uDDEA"],"","",["flag-ke"],35,29,15,0],
		"1f1f0-1f1ec":[["\uD83C\uDDF0\uD83C\uDDEC"],"","",["flag-kg"],35,30,15,0],
		"1f1f0-1f1ed":[["\uD83C\uDDF0\uD83C\uDDED"],"","",["flag-kh"],35,31,15,0],
		"1f1f0-1f1ee":[["\uD83C\uDDF0\uD83C\uDDEE"],"","",["flag-ki"],35,32,15,0],
		"1f1f0-1f1f2":[["\uD83C\uDDF0\uD83C\uDDF2"],"","",["flag-km"],35,33,15,0],
		"1f1f0-1f1f3":[["\uD83C\uDDF0\uD83C\uDDF3"],"","",["flag-kn"],35,34,15,0],
		"1f1f0-1f1f5":[["\uD83C\uDDF0\uD83C\uDDF5"],"","",["flag-kp"],35,35,15,0],
		"1f1f0-1f1f7":[["\uD83C\uDDF0\uD83C\uDDF7"],"\uE514","\uDBB9\uDCEE",["flag-kr","kr"],35,36,15,0],
		"1f1f0-1f1fc":[["\uD83C\uDDF0\uD83C\uDDFC"],"","",["flag-kw"],35,37,15,0],
		"1f1f0-1f1fe":[["\uD83C\uDDF0\uD83C\uDDFE"],"","",["flag-ky"],35,38,15,0],
		"1f1f0-1f1ff":[["\uD83C\uDDF0\uD83C\uDDFF"],"","",["flag-kz"],35,39,15,0],
		"1f1f1-1f1e6":[["\uD83C\uDDF1\uD83C\uDDE6"],"","",["flag-la"],35,40,15,0],
		"1f1f1-1f1e7":[["\uD83C\uDDF1\uD83C\uDDE7"],"","",["flag-lb"],36,0,15,0],
		"1f1f1-1f1e8":[["\uD83C\uDDF1\uD83C\uDDE8"],"","",["flag-lc"],36,1,15,0],
		"1f1f1-1f1ee":[["\uD83C\uDDF1\uD83C\uDDEE"],"","",["flag-li"],36,2,15,0],
		"1f1f1-1f1f0":[["\uD83C\uDDF1\uD83C\uDDF0"],"","",["flag-lk"],36,3,15,0],
		"1f1f1-1f1f7":[["\uD83C\uDDF1\uD83C\uDDF7"],"","",["flag-lr"],36,4,15,0],
		"1f1f1-1f1f8":[["\uD83C\uDDF1\uD83C\uDDF8"],"","",["flag-ls"],36,5,15,0],
		"1f1f1-1f1f9":[["\uD83C\uDDF1\uD83C\uDDF9"],"","",["flag-lt"],36,6,15,0],
		"1f1f1-1f1fa":[["\uD83C\uDDF1\uD83C\uDDFA"],"","",["flag-lu"],36,7,15,0],
		"1f1f1-1f1fb":[["\uD83C\uDDF1\uD83C\uDDFB"],"","",["flag-lv"],36,8,15,0],
		"1f1f1-1f1fe":[["\uD83C\uDDF1\uD83C\uDDFE"],"","",["flag-ly"],36,9,15,0],
		"1f1f2-1f1e6":[["\uD83C\uDDF2\uD83C\uDDE6"],"","",["flag-ma"],36,10,15,0],
		"1f1f2-1f1e8":[["\uD83C\uDDF2\uD83C\uDDE8"],"","",["flag-mc"],36,11,15,0],
		"1f1f2-1f1e9":[["\uD83C\uDDF2\uD83C\uDDE9"],"","",["flag-md"],36,12,15,0],
		"1f1f2-1f1ea":[["\uD83C\uDDF2\uD83C\uDDEA"],"","",["flag-me"],36,13,15,0],
		"1f1f2-1f1eb":[["\uD83C\uDDF2\uD83C\uDDEB"],"","",["flag-mf"],36,14,5,0],
		"1f1f2-1f1ec":[["\uD83C\uDDF2\uD83C\uDDEC"],"","",["flag-mg"],36,15,15,0],
		"1f1f2-1f1ed":[["\uD83C\uDDF2\uD83C\uDDED"],"","",["flag-mh"],36,16,15,0],
		"1f1f2-1f1f0":[["\uD83C\uDDF2\uD83C\uDDF0"],"","",["flag-mk"],36,17,15,0],
		"1f1f2-1f1f1":[["\uD83C\uDDF2\uD83C\uDDF1"],"","",["flag-ml"],36,18,15,0],
		"1f1f2-1f1f2":[["\uD83C\uDDF2\uD83C\uDDF2"],"","",["flag-mm"],36,19,15,0],
		"1f1f2-1f1f3":[["\uD83C\uDDF2\uD83C\uDDF3"],"","",["flag-mn"],36,20,15,0],
		"1f1f2-1f1f4":[["\uD83C\uDDF2\uD83C\uDDF4"],"","",["flag-mo"],36,21,15,0],
		"1f1f2-1f1f5":[["\uD83C\uDDF2\uD83C\uDDF5"],"","",["flag-mp"],36,22,7,0],
		"1f1f2-1f1f6":[["\uD83C\uDDF2\uD83C\uDDF6"],"","",["flag-mq"],36,23,5,0],
		"1f1f2-1f1f7":[["\uD83C\uDDF2\uD83C\uDDF7"],"","",["flag-mr"],36,24,15,0],
		"1f1f2-1f1f8":[["\uD83C\uDDF2\uD83C\uDDF8"],"","",["flag-ms"],36,25,15,0],
		"1f1f2-1f1f9":[["\uD83C\uDDF2\uD83C\uDDF9"],"","",["flag-mt"],36,26,15,0],
		"1f1f2-1f1fa":[["\uD83C\uDDF2\uD83C\uDDFA"],"","",["flag-mu"],36,27,15,0],
		"1f1f2-1f1fb":[["\uD83C\uDDF2\uD83C\uDDFB"],"","",["flag-mv"],36,28,15,0],
		"1f1f2-1f1fc":[["\uD83C\uDDF2\uD83C\uDDFC"],"","",["flag-mw"],36,29,15,0],
		"1f1f2-1f1fd":[["\uD83C\uDDF2\uD83C\uDDFD"],"","",["flag-mx"],36,30,15,0],
		"1f1f2-1f1fe":[["\uD83C\uDDF2\uD83C\uDDFE"],"","",["flag-my"],36,31,15,0],
		"1f1f2-1f1ff":[["\uD83C\uDDF2\uD83C\uDDFF"],"","",["flag-mz"],36,32,15,0],
		"1f1f3-1f1e6":[["\uD83C\uDDF3\uD83C\uDDE6"],"","",["flag-na"],36,33,15,0],
		"1f1f3-1f1e8":[["\uD83C\uDDF3\uD83C\uDDE8"],"","",["flag-nc"],36,34,13,0],
		"1f1f3-1f1ea":[["\uD83C\uDDF3\uD83C\uDDEA"],"","",["flag-ne"],36,35,15,0],
		"1f1f3-1f1eb":[["\uD83C\uDDF3\uD83C\uDDEB"],"","",["flag-nf"],36,36,7,0],
		"1f1f3-1f1ec":[["\uD83C\uDDF3\uD83C\uDDEC"],"","",["flag-ng"],36,37,15,0],
		"1f1f3-1f1ee":[["\uD83C\uDDF3\uD83C\uDDEE"],"","",["flag-ni"],36,38,15,0],
		"1f1f3-1f1f1":[["\uD83C\uDDF3\uD83C\uDDF1"],"","",["flag-nl"],36,39,15,0],
		"1f1f3-1f1f4":[["\uD83C\uDDF3\uD83C\uDDF4"],"","",["flag-no"],36,40,15,0],
		"1f1f3-1f1f5":[["\uD83C\uDDF3\uD83C\uDDF5"],"","",["flag-np"],37,0,15,0],
		"1f1f3-1f1f7":[["\uD83C\uDDF3\uD83C\uDDF7"],"","",["flag-nr"],37,1,15,0],
		"1f1f3-1f1fa":[["\uD83C\uDDF3\uD83C\uDDFA"],"","",["flag-nu"],37,2,15,0],
		"1f1f3-1f1ff":[["\uD83C\uDDF3\uD83C\uDDFF"],"","",["flag-nz"],37,3,15,0],
		"1f1f4-1f1f2":[["\uD83C\uDDF4\uD83C\uDDF2"],"","",["flag-om"],37,4,15,0],
		"1f1f5-1f1e6":[["\uD83C\uDDF5\uD83C\uDDE6"],"","",["flag-pa"],37,5,15,0],
		"1f1f5-1f1ea":[["\uD83C\uDDF5\uD83C\uDDEA"],"","",["flag-pe"],37,6,15,0],
		"1f1f5-1f1eb":[["\uD83C\uDDF5\uD83C\uDDEB"],"","",["flag-pf"],37,7,15,0],
		"1f1f5-1f1ec":[["\uD83C\uDDF5\uD83C\uDDEC"],"","",["flag-pg"],37,8,15,0],
		"1f1f5-1f1ed":[["\uD83C\uDDF5\uD83C\uDDED"],"","",["flag-ph"],37,9,15,0],
		"1f1f5-1f1f0":[["\uD83C\uDDF5\uD83C\uDDF0"],"","",["flag-pk"],37,10,15,0],
		"1f1f5-1f1f1":[["\uD83C\uDDF5\uD83C\uDDF1"],"","",["flag-pl"],37,11,15,0],
		"1f1f5-1f1f2":[["\uD83C\uDDF5\uD83C\uDDF2"],"","",["flag-pm"],37,12,5,0],
		"1f1f5-1f1f3":[["\uD83C\uDDF5\uD83C\uDDF3"],"","",["flag-pn"],37,13,7,0],
		"1f1f5-1f1f7":[["\uD83C\uDDF5\uD83C\uDDF7"],"","",["flag-pr"],37,14,15,0],
		"1f1f5-1f1f8":[["\uD83C\uDDF5\uD83C\uDDF8"],"","",["flag-ps"],37,15,15,0],
		"1f1f5-1f1f9":[["\uD83C\uDDF5\uD83C\uDDF9"],"","",["flag-pt"],37,16,15,0],
		"1f1f5-1f1fc":[["\uD83C\uDDF5\uD83C\uDDFC"],"","",["flag-pw"],37,17,15,0],
		"1f1f5-1f1fe":[["\uD83C\uDDF5\uD83C\uDDFE"],"","",["flag-py"],37,18,15,0],
		"1f1f6-1f1e6":[["\uD83C\uDDF6\uD83C\uDDE6"],"","",["flag-qa"],37,19,15,0],
		"1f1f7-1f1ea":[["\uD83C\uDDF7\uD83C\uDDEA"],"","",["flag-re"],37,20,5,0],
		"1f1f7-1f1f4":[["\uD83C\uDDF7\uD83C\uDDF4"],"","",["flag-ro"],37,21,15,0],
		"1f1f7-1f1f8":[["\uD83C\uDDF7\uD83C\uDDF8"],"","",["flag-rs"],37,22,15,0],
		"1f1f7-1f1fa":[["\uD83C\uDDF7\uD83C\uDDFA"],"\uE512","\uDBB9\uDCEC",["flag-ru","ru"],37,23,15,0],
		"1f1f7-1f1fc":[["\uD83C\uDDF7\uD83C\uDDFC"],"","",["flag-rw"],37,24,15,0],
		"1f1f8-1f1e6":[["\uD83C\uDDF8\uD83C\uDDE6"],"","",["flag-sa"],37,25,15,0],
		"1f1f8-1f1e7":[["\uD83C\uDDF8\uD83C\uDDE7"],"","",["flag-sb"],37,26,15,0],
		"1f1f8-1f1e8":[["\uD83C\uDDF8\uD83C\uDDE8"],"","",["flag-sc"],37,27,15,0],
		"1f1f8-1f1e9":[["\uD83C\uDDF8\uD83C\uDDE9"],"","",["flag-sd"],37,28,15,0],
		"1f1f8-1f1ea":[["\uD83C\uDDF8\uD83C\uDDEA"],"","",["flag-se"],37,29,15,0],
		"1f1f8-1f1ec":[["\uD83C\uDDF8\uD83C\uDDEC"],"","",["flag-sg"],37,30,15,0],
		"1f1f8-1f1ed":[["\uD83C\uDDF8\uD83C\uDDED"],"","",["flag-sh"],37,31,13,0],
		"1f1f8-1f1ee":[["\uD83C\uDDF8\uD83C\uDDEE"],"","",["flag-si"],37,32,15,0],
		"1f1f8-1f1ef":[["\uD83C\uDDF8\uD83C\uDDEF"],"","",["flag-sj"],37,33,5,0],
		"1f1f8-1f1f0":[["\uD83C\uDDF8\uD83C\uDDF0"],"","",["flag-sk"],37,34,15,0],
		"1f1f8-1f1f1":[["\uD83C\uDDF8\uD83C\uDDF1"],"","",["flag-sl"],37,35,15,0],
		"1f1f8-1f1f2":[["\uD83C\uDDF8\uD83C\uDDF2"],"","",["flag-sm"],37,36,15,0],
		"1f1f8-1f1f3":[["\uD83C\uDDF8\uD83C\uDDF3"],"","",["flag-sn"],37,37,15,0],
		"1f1f8-1f1f4":[["\uD83C\uDDF8\uD83C\uDDF4"],"","",["flag-so"],37,38,15,0],
		"1f1f8-1f1f7":[["\uD83C\uDDF8\uD83C\uDDF7"],"","",["flag-sr"],37,39,15,0],
		"1f1f8-1f1f8":[["\uD83C\uDDF8\uD83C\uDDF8"],"","",["flag-ss"],37,40,7,0],
		"1f1f8-1f1f9":[["\uD83C\uDDF8\uD83C\uDDF9"],"","",["flag-st"],38,0,15,0],
		"1f1f8-1f1fb":[["\uD83C\uDDF8\uD83C\uDDFB"],"","",["flag-sv"],38,1,15,0],
		"1f1f8-1f1fd":[["\uD83C\uDDF8\uD83C\uDDFD"],"","",["flag-sx"],38,2,7,0],
		"1f1f8-1f1fe":[["\uD83C\uDDF8\uD83C\uDDFE"],"","",["flag-sy"],38,3,15,0],
		"1f1f8-1f1ff":[["\uD83C\uDDF8\uD83C\uDDFF"],"","",["flag-sz"],38,4,15,0],
		"1f1f9-1f1e6":[["\uD83C\uDDF9\uD83C\uDDE6"],"","",["flag-ta"],38,5,5,0],
		"1f1f9-1f1e8":[["\uD83C\uDDF9\uD83C\uDDE8"],"","",["flag-tc"],38,6,7,0],
		"1f1f9-1f1e9":[["\uD83C\uDDF9\uD83C\uDDE9"],"","",["flag-td"],38,7,15,0],
		"1f1f9-1f1eb":[["\uD83C\uDDF9\uD83C\uDDEB"],"","",["flag-tf"],38,8,5,0],
		"1f1f9-1f1ec":[["\uD83C\uDDF9\uD83C\uDDEC"],"","",["flag-tg"],38,9,15,0],
		"1f1f9-1f1ed":[["\uD83C\uDDF9\uD83C\uDDED"],"","",["flag-th"],38,10,15,0],
		"1f1f9-1f1ef":[["\uD83C\uDDF9\uD83C\uDDEF"],"","",["flag-tj"],38,11,15,0],
		"1f1f9-1f1f0":[["\uD83C\uDDF9\uD83C\uDDF0"],"","",["flag-tk"],38,12,7,0],
		"1f1f9-1f1f1":[["\uD83C\uDDF9\uD83C\uDDF1"],"","",["flag-tl"],38,13,15,0],
		"1f1f9-1f1f2":[["\uD83C\uDDF9\uD83C\uDDF2"],"","",["flag-tm"],38,14,15,0],
		"1f1f9-1f1f3":[["\uD83C\uDDF9\uD83C\uDDF3"],"","",["flag-tn"],38,15,15,0],
		"1f1f9-1f1f4":[["\uD83C\uDDF9\uD83C\uDDF4"],"","",["flag-to"],38,16,15,0],
		"1f1f9-1f1f7":[["\uD83C\uDDF9\uD83C\uDDF7"],"","",["flag-tr"],38,17,15,0],
		"1f1f9-1f1f9":[["\uD83C\uDDF9\uD83C\uDDF9"],"","",["flag-tt"],38,18,15,0],
		"1f1f9-1f1fb":[["\uD83C\uDDF9\uD83C\uDDFB"],"","",["flag-tv"],38,19,15,0],
		"1f1f9-1f1fc":[["\uD83C\uDDF9\uD83C\uDDFC"],"","",["flag-tw"],38,20,15,0],
		"1f1f9-1f1ff":[["\uD83C\uDDF9\uD83C\uDDFF"],"","",["flag-tz"],38,21,15,0],
		"1f1fa-1f1e6":[["\uD83C\uDDFA\uD83C\uDDE6"],"","",["flag-ua"],38,22,15,0],
		"1f1fa-1f1ec":[["\uD83C\uDDFA\uD83C\uDDEC"],"","",["flag-ug"],38,23,15,0],
		"1f1fa-1f1f2":[["\uD83C\uDDFA\uD83C\uDDF2"],"","",["flag-um"],38,24,5,0],
		"1f1fa-1f1f8":[["\uD83C\uDDFA\uD83C\uDDF8"],"\uE50C","\uDBB9\uDCE6",["flag-us","us"],38,25,15,0],
		"1f1fa-1f1fe":[["\uD83C\uDDFA\uD83C\uDDFE"],"","",["flag-uy"],38,26,15,0],
		"1f1fa-1f1ff":[["\uD83C\uDDFA\uD83C\uDDFF"],"","",["flag-uz"],38,27,15,0],
		"1f1fb-1f1e6":[["\uD83C\uDDFB\uD83C\uDDE6"],"","",["flag-va"],38,28,15,0],
		"1f1fb-1f1e8":[["\uD83C\uDDFB\uD83C\uDDE8"],"","",["flag-vc"],38,29,15,0],
		"1f1fb-1f1ea":[["\uD83C\uDDFB\uD83C\uDDEA"],"","",["flag-ve"],38,30,15,0],
		"1f1fb-1f1ec":[["\uD83C\uDDFB\uD83C\uDDEC"],"","",["flag-vg"],38,31,7,0],
		"1f1fb-1f1ee":[["\uD83C\uDDFB\uD83C\uDDEE"],"","",["flag-vi"],38,32,15,0],
		"1f1fb-1f1f3":[["\uD83C\uDDFB\uD83C\uDDF3"],"","",["flag-vn"],38,33,15,0],
		"1f1fb-1f1fa":[["\uD83C\uDDFB\uD83C\uDDFA"],"","",["flag-vu"],38,34,15,0],
		"1f1fc-1f1eb":[["\uD83C\uDDFC\uD83C\uDDEB"],"","",["flag-wf"],38,35,13,0],
		"1f1fc-1f1f8":[["\uD83C\uDDFC\uD83C\uDDF8"],"","",["flag-ws"],38,36,15,0],
		"1f1fd-1f1f0":[["\uD83C\uDDFD\uD83C\uDDF0"],"","",["flag-xk"],38,37,13,0],
		"1f1fe-1f1ea":[["\uD83C\uDDFE\uD83C\uDDEA"],"","",["flag-ye"],38,38,15,0],
		"1f1fe-1f1f9":[["\uD83C\uDDFE\uD83C\uDDF9"],"","",["flag-yt"],38,39,5,0],
		"1f1ff-1f1e6":[["\uD83C\uDDFF\uD83C\uDDE6"],"","",["flag-za"],38,40,15,0],
		"1f1ff-1f1f2":[["\uD83C\uDDFF\uD83C\uDDF2"],"","",["flag-zm"],39,0,15,0],
		"1f1ff-1f1fc":[["\uD83C\uDDFF\uD83C\uDDFC"],"","",["flag-zw"],39,1,15,0],
		"1f468-200d-1f468-200d-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC66"],"","",["man-man-boy"],39,2,15,0],
		"1f468-200d-1f468-200d-1f466-200d-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC66\u200D\uD83D\uDC66"],"","",["man-man-boy-boy"],39,3,15,0],
		"1f468-200d-1f468-200d-1f467":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67"],"","",["man-man-girl"],39,4,15,0],
		"1f468-200d-1f468-200d-1f467-200d-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC66"],"","",["man-man-girl-boy"],39,5,15,0],
		"1f468-200d-1f468-200d-1f467-200d-1f467":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC67"],"","",["man-man-girl-girl"],39,6,15,0],
		"1f468-200d-1f469-200d-1f466-200d-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66"],"","",["man-woman-boy-boy"],39,7,15,0],
		"1f468-200d-1f469-200d-1f467":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67"],"","",["man-woman-girl"],39,8,15,0],
		"1f468-200d-1f469-200d-1f467-200d-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66"],"","",["man-woman-girl-boy"],39,9,15,0],
		"1f468-200d-1f469-200d-1f467-200d-1f467":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC67"],"","",["man-woman-girl-girl"],39,10,15,0],
		"1f468-200d-2764-fe0f-200d-1f468":[["\uD83D\uDC68\u200D\u2764\uFE0F\u200D\uD83D\uDC68"],"","",["man-heart-man"],39,11,7,0],
		"1f468-200d-2764-fe0f-200d-1f48b-200d-1f468":[["\uD83D\uDC68\u200D\u2764\uFE0F\u200D\uD83D\uDC8B\u200D\uD83D\uDC68"],"","",["man-kiss-man"],39,12,7,0],
		"1f469-200d-1f469-200d-1f466":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC66"],"","",["woman-woman-boy"],39,13,15,0],
		"1f469-200d-1f469-200d-1f466-200d-1f466":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66"],"","",["woman-woman-boy-boy"],39,14,15,0],
		"1f469-200d-1f469-200d-1f467":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67"],"","",["woman-woman-girl"],39,15,15,0],
		"1f469-200d-1f469-200d-1f467-200d-1f466":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66"],"","",["woman-woman-girl-boy"],39,16,15,0],
		"1f469-200d-1f469-200d-1f467-200d-1f467":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC67"],"","",["woman-woman-girl-girl"],39,17,15,0],
		"1f469-200d-2764-fe0f-200d-1f469":[["\uD83D\uDC69\u200D\u2764\uFE0F\u200D\uD83D\uDC69"],"","",["woman-heart-woman"],39,18,7,0],
		"1f469-200d-2764-fe0f-200d-1f48b-200d-1f469":[["\uD83D\uDC69\u200D\u2764\uFE0F\u200D\uD83D\uDC8B\u200D\uD83D\uDC69"],"","",["woman-kiss-woman"],39,19,7,0]
	};
	/** @private */
	emoji.emoticons_data = {
		"<3":"heart",
		":o)":"monkey_face",
		":*":"kiss",
		":-*":"kiss",
		"<\/3":"broken_heart",
		"=)":"smiley",
		"=-)":"smiley",
		"C:":"smile",
		"c:":"smile",
		":D":"smile",
		":-D":"smile",
		":>":"laughing",
		":->":"laughing",
		";)":"wink",
		";-)":"wink",
		":)":"blush",
		"(:":"blush",
		":-)":"blush",
		"8)":"sunglasses",
		":|":"neutral_face",
		":-|":"neutral_face",
		":\\":"confused",
		":-\\":"confused",
		":\/":"confused",
		":-\/":"confused",
		":p":"stuck_out_tongue",
		":-p":"stuck_out_tongue",
		":P":"stuck_out_tongue",
		":-P":"stuck_out_tongue",
		":b":"stuck_out_tongue",
		":-b":"stuck_out_tongue",
		";p":"stuck_out_tongue_winking_eye",
		";-p":"stuck_out_tongue_winking_eye",
		";b":"stuck_out_tongue_winking_eye",
		";-b":"stuck_out_tongue_winking_eye",
		";P":"stuck_out_tongue_winking_eye",
		";-P":"stuck_out_tongue_winking_eye",
		"):":"disappointed",
		":(":"disappointed",
		":-(":"disappointed",
		">:(":"angry",
		">:-(":"angry",
		":'(":"cry",
		"D:":"anguished",
		":o":"open_mouth",
		":-o":"open_mouth"
	};
	/** @private */
	emoji.variations_data = {
		"261d-1f3fb":[1,10,5],
		"261d-1f3fc":[1,11,5],
		"261d-1f3fd":[1,12,5],
		"261d-1f3fe":[1,13,5],
		"261d-1f3ff":[1,14,5],
		"26f9-1f3fb":[2,38,5],
		"26f9-1f3fc":[2,39,5],
		"26f9-1f3fd":[2,40,5],
		"26f9-1f3fe":[3,0,5],
		"26f9-1f3ff":[3,1,5],
		"270a-1f3fb":[3,9,5],
		"270a-1f3fc":[3,10,5],
		"270a-1f3fd":[3,11,5],
		"270a-1f3fe":[3,12,5],
		"270a-1f3ff":[3,13,5],
		"270b-1f3fb":[3,15,5],
		"270b-1f3fc":[3,16,5],
		"270b-1f3fd":[3,17,5],
		"270b-1f3fe":[3,18,5],
		"270b-1f3ff":[3,19,5],
		"270c-1f3fb":[3,21,5],
		"270c-1f3fc":[3,22,5],
		"270c-1f3fd":[3,23,5],
		"270c-1f3fe":[3,24,5],
		"270c-1f3ff":[3,25,5],
		"270d-1f3fb":[3,27,5],
		"270d-1f3fc":[3,28,5],
		"270d-1f3fd":[3,29,5],
		"270d-1f3fe":[3,30,5],
		"270d-1f3ff":[3,31,5],
		"1f385-1f3fb":[8,29,5],
		"1f385-1f3fc":[8,30,5],
		"1f385-1f3fd":[8,31,5],
		"1f385-1f3fe":[8,32,5],
		"1f385-1f3ff":[8,33,5],
		"1f3c3-1f3fb":[10,9,5],
		"1f3c3-1f3fc":[10,10,5],
		"1f3c3-1f3fd":[10,11,5],
		"1f3c3-1f3fe":[10,12,5],
		"1f3c3-1f3ff":[10,13,5],
		"1f3c4-1f3fb":[10,15,5],
		"1f3c4-1f3fc":[10,16,5],
		"1f3c4-1f3fd":[10,17,5],
		"1f3c4-1f3fe":[10,18,5],
		"1f3c4-1f3ff":[10,19,5],
		"1f3c7-1f3fb":[10,23,5],
		"1f3c7-1f3fc":[10,24,5],
		"1f3c7-1f3fd":[10,25,5],
		"1f3c7-1f3fe":[10,26,5],
		"1f3c7-1f3ff":[10,27,5],
		"1f3ca-1f3fb":[10,31,5],
		"1f3ca-1f3fc":[10,32,5],
		"1f3ca-1f3fd":[10,33,5],
		"1f3ca-1f3fe":[10,34,5],
		"1f3ca-1f3ff":[10,35,5],
		"1f3cb-1f3fb":[10,37,5],
		"1f3cb-1f3fc":[10,38,5],
		"1f3cb-1f3fd":[10,39,5],
		"1f3cb-1f3fe":[10,40,5],
		"1f3cb-1f3ff":[11,0,5],
		"1f442-1f3fb":[13,35,5],
		"1f442-1f3fc":[13,36,5],
		"1f442-1f3fd":[13,37,5],
		"1f442-1f3fe":[13,38,5],
		"1f442-1f3ff":[13,39,5],
		"1f443-1f3fb":[14,0,5],
		"1f443-1f3fc":[14,1,5],
		"1f443-1f3fd":[14,2,5],
		"1f443-1f3fe":[14,3,5],
		"1f443-1f3ff":[14,4,5],
		"1f446-1f3fb":[14,8,5],
		"1f446-1f3fc":[14,9,5],
		"1f446-1f3fd":[14,10,5],
		"1f446-1f3fe":[14,11,5],
		"1f446-1f3ff":[14,12,5],
		"1f447-1f3fb":[14,14,5],
		"1f447-1f3fc":[14,15,5],
		"1f447-1f3fd":[14,16,5],
		"1f447-1f3fe":[14,17,5],
		"1f447-1f3ff":[14,18,5],
		"1f448-1f3fb":[14,20,5],
		"1f448-1f3fc":[14,21,5],
		"1f448-1f3fd":[14,22,5],
		"1f448-1f3fe":[14,23,5],
		"1f448-1f3ff":[14,24,5],
		"1f449-1f3fb":[14,26,5],
		"1f449-1f3fc":[14,27,5],
		"1f449-1f3fd":[14,28,5],
		"1f449-1f3fe":[14,29,5],
		"1f449-1f3ff":[14,30,5],
		"1f44a-1f3fb":[14,32,5],
		"1f44a-1f3fc":[14,33,5],
		"1f44a-1f3fd":[14,34,5],
		"1f44a-1f3fe":[14,35,5],
		"1f44a-1f3ff":[14,36,5],
		"1f44b-1f3fb":[14,38,5],
		"1f44b-1f3fc":[14,39,5],
		"1f44b-1f3fd":[14,40,5],
		"1f44b-1f3fe":[15,0,5],
		"1f44b-1f3ff":[15,1,5],
		"1f44c-1f3fb":[15,3,5],
		"1f44c-1f3fc":[15,4,5],
		"1f44c-1f3fd":[15,5,5],
		"1f44c-1f3fe":[15,6,5],
		"1f44c-1f3ff":[15,7,5],
		"1f44d-1f3fb":[15,9,5],
		"1f44d-1f3fc":[15,10,5],
		"1f44d-1f3fd":[15,11,5],
		"1f44d-1f3fe":[15,12,5],
		"1f44d-1f3ff":[15,13,5],
		"1f44e-1f3fb":[15,15,5],
		"1f44e-1f3fc":[15,16,5],
		"1f44e-1f3fd":[15,17,5],
		"1f44e-1f3fe":[15,18,5],
		"1f44e-1f3ff":[15,19,5],
		"1f44f-1f3fb":[15,21,5],
		"1f44f-1f3fc":[15,22,5],
		"1f44f-1f3fd":[15,23,5],
		"1f44f-1f3fe":[15,24,5],
		"1f44f-1f3ff":[15,25,5],
		"1f450-1f3fb":[15,27,5],
		"1f450-1f3fc":[15,28,5],
		"1f450-1f3fd":[15,29,5],
		"1f450-1f3fe":[15,30,5],
		"1f450-1f3ff":[15,31,5],
		"1f466-1f3fb":[16,13,5],
		"1f466-1f3fc":[16,14,5],
		"1f466-1f3fd":[16,15,5],
		"1f466-1f3fe":[16,16,5],
		"1f466-1f3ff":[16,17,5],
		"1f467-1f3fb":[16,19,5],
		"1f467-1f3fc":[16,20,5],
		"1f467-1f3fd":[16,21,5],
		"1f467-1f3fe":[16,22,5],
		"1f467-1f3ff":[16,23,5],
		"1f468-1f3fb":[16,25,5],
		"1f468-1f3fc":[16,26,5],
		"1f468-1f3fd":[16,27,5],
		"1f468-1f3fe":[16,28,5],
		"1f468-1f3ff":[16,29,5],
		"1f469-1f3fb":[16,31,5],
		"1f469-1f3fc":[16,32,5],
		"1f469-1f3fd":[16,33,5],
		"1f469-1f3fe":[16,34,5],
		"1f469-1f3ff":[16,35,5],
		"1f46e-1f3fb":[17,0,5],
		"1f46e-1f3fc":[17,1,5],
		"1f46e-1f3fd":[17,2,5],
		"1f46e-1f3fe":[17,3,5],
		"1f46e-1f3ff":[17,4,5],
		"1f470-1f3fb":[17,7,5],
		"1f470-1f3fc":[17,8,5],
		"1f470-1f3fd":[17,9,5],
		"1f470-1f3fe":[17,10,5],
		"1f470-1f3ff":[17,11,5],
		"1f471-1f3fb":[17,13,5],
		"1f471-1f3fc":[17,14,5],
		"1f471-1f3fd":[17,15,5],
		"1f471-1f3fe":[17,16,5],
		"1f471-1f3ff":[17,17,5],
		"1f472-1f3fb":[17,19,5],
		"1f472-1f3fc":[17,20,5],
		"1f472-1f3fd":[17,21,5],
		"1f472-1f3fe":[17,22,5],
		"1f472-1f3ff":[17,23,5],
		"1f473-1f3fb":[17,25,5],
		"1f473-1f3fc":[17,26,5],
		"1f473-1f3fd":[17,27,5],
		"1f473-1f3fe":[17,28,5],
		"1f473-1f3ff":[17,29,5],
		"1f474-1f3fb":[17,31,5],
		"1f474-1f3fc":[17,32,5],
		"1f474-1f3fd":[17,33,5],
		"1f474-1f3fe":[17,34,5],
		"1f474-1f3ff":[17,35,5],
		"1f475-1f3fb":[17,37,5],
		"1f475-1f3fc":[17,38,5],
		"1f475-1f3fd":[17,39,5],
		"1f475-1f3fe":[17,40,5],
		"1f475-1f3ff":[18,0,5],
		"1f476-1f3fb":[18,2,5],
		"1f476-1f3fc":[18,3,5],
		"1f476-1f3fd":[18,4,5],
		"1f476-1f3fe":[18,5,5],
		"1f476-1f3ff":[18,6,5],
		"1f477-1f3fb":[18,8,5],
		"1f477-1f3fc":[18,9,5],
		"1f477-1f3fd":[18,10,5],
		"1f477-1f3fe":[18,11,5],
		"1f477-1f3ff":[18,12,5],
		"1f478-1f3fb":[18,14,5],
		"1f478-1f3fc":[18,15,5],
		"1f478-1f3fd":[18,16,5],
		"1f478-1f3fe":[18,17,5],
		"1f478-1f3ff":[18,18,5],
		"1f47c-1f3fb":[18,23,5],
		"1f47c-1f3fc":[18,24,5],
		"1f47c-1f3fd":[18,25,5],
		"1f47c-1f3fe":[18,26,5],
		"1f47c-1f3ff":[18,27,5],
		"1f481-1f3fb":[18,33,5],
		"1f481-1f3fc":[18,34,5],
		"1f481-1f3fd":[18,35,5],
		"1f481-1f3fe":[18,36,5],
		"1f481-1f3ff":[18,37,5],
		"1f482-1f3fb":[18,39,5],
		"1f482-1f3fc":[18,40,5],
		"1f482-1f3fd":[19,0,5],
		"1f482-1f3fe":[19,1,5],
		"1f482-1f3ff":[19,2,5],
		"1f483-1f3fb":[19,4,5],
		"1f483-1f3fc":[19,5,5],
		"1f483-1f3fd":[19,6,5],
		"1f483-1f3fe":[19,7,5],
		"1f483-1f3ff":[19,8,5],
		"1f485-1f3fb":[19,11,5],
		"1f485-1f3fc":[19,12,5],
		"1f485-1f3fd":[19,13,5],
		"1f485-1f3fe":[19,14,5],
		"1f485-1f3ff":[19,15,5],
		"1f486-1f3fb":[19,17,5],
		"1f486-1f3fc":[19,18,5],
		"1f486-1f3fd":[19,19,5],
		"1f486-1f3fe":[19,20,5],
		"1f486-1f3ff":[19,21,5],
		"1f487-1f3fb":[19,23,5],
		"1f487-1f3fc":[19,24,5],
		"1f487-1f3fd":[19,25,5],
		"1f487-1f3fe":[19,26,5],
		"1f487-1f3ff":[19,27,5],
		"1f4aa-1f3fb":[20,22,5],
		"1f4aa-1f3fc":[20,23,5],
		"1f4aa-1f3fd":[20,24,5],
		"1f4aa-1f3fe":[20,25,5],
		"1f4aa-1f3ff":[20,26,5],
		"1f590-1f3fb":[25,13,5],
		"1f590-1f3fc":[25,14,5],
		"1f590-1f3fd":[25,15,5],
		"1f590-1f3fe":[25,16,5],
		"1f590-1f3ff":[25,17,5],
		"1f595-1f3fb":[25,19,5],
		"1f595-1f3fc":[25,20,5],
		"1f595-1f3fd":[25,21,5],
		"1f595-1f3fe":[25,22,5],
		"1f595-1f3ff":[25,23,5],
		"1f596-1f3fb":[25,25,5],
		"1f596-1f3fc":[25,26,5],
		"1f596-1f3fd":[25,27,5],
		"1f596-1f3fe":[25,28,5],
		"1f596-1f3ff":[25,29,5],
		"1f645-1f3fb":[28,2,5],
		"1f645-1f3fc":[28,3,5],
		"1f645-1f3fd":[28,4,5],
		"1f645-1f3fe":[28,5,5],
		"1f645-1f3ff":[28,6,5],
		"1f646-1f3fb":[28,8,5],
		"1f646-1f3fc":[28,9,5],
		"1f646-1f3fd":[28,10,5],
		"1f646-1f3fe":[28,11,5],
		"1f646-1f3ff":[28,12,5],
		"1f647-1f3fb":[28,14,5],
		"1f647-1f3fc":[28,15,5],
		"1f647-1f3fd":[28,16,5],
		"1f647-1f3fe":[28,17,5],
		"1f647-1f3ff":[28,18,5],
		"1f64b-1f3fb":[28,23,5],
		"1f64b-1f3fc":[28,24,5],
		"1f64b-1f3fd":[28,25,5],
		"1f64b-1f3fe":[28,26,5],
		"1f64b-1f3ff":[28,27,5],
		"1f64c-1f3fb":[28,29,5],
		"1f64c-1f3fc":[28,30,5],
		"1f64c-1f3fd":[28,31,5],
		"1f64c-1f3fe":[28,32,5],
		"1f64c-1f3ff":[28,33,5],
		"1f64d-1f3fb":[28,35,5],
		"1f64d-1f3fc":[28,36,5],
		"1f64d-1f3fd":[28,37,5],
		"1f64d-1f3fe":[28,38,5],
		"1f64d-1f3ff":[28,39,5],
		"1f64e-1f3fb":[29,0,5],
		"1f64e-1f3fc":[29,1,5],
		"1f64e-1f3fd":[29,2,5],
		"1f64e-1f3fe":[29,3,5],
		"1f64e-1f3ff":[29,4,5],
		"1f64f-1f3fb":[29,6,5],
		"1f64f-1f3fc":[29,7,5],
		"1f64f-1f3fd":[29,8,5],
		"1f64f-1f3fe":[29,9,5],
		"1f64f-1f3ff":[29,10,5],
		"1f6a3-1f3fb":[30,6,5],
		"1f6a3-1f3fc":[30,7,5],
		"1f6a3-1f3fd":[30,8,5],
		"1f6a3-1f3fe":[30,9,5],
		"1f6a3-1f3ff":[30,10,5],
		"1f6b4-1f3fb":[30,28,5],
		"1f6b4-1f3fc":[30,29,5],
		"1f6b4-1f3fd":[30,30,5],
		"1f6b4-1f3fe":[30,31,5],
		"1f6b4-1f3ff":[30,32,5],
		"1f6b5-1f3fb":[30,34,5],
		"1f6b5-1f3fc":[30,35,5],
		"1f6b5-1f3fd":[30,36,5],
		"1f6b5-1f3fe":[30,37,5],
		"1f6b5-1f3ff":[30,38,5],
		"1f6b6-1f3fb":[30,40,5],
		"1f6b6-1f3fc":[31,0,5],
		"1f6b6-1f3fd":[31,1,5],
		"1f6b6-1f3fe":[31,2,5],
		"1f6b6-1f3ff":[31,3,5],
		"1f6c0-1f3fb":[31,14,5],
		"1f6c0-1f3fc":[31,15,5],
		"1f6c0-1f3fd":[31,16,5],
		"1f6c0-1f3fe":[31,17,5],
		"1f6c0-1f3ff":[31,18,5],
		"1f918-1f3fb":[32,9,5],
		"1f918-1f3fc":[32,10,5],
		"1f918-1f3fd":[32,11,5],
		"1f918-1f3fe":[32,12,5],
		"1f918-1f3ff":[32,13,5]
	};

	if (typeof exports === 'object'){
		module.exports = emoji;
	}else if (typeof define === 'function' && define.amd){
		define(function() { return emoji; });
	}else{
		this.emoji = emoji;
	}
	
	if (local_setup) local_setup(emoji);
}).call(function(){
	return this || (typeof window !== 'undefined' ? window : global);
}(), function(emoji) {
	
	// Set up emoji for your environment here!
	// For instance, you might want to always
	// render emoji as HTML, and include the
	// name as the title of the HTML elements:

	/*
	emoji.include_title = true;
	emoji.allow_native = false;
	*/

	// And you might want to always use
	// Google's emoji images:

	/*
	emoji.img_set = 'google';
	*/

	// And you might want want to point to
	// a CDN for your sheets and img files

	/*
	emoji.img_sets['google']['path'] = 'http://cdn.example.com/emoji/';
	emoji.img_sets['google']['sheet'] = 'http://cdn.example.com/emoji/sheet_google_64.png';
	*/

});
