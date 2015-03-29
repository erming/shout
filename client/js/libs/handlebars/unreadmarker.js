Handlebars.registerHelper(
	"unread-messages-marker", function(index, length, unread) {
		if (unread == length - index - 1) {
			return new Handlebars.SafeString(
				Handlebars.templates["unreadmarker"]());
		} else {
			return null;
		}
	}
);
