var less = require('less')
	,fs = require('fs')
	,warn = console.warn.bind(console)
;

read('./src/style/screen.less')
	.then(parseLess,warn)
	.then(save.bind(null,'./src/style/screen.css'),warn)
	.then(console.log.bind(console,'done'));

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

function save(file,data){
	return new Promise(function(resolve,reject){
		fs.writeFile(file,data,function(err,data) {
			if (err) reject(err);
			else resolve(data);
		});
	});
}