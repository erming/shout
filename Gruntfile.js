module.exports = function(grunt) {
	var libs = "client/js/libs/**/*.js";
	grunt.initConfig({
		watch: {
			files: libs,
			tasks: ["uglify"]
		},
		uglify: {
			options: {
				compress: false
			},
			js: {
				files: {
					"client/js/libs.min.js": libs
				}
			}
		},
		autoprefixer: {
	      dist: {
	          files: {
	              "client/css/prefixed.style.css":
	                "client/css/style.css"
	          }
	      }
	    },
	    cssmin: {
		  combine: {
		    files: {
		      "client/css/prefixed.styles.min.css": [
		      	"client/css/bootstrap.css",
		      	"client/css/prefixed.style.css"
		      	]
		    }
		  }
		}
	});
	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.registerTask(
		"default",
		["uglify", "autoprefixer", "cssmin"]
	);
};
