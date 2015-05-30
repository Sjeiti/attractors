/*global module,require*/
module.exports = function(grunt) {
'use strict';
	grunt.registerMultiTask('renderPage', 'Render pages', function(){
		var done = this.async()
			,fs = require('fs')
			,request = require('request')
			//
			,data = this.data
			,baseUri = data.baseUri
			,targetPath = data.dest||'render/'
			,pages = data.pages
			//
			,pageCounter = 0
		;

		for (var src in pages) {
			pageCounter++;
			var dest = pages[src]
				,url = baseUri+src;
			request(url,handleRequest.bind(null,url,dest));
		}

		function handleRequest(url, page, error, response, body){
			if (!error) {
				fs.writeFile(targetPath+page, body);
				console.log('response.statusCode',response.statusCode,page,url); // log
			} else {
				console.log('response.statusCode',response.statusCode,url); // log
			}
			pageCounter--;
			pageCounter===0&&done();
		}
	});
};
