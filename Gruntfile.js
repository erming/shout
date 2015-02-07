var loadTasks = require("load-grunt-tasks");
var path = require("path");

module.exports = function(grunt) {
	loadTasks(grunt);

	grunt.file.setBase("client/");

  grunt.initConfig({
		handlebars: {
			options: {
				namespace: "JST",
				processName: function(file) {
					return path.basename(file, ".tpl");
				}
			},
			dist: {
				files: {
					"dist/tmp/tpl.js": ["tpl/**/*.tpl"]
				}
			}
		},
    uglify: {
      options: {
				compress: false
			},
      dist: {
				files: {
					"dist/shout.min.js": ["js/**/*.js", "dist/tmp/*.js"]
				}
			}
    },
		watch: {
      tpl: {
        files: ["tpl/*.tpl"],
        tasks: ["handlebars", "uglify"]
      },
			js: {
				files: ["js/**/*.js"],
				tasks: ["uglify"]
			}
		}
  });

  grunt.registerTask(
    "default",
    ["handlebars", "uglify"]
  );
};
