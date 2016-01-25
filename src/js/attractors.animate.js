iddqd.ns('attractors.animate',(function() {

	var three = attractors.three
		,event = attractors.event
		,frames = []
		,sines = []
		,offsets = []
		,w = 1
		,h = 1;

	requestAnimationFrame(animate);
	onTypeChanged();

	event.ANIMATION_START.add(onAnimationStart);
	event.ANIMATION_FRAME.add(onAnimationFrame);
	event.TYPE_CHANGED.add(onTypeChanged);

	function animate(time) {
			requestAnimationFrame(animate);
			TWEEN.update(time);
	}

	function onAnimationStart(width,height){
		frames.length = 0;
		w = width;
		h = height;
	}

	function onAnimationFrame(src){
		frames.push(src);
	}

	function onTypeChanged() {
		var attractor = attractors.attractor
			,constants = attractor.constants
			,numConstants = constants.length
			,i = numConstants;
		sines.length = offsets.length = numConstants;
		while (i--) {
			sines[i] = offsets[i] = 0;
		}
	}

	function setFrame(frame,frames,propstart,propend) {
		var part = frame/frames;
		for (var key in propstart) {
			var valStart = propstart[key]
				,valEnd = propend[key]
				,valCurrent = valStart + part*(valEnd-valStart);
			if (key==='cameraRotationX') {
				three.cameraRotationX = valCurrent;
			} else if (key==='constants') {
				var constants = attractors.attractor.constants;
				constants.forEach(function(n,i){
					var valStart = propstart.constants[i]
						,valEnd = propend.constants[i]
						,valCurrent = valStart + part*(valEnd-valStart);
					constants[i] = valCurrent;
				});
			}
		}
	}

	function getFromTo(frames,rotate) {
		var start = {}
			,end = {};
		if (rotate) {
			start.cameraRotationX = three.cameraRotationX;
			end.cameraRotationX = three.cameraRotationX+(360-360/(frames+1));
		}
		if (constantsFirst.length&&constantsLast.length) {
			start.constants = constantsFirst;
			end.constants = constantsLast;
		}
		return {start:start,end:end};
	}

	return {
		setFrame: setFrame
		,getFromTo: getFromTo
		,get frames() { return frames; }
		,get w() { return w; }
		,get h() { return h; }
		,get sines() { return sines; }
		,get offsets() { return offsets; }
	};
})());