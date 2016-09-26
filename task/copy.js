/**
 * Copy all the things!
 * Arguments:
 *   --source = Source path
 *   --target = Target path
 *   remaining arguments are globbing patters for files to copy
 * Example usage: node task/copy --source=src/ --target=dist/ *.* img/* fonts/* style/*.css
 */
var utils = require(__dirname+'/util/utils')
    ,glomise = utils.glomise
    ,logElapsed = utils.logElapsed
    ,copy = utils.copy
    ,warn = utils.warn
    ,commander = require('commander')
        .usage('[options] <globs ...>')
        .option('--source [source]', 'Source path')
        .option('--target [target]', 'Target path')
        .parse(process.argv)
    ,baseProject = commander.source
    ,targetProject = commander.target
    ,globs = commander.args
;
Promise.all(globs.map(
    path=>glomise(baseProject+path)
        .then(files=>Promise.all(files.map(file=>copy(file,file.replace(baseProject,targetProject)))),warn)
        //.then(log,warn)
    ))
  .then(logElapsed,warn);