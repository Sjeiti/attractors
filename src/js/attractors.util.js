iddqd.ns('attractors.util',(function() {

	function wait(){
		return new Promise(function(resolve){
			requestAnimationFrame(resolve);
			//setTimeout(resolve,40);
		});
	}

	function array2array(a,b){
		b.length = 0;
		a.forEach(function(n,i){
			b[i] = n;
		});
		return b;
	}

	function emptyPromise(){
		var arg = arguments;
		return new Promise(function(resolve){resolve.apply(arg);});
	}

	function applyDragMove(element,onMove,init){
		element.addEventListener('mousedown',function(){
			element.addEventListener('mousemove',onMove);
		});
		document.addEventListener('mouseup',function(){
			element.removeEventListener('mousemove',onMove);
		});
		element.addEventListener('change',onMove);
		init&&onMove();
	}

	return {
		wait: wait
		,array2array: array2array
		,emptyPromise: emptyPromise
		,applyDragMove: applyDragMove
	};
})());