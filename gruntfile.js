module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-push-release');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jscs');

    grunt.initConfig({
        jshint : {
            options : {
                jshintrc : '.jshintrc'
            },
            src : [ 'Gruntfile.js', 'src/**/*.js' ]
        },
        jscs : {
            src : 'src/**/*.js'
        }
    });
};
