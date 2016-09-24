/**
 * Run the tasks specified by process.argv.
 * A task prefixed with + is read as an npm task, others are run as node tasks.
 */
var childProcess = require('child_process'),
    chalk = require('chalk'),
    tasks = (tasks=>tasks.length?tasks:['copy','less','uglify'])(process.argv.slice(2)),
    promise = Promise.resolve(),
    utils = require(__dirname+'/util/utils'),
	  warn = utils.warn,
	  logElapsed = utils.logElapsed;

tasks.forEach(task=>{
  promise = promise.then(runScript.bind(null,task[0]==='+'?'npm run '+task.substr(1):'./task/'+task));
});
promise.then(logElapsed,error=>{
  warn(error);
  process.exit(1);
});

function runScript(scriptPath) {
  console.log(chalk.bold.green.inverse(scriptPath));
	return new Promise(function(resolve,reject){
    var invoked = false,
        process = scriptPath.match(/\s/)&&childProcess.exec(scriptPath)||childProcess.fork(scriptPath),
        space = '    ';
    process.stdout.on('data',log=>!/^\s*>\s/.test(log)&&console.log(space+log.replace(/^\r\n|^\r|^\n|\r\n$|\r$|\n$/,'').replace(/\r\n|\r|\n/g,'\r\n'+space)));
    process.stderr.on('data',console.warn);
    process.on('error',err=>{
        if (invoked) return;
        invoked = true;
        reject(err);
    });
    process.on('exit',code=>{
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        err&&reject(err)||resolve(err);
    });
    //process.on('message',console.log);
	});
}