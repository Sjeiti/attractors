iddqd.ns('attractors',(function(){
	var list = []
		,attractor = function(){}
		,event;

	function init(){
		event = attractors.event;
		attractors.three.init();
		attractors.ui();
		event.TYPE_CHANGED.add(onTypeChanged,null,1);
	}

	Object.defineProperty(init, 'attractor', {
		get: function () { return attractor;}
		//,set: function (fn) { attractor = fn;}
	});

	function create(name,constants,iterate,scale){
		var defaultConstants = constants.slice(0)
			,creation = iterate.bind(null,constants);
		scale = scale||200;
		Object.defineProperty(creation, 'name', { get: function(){return name;}});
		Object.defineProperty(creation, 'constants', { get: function(){return constants;}});
		Object.defineProperty(creation, 'scale', { get: function(){return scale;}});
		constants.reset = resetConstants;
		function resetConstants(){
			for (var i=0,l=constants.length;i<l;i++) constants[i] = defaultConstants[i];
		}
		list.push(creation);
		attractor = creation;
		console.log('attractor',typeof attractor); // todo: remove log
		return creation;
	}

	function onTypeChanged(index){
		attractor = list[index];
		event.REDRAW.dispatch();
	}

	return iddqd.extend(init,{
		create: create
		,get list() { return list; }
		//,get attractor() { return attractor; }
	});
})());