module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      tpl: {
        files: "client/tpl/**/*.tpl",
        tasks: ["default"]
      },
      js: {
        files: "client/js/**/*.js",
        tasks: ["uglify"]
      }
    },
    uglify: {
      options: {
        compress: false
      },
      js: {
        files: {
          "client/dist/shout.min.js": "client/js/**/*.js"
        }
      }
    },
    clean: {
      tpl: {
        src: "client/js/tpl.js"
      }
    }
  });
  grunt.loadNpmTasks("grunt-contrib-clean")
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask(
    "build",
    function() {
      grunt.util.spawn({
        cmd: "node_modules/.bin/handlebars",
        args: ["client/tpl/", "-e", "tpl", "-f", "client/js/tpl.js"]
      }, function(err) {
        if (err) {
          console.log(err);
        }
      });
    }
  );
  grunt.registerTask(
    "default",
    ["build", "uglify", "clean"]
  );
};
