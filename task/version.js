/*
 * grunt-version-git
 * https://github.com/Sjeiti/grunt-version-git
 *
 * Copyright (c) 2015 Ron Valstar
 * Licensed under the MIT license.
 */

//console.log('process.argv',process.argv); // todo: remove log
//console.log('process.argv.slice(2)',process.argv.slice(2)); // todo: remove log

// npm install cli --save-dev

/*
	One reason for continuing to use the single letter options is because they can be strung together: ls -ltr is a lot easier to type than ls --sort=time --reverse --format=long. There are a number of times when both are good to use. As for searching for this topic, try "unix command line options convention".
*/

var parameters = {};
process.argv.forEach(function(s){
	if (s.match(/^[\-a-zA-Z0-9=]+$/)) {
		var split = s.split('=');
		parameters[split.shift()] = split.pop()||true;
	}
});
function params(s){
	return parameters.indexOf(s)?parameters[s]:false;
}
console.log('parameters',parameters); // todo: remove log
//return;

var done = function(){}//this.async()
	,fs = require('fs')
	,exec = require('child_process').exec
	//
	//,data = this.data
	,files = ['./package.json','./src/attractors.appcache']//data.src
	//
	,versionObject = {major:0,minor:1,patch:2}
	// set default options // todo extend
	,options = {
		major: false
		,minor: false
		,patch: false
		,version: false
		,build: 'num'//||hash
		,git: false
		,regex: /\d+\.\d+\.\d+-?[0-9A-Za-z-.]*\+?[0-9A-Za-z-.]*/
	}
	,filesNum = files.length
	,isBump
	//
	,params = function(){}//
	,paramMajor = params('major')||params('MAJOR')
	,paramMinor = params('minor')||params('MINOR')
	,paramPatch = params('patch')||params('PATCH')
	,paramVersion = params('vr')||params('VR')
	,paramRelease = params('rel')||params('release')
	,paramGit = params('git')||params('GIT')
	//
	,isParamMajor = paramMajor!==undefined
	,isParamMinor = paramMinor!==undefined
	,isParamPatch = paramPatch!==undefined
	,isParamVersion = paramVersion!==undefined
	,isParamRelease = paramRelease!==undefined
	,isParamGit = paramGit!==undefined
;
//
// params
if (isParamVersion||options.version) {
				var paramVersionList = (options.version||paramVersion).split('.');
	options.major = paramVersionList[0];
	options.minor = paramVersionList[1];
	options.patch = paramVersionList[2];
		} else if (isParamMajor||isParamMinor||isParamPatch) {
	options.major = isParamMajor?paramMajor:false;
	options.minor = isParamMinor?paramMinor:false;
	options.patch = isParamPatch?paramPatch:false;
} else {
	// reset others if major or minor bumps
	if (options.major===true) {
		options.minor = false;
		options.patch = false;
	} else if (options.minor===true) {
		options.patch = false;
	}
	//
	// reset others if major or minor sets
	if (!isBool(options.major)) {
		if (options.minor===true) options.minor = false;
		if (options.patch===true) options.patch = false;
	} else if (!isBool(options.minor)) {
		if (options.patch===true) options.patch = false;
	}
}
if (isParamGit&&paramGit) options.git = true;
//
// if all options are false simply bump patch
if (options.major===false&&options.minor===false&&options.patch===false) {
	options.patch = true;
}
//
// set bump string
isBump = options.major===true&&'major'||options.minor===true&&'minor'||options.patch===true&&'patch';
//
// check if GIT is installed for project
if (options.git) {
	exec('git rev-list HEAD --count', function(error,stdout){//,stderr
		var match = stdout.match(/\d+/)
			,hasGit = !!match;
		if (hasGit) {
			iterateFiles(match.pop());
		} else {
			console.warn('GIT not found'); // log
			done(false);
		}
	});
} else {
	iterateFiles();
}
// Iterate over all specified file groups.
function iterateFiles(gitRevision){
				var highestVersion = '0.0.0'
						,highestVersionNumeral = 0
						,processedFiles = [];
	files.forEach(function(src) {
		var source = fs.readFileSync(src).toString()
			,version
			,versionNewList
			,versionNew
			,isRegexArray = Array.isArray(options.regex)
								,versionNumber
		;
		if (isRegexArray) {
			var versionMax = 0;
			options.regex.forEach(function(regex){
				var check = getSourceVersion(source,regex)
					,checkNumber = versionToInt(check);
				if (checkNumber>versionMax) {
					versionMax = checkNumber;
					version = check;
				}
			});
		} else {
			version = getSourceVersion(source,options.regex);
		}
		versionNewList = getVersionArray(version);
		//
		// bump version
		if (isBump) {
			var start = versionObject[isBump]
				,len = 3-start
			;
			for (var j=0;j<len;j++) {
				var pos = 3-len+j;
				if (j===0) {
					versionNewList[pos]++;
				} else {
					versionNewList[pos] = 0;
				}
			}
		} else { // set version
			if (!isBool(options.major)) versionNewList[0] = options.major;
			if (!isBool(options.minor)) versionNewList[1] = options.minor;
			if (!isBool(options.patch)) versionNewList[2] = options.patch;
		}
						versionNew = versionNewList.join('.');
						versionNumber = versionToInt(versionNew);
						if (versionNumber>highestVersionNumeral) {
								highestVersionNumeral = versionNumber;
								highestVersion = versionNew;
						}
						processedFiles.push({
								version: version
								,source: source
								,src: src
						});
				});
	processedFiles.forEach(function(o,i) {
		var isLastFile = i===filesNum-1
								,src = o.src
			,source = o.source
			,version = o.version
			,versionNew = highestVersion
			,isRegexArray = Array.isArray(options.regex)
		;
		// add release
		if (isParamRelease) {
			versionNew = versionNew+'-'+paramRelease;
		}
		// add build
		if (options.git) {
			versionNew = versionNew+'+'+gitRevision;
		}
		// save file
		if (versionNew!==version) {
			if (isRegexArray) {
				options.regex.forEach(function(regex){
					source = replaceSource(source,regex,versionNew);
				});
			} else {
				source = replaceSource(source,options.regex,versionNew);
			}
			fs.writeFileSync(src,source);
			console.log('File \''+src+'\' updated from',version,'to',versionNew);
			isLastFile&&done(true);
		} else {
			console.log('File \''+src+'\' is up to date',version);
			isLastFile&&done(true);
		}
	});
}

function replaceSource(source,regex,version){
	var match = source.match(regex);
	if (match) {
		var matchNum = match.length
			,replace = match.pop();
		if (matchNum===2) {
			var sFull = match.pop();
			source = source.replace(sFull,sFull.replace(replace,version));
		} else {
			source = source.replace(regex,version);
		}
	}
	return source;
}

function getSourceVersion(source,regex){
	var match = source.match(regex);
	return match?match.slice(0).pop():'0.0.0';
}

function getVersionArray(version){
	return version.split(/[-+]/g).shift().split('.').map(function(s){ return parseInt(s,10); });
}

function versionToInt(version){
	var max = 1E6
		,number = 0;
	getVersionArray(version).forEach(function (n,i) {
		number += n * Math.pow(max,3 - i);
	});
	return number;
}

function isBool(o){
	return o===true||o===false;
}