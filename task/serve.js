/*global process*/
var connect = require('connect')
		,serveStatic = require('serve-static')
		,openBrowser = require('open')
		,commander = require('commander')
				.usage('[options] <files ...>')
				.option('--root [root]', 'The root folder')
				.option('--port [port]', 'Target port')
				.parse(process.argv)
		,root = commander.root||'src'
		,port = commander.port||8181
		,adress = 'http://localhost:'+port
;
console.log('Serving',root,'on',adress);

connect()
		.use(serveStatic('./' + root + '/'))
		.listen(port);

openBrowser(adress);