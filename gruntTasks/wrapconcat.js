/*global module,require*/
/**
 * Wrap and concatenate angular templates
 */
module.exports = function(grunt) {
	'use strict';
	var fs = require('fs')
		,glob = require('glob');
	grunt.registerMultiTask('wrapconcat', '', function() {
		var oOptions = this.options({})
			,data = this.data
			,src = data.src
			,root = data.root||'/'
			,dest = data.dest
			,files = []
			,contents = '';
		src.forEach(function(globSrc){
			glob.sync(globSrc).forEach(function(file){
				if (files.indexOf(file)===-1) files.push(file);
			});
		});
		files.forEach(function(file){
			var sFileName = file.split(root).pop();
			contents += oOptions.prefix.replace('%filename%',sFileName)+fs.readFileSync(file).toString().replace(/[\r\n\t]/g,' ').replace(/\s+/g,' ').replace(/>\s</g,'><')+oOptions.suffix;
			console.log('\t',sFileName); // log
		});
		fs.writeFileSync(dest,contents);
		grunt.log.writeln(files.length+' files wrapped and concatenated.');
	});
};