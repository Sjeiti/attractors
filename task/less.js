/**
 * Build script to parse LESS files and vendor prefix the CSS results.
 * Arguments:
 *   --cwd = Current working directory
 *   --source = Source LESS
 *   --target = Target CSS
 * Example usage: node conf/node/shopLess --source=less/style.less --target=css/style.css --cwd=src/project-c/_assets/
 */
var less = require('less'),
    postcss = require('postcss'),
    autoprefixer = require('autoprefixer'),
    utils = require(__dirname+'/util/utils'),
    commander = require('commander')
        .usage('[options] <files ...>')
        .option('--source [source]', 'Source LESS')
        .option('--target [target]', 'Target CSS')
        .option('--cwd [cwd]', 'Current working directory')
        .parse(process.argv),
    read = utils.read,
    save = utils.save,
    warn = utils.warn,
    logElapsed = utils.logElapsed,
    //
    // build key-value pairs for source-target prepended with cwd
    sourceTargets = (function(sources,targets,cwd,sourceTargets){
      if (sources.length===targets.length) {
        sources.forEach((sourceUriComponent,i)=>{sourceTargets[cwd+sourceUriComponent] = cwd+targets[i];});
      } else {
        console.warn('The number of sources and targets are not equal.');
      }
      return sourceTargets;
    })(commander.source.split(','),commander.target.split(','),commander.cwd,{}),
    //
    // supported browser versions for autoPrefixer
    browsers = [
      'Android >= 4',
      'Chrome >= 40',
      'Firefox >= 40',
      'Explorer >= 11',
      'Edge >= 12',
      'iOS >= 7',
      'Opera >= 30',
      'Safari >= 8'
    ]
;

for (var source in sourceTargets) {
  var target = sourceTargets[source];
  read(source)
    .then(parseLess,warn)
    .then(prefix,warn)
    .then(save.bind(null,target),warn)
    .then(logElapsed,warn)
  ;
}

/**
 * Parse LESS to CSS
 * @param {string} data
 * @returns {Promise}
 */
function parseLess(data){
  return new Promise(function(resolve,reject){
    less.render(data,{
      compress:true,
      paths: ['./src/project-c/_assets/less'],
      plugins: [require('less-plugin-glob')]
    }, function (err, output) {
      if (err) reject(err);
      else resolve(output.css);
    });
  });
}

/**
 * AutoPrefix CSS
 * @param {string} data
 * @returns {Promise}
 */
function prefix(data) {
  return postcss([autoprefixer({browsers:browsers})]).process(data)
    .then(function (result) {
      result.warnings().forEach(warn);
      return result.css;
    });
}