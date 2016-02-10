var childProcess = require('child_process');

new Promise(function(resolve){resolve();})
	.then(runScript.bind(null,'./task/copy.js'))
	.then(runScript.bind(null,'./task/less.js'))
	.then(runScript.bind(null,'./task/uglify.js'))
;

function runScript(scriptPath) {
	return new Promise(function(resolve,reject){
    var invoked = false;
    var process = childProcess.fork(scriptPath);
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        reject(err);
    });
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        resolve(err);
    });

	});
}