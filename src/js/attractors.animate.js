iddqd.ns('attractors.animate',(function() {

	var three = attractors.three
		,event = attractors.event
		,util = attractors.util
		,array2array = util.array2array
		,frames = []
		,sines = []
		,offsets = []
		,constantsFirst = []
		,constantsLast = []
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

	var propCameraRotation = 'cameraRotationX';

	function setFrame(frame,frames,propstart,propend) {
		var part = frame/frames
			,hasCameraRotation = propstart.hasOwnProperty(propCameraRotation)
			,hasConstants = propstart.hasOwnProperty('constants')
			,hasSines = propstart.hasOwnProperty('sines')
			,constants = attractors.attractor.constants;
		if (hasCameraRotation) {
			var rotationStart = propstart[propCameraRotation]
				,rotationEnd = propend[propCameraRotation];
			three.cameraRotationX = rotationStart + part*(rotationEnd-rotationStart);
		}
		if (hasConstants&&!hasSines) {
			constants.forEach(function(n,i){
				var valStart = propstart.constants[i]
					,valEnd = propend.constants[i];
				constants[i] = valStart + part*(valEnd-valStart);
			});
		} else if (hasSines) {
			constants.forEach(function(n,i){
				var valStart = propstart.constants[i]
					,valSine = propstart.sines[i]
					,offsetPi = propstart.offsets[i]*Math.PI
					,valOffset = valSine*Math.sin(offsetPi);
				if (valSine!==0) constants[i] = valStart - valOffset + valSine*Math.sin(2*part*Math.PI+offsetPi);
			});
		}
	}

	function getFromTo(frames,rotate) {
		var start = {}
			,end = {}
			,hasSines = (function(b,i){
				while (i--) if (!b&&sines[i]!==0) b = true;
				return b;
			})(false,sines.length);
		if (rotate) {
			start.cameraRotationX = three.cameraRotationX;
			end.cameraRotationX = three.cameraRotationX+(360-360/(frames+1));
		}
		if (hasSines) {
			start.sines = sines;
			start.offsets = offsets;
			if (constantsFirst.length===0) array2array(attractors.attractor.constants,constantsFirst);
			start.constants = constantsFirst;
		} else if (constantsFirst.length&&constantsLast.length) {
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
		,get constantsFirst() { return constantsFirst; }
		,get constantsLast() { return constantsLast; }
	};
})());