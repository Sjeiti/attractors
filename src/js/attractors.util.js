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
	}

	return {
		wait: wait
		,array2array: array2array
	};
})());