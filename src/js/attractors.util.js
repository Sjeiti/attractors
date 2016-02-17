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

	function dispatchEvent(element,type) {
		if ('createEvent' in document) {
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent(type,false,true);
			element.dispatchEvent(evt);
		} else {
			element.fireEvent('on'+type);
		}
	}

	function getMax(a) {
		var max = -Infinity
			,len = a.length
			,value;
		if (len<1) max = Math.max.apply(Math,a);//1E5
		else while (len--) (value=a[len])>max&&(max = value);
		return max;
	}

	function getMin(a) {
		var min = Infinity
			,len = a.length
			,value;
		if (len<1) min = Math.min.apply(Math,a);//1E5
		else while (len--) (value=a[len])<min&&(min = value);
		return min;
	}

	function promiseAnimationFrame(){
		return new Promise(function(resolve,reject){
			requestAnimationFrame(resolve);
		});
	}

	return {
		wait: wait
		,array2array: array2array
		,emptyPromise: emptyPromise
		,applyDragMove: applyDragMove
		,dispatchEvent: dispatchEvent
		,getMax: getMax
		,getMin: getMin
		,promiseAnimationFrame: promiseAnimationFrame
	};
})());