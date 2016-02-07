var mkdirp = require('mkdirp')
	,glob = require('glob')
	,fs = require('fs')
;

Promise.all([
	glomise('./src/img/*')
	,glomise('./src/*')
]).then(function(results){
	Array.prototype.concat.apply(results.pop(),results).forEach(function(file){
		if (!fs.lstatSync(file).isDirectory()) {
			mkdirp(getDirName(file), function(err) {
				fs.createReadStream(file).pipe(fs.createWriteStream(file.replace(/^\.\/src/,'./dist')));
			});
		}
	});
});

function glomise(globstring) {
	return new Promise(function (resolve,reject) {
		glob(globstring,function(err,result){
			resolve(result);
		});
	});
}

function getDirName(file){
	return file.replace(/[^\/\\]*\.\w{0,4}$/,'');
}