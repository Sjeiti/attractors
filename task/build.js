var childProcess = require('child_process');

runScript('./task/less.js')
	.then(runScript.bind(null,'./task/uglify.js'))
	.then(runScript.bind(null,'./task/copy.js'))
;

function runScript(scriptPath) {
	return new Promise(function(resolve,reject){
    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        reject(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        resolve(err);
    });

	});
}