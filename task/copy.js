var mkdirp = require('mkdirp')
	,glob = require('glob')
	,fs = require('fs')
	,glomise = require(__dirname+'/util/glomise')
;

Promise.all([
	glomise('./src/*')
	,glomise('./src/img/*')
	,glomise('./src/fonts/*')
	,glomise('./src/style/*.css')
]).then(function(results){
	Array.prototype.concat.apply(results.pop(),results).forEach(function(file){
		if (!fs.lstatSync(file).isDirectory()) {
			mkdirp(getDirName(file), function(err) {
				fs.createReadStream(file).pipe(fs.createWriteStream(file.replace(/^\.\/src/,'./dist')));
			});
		}
	});
});

function getDirName(file){
	return file.replace(/[^\/\\]*\.\w{0,4}$/,'');
}