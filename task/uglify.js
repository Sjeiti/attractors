var uglify = require('uglify-js')
	,htmlparser = require('htmlparser2')
	,mkdirp = require('mkdirp')
	,fs = require('fs')
	,warn = console.warn.bind(console)
	//
	,srcIndex = './src/index.html'
	,targetIndex = './dist/index.html'
	,targetJs = './dist/js/attractors.min.js'
;

read(srcIndex)
	.then(findJs,warn)
	.then(loadJs,warn)
	.then(minify,warn)
	.then(save.bind(null,targetJs),warn)
	.then(console.log.bind(console,'done'),warn)
;

function read(file){
	return new Promise(function(resolve,reject){
		fs.readFile(file, function (err, data) {
			if (err) reject(err);
			else resolve(data.toString());
		});
	});
}

function findJs(data){
	//
	//var html = data.replace(/<script.*<\/script>/,'<script src="/js/attractors.min.js"></script>');
	var foo = data.replace(/[\n\r\t]/g,'').match(/<!--script-->.*<!--\/script-->/g).pop();
	var html = data.replace(/[\n\r\t]/g,'').replace(/<!--script-->.*<!--\/script-->/,'<script src="/js/attractors.min.js"></script>').replace(/<!--[\s\S]*?-->/g,'');
	//var html = data.replace(/[\n\r\t]/g,'').replace(/<!--[\s\S]*?-->/g,'').replace(/<script.*<\/script>/,'<script src="/js/attractors.min.js"></script>');
	save(targetIndex,html);
	//
	console.log('foo',foo); // todo: remove log
	//
	var js = []
		,isNextText = false
		,parser = new htmlparser.Parser({
			onopentag: function(name, attribs){
				if(name==='script'&&attribs.type===undefined){
					var src = attribs.src;
					if (src) js.push({src:src});
					else isNextText = true;
				}
			},
			ontext: function(text){
				if (isNextText) {
					js.push({text:text});
					isNextText = false;
				}
			},
			onclosetag: function(tagname){}
		}, {decodeEntities: true});
	parser.write(foo);
	parser.end();
	return js;
}

function loadJs(js){
	return Promise.all(js.map(function(o){
		return o.src&&read('./src'+o.src)||(new Promise(function(r){r(o.text);}));
	}));
}

function minify(files){
	return uglify.minify(files.join(';'), {
		fromString: true
		,pure_getters: true
	}).code;//files.join(';');//
}

function save(file,data) {
	return new Promise(function(resolve,reject){
		mkdirp(getDirName(file), function(err) {
			err&&reject(err);
			fs.writeFile(file, data, resolve);
		});
	});
}

function getDirName(file){
	return file.replace(/[^\/\\]*\.\w{0,4}$/,'');
}