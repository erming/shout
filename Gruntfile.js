var loadTasks = require("load-grunt-tasks");
var path = require("path");

module.exports = function(grunt) {
	loadTasks(grunt);

	grunt.file.setBase("client/");

	grunt.initConfig({
		clean: {
			dist: {
				src: ["dist/tpl.js", "dist/libs.js"]
			}
		},
		concat: {
			dist: {
				files: {
					"dist/shout.min.js": ["dist/libs.js", "js/*.js"]
				}
			}
		},
		handlebars: {
			options: {
				namespace: "JST",
				processName: function(file) {
					return path.basename(file, ".tpl");
				}
			},
			dist: {
				files: {
					"dist/tpl.js": ["tpl/**/*.tpl"]
				}
			}
		},
		uglify: {
			options: {
				compress: false
			},
			dist: {
				files: {
					"dist/libs.js": ["js/libs/*.js", "dist/tpl.js"]
				}
			}
		},
		watch: {
			dist: {
				files: ["tpl/*.tpl", "js/**/*.js"],
				tasks: ["default"]
			}
		}
	});

	grunt.registerTask(
		"default",
		["handlebars", "uglify", "concat", "clean"]
	);
};
