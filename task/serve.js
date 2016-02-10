/*global process*/
var connect = require('connect'),
  serveStatic = require('serve-static'),
  openBrowser = require('open'),
	root = process.argv[2]||'src',
  port = 8181
;
console.log('root',root);

connect()
    .use(serveStatic('./'+root+'/'))
    .listen(port);

openBrowser('http://localhost:'+port);