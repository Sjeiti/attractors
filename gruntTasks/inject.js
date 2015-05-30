/*global module,require*/
/**
 *
	bower: {
		id: 'bower'						// tag to search for
		,json: 'bower.json'				// json file
		,bowerrc: '.bowerrc'			// bowerrc file
		,dest: folderSrc+'/index.php'	// destination file
		,concat: 'temp/vendor.xx'
	},
	main: {
		id: 'app'						// tag to search for
		,files: aJavascript				// array of files
		,dest: folderSrc+'/index.php'	// destination file
	},
 * @param grunt
 */
module.exports = function(grunt) {
	'use strict';

	var fs = require('fs')
		,sNewline = '\n';//'\r\n'

	/**
	 * Processes bower to enqueue script
	 */
	grunt.registerMultiTask('inject', 'Processes HTML', function() {
		var oData = this.data
			,aFiles = oData.files
			,isDeferred = oData.defer
			,aCSS = []
		;
		// if bower create file list
		if (oData.json&&oData.bowerrc) {
			aFiles = [];
			var oBower = JSON.parse(fs.readFileSync(oData.json).toString())
				,oBowrc = JSON.parse(fs.readFileSync(oData.bowerrc).toString())
				,oOverrides = oBowrc.overrides||{}
				,sBaseUri = oBowrc.directory;
			for (var dep in oBower.dependencies) {
				var oDepBower = JSON.parse(fs.readFileSync(sBaseUri+'/'+dep+'/.bower.json').toString())
					,oMain = oOverrides.hasOwnProperty(dep)&&oOverrides[dep].hasOwnProperty('main')?oOverrides[dep].main:oDepBower.main
					,aMain = isString(oMain)?[oMain]:oMain
					,sSrcBase = sBaseUri+'/'+dep+'/'
				;
				if (!oMain) {
					console.warn(dep+' could not be added, add manually!'); // log
				} else {
					aMain.forEach(function(src){
						var sSrc = sSrcBase+(src[0]==='.'?src.substr(1):src)
							,sType = sSrc.split('.').pop()
						;
						if (sType==='js') aFiles.push(sSrc);
						else if (sType==='css') aCSS.push(sSrc);
					});
				}
			}
			// Write concatenated vendor files to temp folder to be minified. // todo: css
			if (oData.concat) {
				var sFileNameBase = oData.concat.replace(/\.\w+$/,'.')
					,oConcat = {js:[],css:[]}
				;
				aFiles.forEach(function(file){
					var sFileType = file.split('.').pop().toLowerCase();
					if (oConcat.hasOwnProperty(sFileType)){
						oConcat[sFileType].push(fs.readFileSync(file).toString());
						//console.log('concatenating',file.split('/').pop()); // log
					}
				});
				for (var type in oConcat) {
					var sContents = oConcat[type].join(type==='js'?'\n;\n':'\n')
						,sTarget = sFileNameBase+type;
					fs.writeFileSync(sTarget,sContents);
				}
			}
		}
		//
		//console.log(!!aFiles,oData.src,oData.dest,oData.id,oData.type,oData.prefix,oData.suffix,isDeferred);
		srcToHtml(aFiles,oData.src,oData.dest,oData.id,oData.type,oData.prefix,oData.suffix,isDeferred);
		if (aCSS.length) srcToHtml(aCSS,oData.src,oData.dest,oData.id+'css','css');
	});

	function srcToHtml(list,rootReplace,target,id,type,prefix,suffix,isDeferred){
		if (type===undefined) type = 'js';
		var commentType = target.split('.').pop()==='js'?'es':'xml'
			,sDst = fs.readFileSync(target).toString()
			,aScript = []
			,sSave
			,isTypeString = type==='string'
			,replacement;
		if (rootReplace===undefined) rootReplace = 'src/';
		list.forEach(function(file){
			var sSrc = file.replace(rootReplace,'');
			if (type==='js') aScript.push('<script src="/'+sSrc+'"></script>');
			else if (type==='css') aScript.push('<link rel="stylesheet" href="/'+sSrc+'" />');
			else if (isTypeString) aScript.push(fs.readFileSync(sSrc).toString());
		});
		replacement = aScript.join(isTypeString?'':sNewline);
		if (isTypeString) replacement = replacement.replace(/'/g,'\\\'');
		if (prefix) replacement = prefix+replacement;
		if (suffix) replacement = replacement+suffix;
		sSave = blockReplace(sDst,isDeferred?'':replacement,id,commentType);
		//console.log('sSave',sSave); // log
		fs.writeFileSync(target,sSave);
	}

	/**
	 * Replaces the block between comments marked by: '<!-- [id]:js -->' to '<!-- end[id] -->'
	 * @param source
	 * @param replace
	 * @param id
	 * @param {string} commentType 'es' for ecmascript or 'xml'
	 * @returns {string}
	 */
	function blockReplace(source,replace,id,commentType){
		var aSource = source.split(/\r\n|\n|\r/)
			,isEs = commentType==='es'
			,rxStart = new RegExp(isEs?'\/\\*\\s?'+id+':inject\\s?\\*\/':'<!--\\s?'+id+':inject\\s?-->')
			,rxEnd = new RegExp(isEs?'\/\\*\\s?end'+id+'\\s?\\*\/':'<!--\\s?end'+id+'\\s?-->')
			,rxTabs = new RegExp('([\\t ]*)<!--\\s?'+id+':inject\\s?-->')
            ,aTab = source.match(rxTabs)
            ,sTab = aTab?aTab[1]:''
			,bStarted = false
			,iStart = -1
			,aSourceNew = aSource.filter(function(line,i){
				var bReturn = true;
				if ((bStarted?rxEnd:rxStart).test(line)) {
					bStarted = !bStarted;
					if (bStarted) iStart = i;
				} else if (bStarted) {
					bReturn = false;
				}
				return bReturn;
			})
		;
		if (iStart!==-1) aSourceNew.splice(iStart+1,0,sTab+replace.replace(/\n/g,'\n'+sTab));
		return aSourceNew.join(sNewline);
	}

	function isString(s){
		return typeof s==='string';
	}
};