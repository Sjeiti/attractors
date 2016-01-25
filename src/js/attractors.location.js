iddqd.ns('attractors.location',(function(){

	var event = attractors.event
		,util = attractors.util
		,array2array = util.array2array
		//
		,CONSTANTS_CHANGED = event.CONSTANTS_CHANGED
		,dispatchConstantsChanged = CONSTANTS_CHANGED.dispatch
		//
		,attractor;

	function init(){
		attractor = attractors.attractor;
		CONSTANTS_CHANGED.add(onConstantsChanged);
		window.addEventListener('hashchange', onHashChange, false);
	}

	function onConstantsChanged(){
		location.hash = buildHash();
	}

	function onHashChange(){
		var decode = decodeURIComponent(location.hash.substr(1))
			,data = decode.split(/,/g)
			,name = data.shift()
			,constants = data.map(function(s){return parseFloat(s);})
			,isName = attractor.name===name
			,isConstants = (function(b){
				constants.forEach(function(val,i){
					if (val!==attractor.constants[i]) b = false;
				});
				return b;
			})(true)
		;
		///////////////////////////
		/*var chars = 'abcdefghijklmnopqrstuvwxyz 01234567890-,.'.split('')
			,decodeList = decode.toLowerCase().split('')
			,intResult = (function(a){
				decodeList.forEach(function(char){
					a.push(chars.indexOf(char));
				});
				return a;
			})([])
			,pad = '000000'
			,bin = intResult.map(function(i){
				var bin = i.toString(2);
				return pad.substring(0, pad.length - bin.length) + bin;
			}).join('')
			,pad2 = '00'
			,oct = intResult.map(function(i){
				var bin = i.toString(8);
				return pad2.substring(0, pad2.length - bin.length) + bin;
			}).join('')
			;*/

		/*console.log('intResult'
			,intResult
			,bin.match(/.{1,24}/g).join('\n')
			,oct.match(/.{1,12}/g).join('\n')
		);*/

		///////////////////////////
		//
		if (!isName) {
			var index = -1;
			attractors.list.forEach(function(attr,i){
				if (name===attr.name) index = i;
			});
		  index>=0&&event.TYPE_CHANGED.dispatch(index);
		}
		if (!isConstants) {
			dispatchConstantsChanged(array2array(constants,attractor.constants));
		}
	}

	function buildHash(){
		return encodeURIComponent(attractor.name+','+attractor.constants.join(','));
	}

	return init;
})());