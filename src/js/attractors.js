iddqd.ns('attractors',(function(){
	var list = []
		,attractor
		,event;

	function init(){
		event = attractors.event;
		attractors.three.init();
		attractors.ui();
		attractors.location();
		event.TYPE_CHANGED.add(onTypeChanged,null,1);
	}

	Object.defineProperty(init, 'attractor', {
		get: function () { return attractor;}
		//,set: function (fn) { attractor = fn;}
	});

	function create(name,constants,iterate,scale){
		var defaultConstants = constants.slice(0)
			,maxConstant = (function(max){
				defaultConstants.forEach(function(i){
					var abs = Math.abs(i);
					if (abs>max) max = abs;
				});
				return max;
			})(0)
			,creation = iterate.bind(null,constants);
		scale = scale||200;
		Object.defineProperty(creation, 'name', { get: function(){return name;}});
		Object.defineProperty(creation, 'constants', { get: function(){return constants;}});
		Object.defineProperty(creation, 'scale', { get: function(){return scale;}});
		Object.defineProperty(creation, 'constantSize', { get: function(){return maxConstant;}});
		constants.reset = resetConstants;
		function resetConstants(){
			for (var i=0,l=constants.length;i<l;i++) constants[i] = defaultConstants[i];
		}
		list.push(creation);
		if (attractor===undefined) attractor = creation;
		return creation;
	}

	function onTypeChanged(index){
		attractor = list[index];
	}

	return iddqd.extend(init,{
		create: create
		,get list() { return list; }
		//,get attractor() { return attractor; }
	});
})());