/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    // Task configuration.

    image_resize: {
      resize: {
        options: {
          width: 150,
        },
        src: ['file/*.jpg','file/*.png'],
        dest: 'file/thumb/'
      }
    },
    
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 7,
          progressive: true
        },
        files: [{
          expand: true,
          cwd: 'file/',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: 'file/'
        }]
      }
    }


  });

  grunt.loadNpmTasks('grunt-image-resize');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  
  // Default task.
  grunt.registerTask('default', ['image_resize', 'imagemin',]);

  grunt.registerTask('resize', [
  'image_resize'
  ]);
  
};

