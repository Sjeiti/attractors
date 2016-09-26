/**
 * Build script to minify/uglify source HTML and Javascript.
 * HTML is loaded and parsed to check for <!-- build[:command] targetFile -->...<!-- /build --> comments.
 * Files between the comments are concatenated and saved to the targetFile.
 * The concatenated source is processed by the commands that are set (minify, annotate, inject).
 * Arguments:
 *   --source = Source path
 *   --target = Target path
 *   --html = HTML file to process and minify
 *   --injectGlob = globbing pattern for HTML templates to inject
 * Example usage: node task/minify --source=src --target=dist --html=src/index.html"
 * todo: add jshint
 * todo: add jscs
 */
var uglify = require('uglify-js'),
    htmlMinify = require('html-minifier').minify,
    htmlparser = require('htmlparser2'),
    ngAnnotate,
    commander = require('commander')
        .usage('[options] <files ...>')
        .option('--source [source]', 'Source path')
        .option('--target [target]', 'Target path')
        .option('--html [html]', 'HTML file')
        .option('--injectGlob [injectGlob]', 'Globbing patterns for template injection')
        .option('--bustCache [bustCache]', 'Bust cache by suffixing a random number')
        .parse(process.argv),
    utils = require(__dirname+'/util/utils'),
    glomise = utils.glomise,
    read = utils.read,
    save = utils.save,
    extend = utils.extend,
    formatBytes = utils.formatBytes,
    //log = utils.log,
    warn = utils.warn,
    pass = o=>o,
    blockReplace = utils.blockReplace,
    logElapsed = utils.logElapsed,
    inlinePrefix = '/*inline23*/\n',
    inlinePrefixRegex = /^\/\*inline23\*\/\n/,
    /*warnxit = msg=>{
      console.warn(msg);
      process.exit(1);
    },*/
    uglifyOptions = {
      fromString: true,
      pure_getters: true
    },
    ngAnnotateOptions = {
      add: true,
      remove: false,
      singleQuotes: true,
      sourcemap: false // false||true||string
    },
    htmlMinifyOptions = {
      html5: true,
      removeComments: true,
      collapseBooleanAttributes: false,
      collapseWhitespace: true,
      collapseInlineTagWhitespace: false/*,
      minifyCSS:false,
      minifyJS:false*/
    },
    sourcePath = commander.source||'src/',
    targetPath = commander.target||'dist/',
    htmlPath = commander.html||'index.html',
    isBustCache = commander.bustCache||false,
    sourceHTML = sourcePath+htmlPath,
    targetHTML = targetPath+htmlPath,
    injectGlob = commander.injectGlob
;

console.log('Minifying',sourcePath+htmlPath,'to',targetPath);

read(sourceHTML)
    .then(htmlSource=>{
      var buildComments = parseBuildComments(htmlSource);
      Promise.all(buildComments.map(buildComment=>
        // annotate and minify
        Promise.all(buildComment.scripts.map(file=>{
          return inlinePrefixRegex.test(file)?file:read(sourcePath+file);
        }))
            .then(sources=>sources.join('\n;//////////////////////////////////////////////////////////\n'))
            .then(source=>{
              var resolved = Promise.resolve(source);
              buildComment.processes.forEach(process=>{
                if (process==='annotate') resolved = resolved.then(source=>ngAnnotate(source,ngAnnotateOptions).src,warn);
                else if (process==='inject') resolved = resolved.then(inject,warn);
                else if (process==='minify') resolved = resolved.then(source=>uglify.minify(source,uglifyOptions).code,warn);
              });
              return resolved;
            })
            .then(source=>save(targetPath+buildComment.target,source))
            .then(pass,warn)
        ).concat((()=>{
          // replace html blocks
          var matchStart = /build((:\w+)+)\s+([^\s]*)/,
              matchEnd = /<!--\s?\/build\s?-->/,
              replacedSource = blockReplace(
                  htmlSource,
                  matchStart,
                  matchEnd,
                  line=>'<script src="'+line.match(matchStart).pop()+(isBustCache?'?nocache='+Math.random():'')+'"></script>'
              ),
              newSource = htmlMinify(replacedSource,extend({
                maxLineLength:500
              },htmlMinifyOptions));
          return save(targetHTML,newSource).then(pass,warn);
        })())
      ).then(logElapsed,warn);
    },warn)
;

/**
 * Parses a HTML source to find build comments.
 * @param {String} htmlSource
 * @returns {Object[]}
 * @example
 *   <!-- build:minify:annotate /project-c/vendors.js -->...<!-- /build -->
 *   Returns {
 *    comment: '<!-- build:minify /project-c/vendors.js -->',
 *    target: '/project-c/vendors.js',
 *    processes: ['minify','annotate'],
 *    scripts: --an array with all script@src's found between the comments--
 *   }
 */
function parseBuildComments(htmlSource){
  var buildComments = []
      ,startBuild = /build((:\w+)+)\s+([^\s]*)/
      ,endBuild = /\/build/
      ,current
      ,hasContent = false
      ,parser = new htmlparser.Parser({
        oncomment: comment=>{
          var isEndBuild = endBuild.test(comment)
              ,isStartBuild = startBuild.test(comment)
              ,matchTarget = comment.match(startBuild)
              ,target = matchTarget&&matchTarget.pop()
              ,processes = matchTarget&&matchTarget[1].substr(1).split(':');
          //
          if (processes&&processes.indexOf('annotate')!==-1) ngAnnotate = require('ng-annotate');
          //
          if (isEndBuild) {
            if (current) {
              buildComments.push(current);
              current = null;
            }
          } else if (isStartBuild) {
            current = {
              comment: comment,
              target: target,
              processes: processes,
              scripts: []
            };
          }
        }
        ,onopentag: (name,attribs)=>{
          var isScript = name==='script'
              ,src = attribs.src;
          if (isScript&&!src) hasContent = true;
          current&&current.scripts&&isScript&&src&&current.scripts.push(src);
        }
        ,onclosetag: name=>{
          if (name==='script') hasContent = false;
        }
        ,ontext: text=>{
          current&&current.scripts&&hasContent&&text&&current.scripts.push(inlinePrefix+text);
        }
      }, {decodeEntities: true});
  parser.write(htmlSource);
  parser.end();
  //
  return buildComments;
}

/**
 * Injects directive and partial html into the run script (to prevent server calls)
 * @param {String} source
 */
function inject(source){
  var rxBasePath = new RegExp(sourcePath.replace(/([\.\/])/g,'\\$1'));
  return glomise(injectGlob)
    .then(paths=>Promise.all(paths.map(read)).then(results=>results.map(contents=>htmlMinify(contents,htmlMinifyOptions)).map((contents,i)=>'<script type="text/ng-template" id="'+paths[i].replace(rxBasePath,'')+'">'+contents+'</script>').join(''),warn),warn)
    .then(partials=>{
      console.log('injecting',formatBytes(partials.length),'of html');
      return blockReplace(
          source,
          /\/\*inject\*\//,
          /\/\*\/inject\*\//,
          '\''+partials.replace(/'/g,'\\\'').replace(/\r\n|\r|\n/g,'')+'\''
      );
    },warn);
}