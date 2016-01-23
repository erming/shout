var timestamp = window.timestamp;

Handlebars.registerHelper(
	"tz", function(time) {
		if (time) {
			var utc = moment.utc(time).toDate();
			return moment(utc).format(timestamp);
		} else {
			return "";
		}
	}
);
