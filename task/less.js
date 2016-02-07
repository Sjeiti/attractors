var less = require('less')
	,fs = require('fs')
	,mkdirp = require('mkdirp')
	,postcss = require('postcss')
	,autoprefixer = require('autoprefixer')
	,warn = console.warn.bind(console)
	//
	,srcLess = './src/style/screen.less'
	,targetCss = [
		'./src/style/screen.css'
	]
;

read(srcLess)
	.then(parseLess,warn)
	.then(saveFiles,warn)
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

function parseLess(data){
	return new Promise(function(resolve,reject){
		less.render(data,{compress:true}, function (err, output) {
			if (err) reject(err);
			else resolve(output.css);
		});
	});
}

function saveFiles(data) {
	targetCss.forEach(function(file){
		save(file,data);
	});
}

function save(file,data) {
	console.log('save',file); // todo: remove log
	return new Promise(function(resolve,reject){
		mkdirp(getDirName(file), function(err) {
			err&&reject(err);
			postcss([autoprefixer]).process(data).then(function (result) {
					result.warnings().forEach(warn);
					fs.writeFile(file, result.css, resolve);
			});
		});
	});
}

function getDirName(file){
	return file.replace(/[^\/\\]*\.\w{0,4}$/,'');
}