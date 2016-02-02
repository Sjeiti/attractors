var uglify = require('uglify-js')
	,htmlparser = require('htmlparser2')
	,fs = require('fs')
	,warn = console.warn.bind(console)
;

read('./src/index.html')
	.then(findJs,warn)
	.then(loadJs,warn)
	.then(minify,warn)
	.then(save.bind(null,'./dist/js/attractors.min.js'),warn)
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
	parser.write(data);
	parser.end();
	return js;
}

function loadJs(js){
	return Promise.all(js.map(function(o){
		return o.src&&read('./src'+o.src)||(new Promise(function(r){r(o.text);}));
	}));
}

function minify(files){
	return uglify.minify(files.join(';'), {fromString: true}).code;
}

function save(file,data){
	return new Promise(function(resolve,reject){
		fs.writeFile(file,data,function(err,data) {
			if (err) reject(err);
			else resolve(data);
		});
	});
}
