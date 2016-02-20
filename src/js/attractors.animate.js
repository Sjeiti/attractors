iddqd.ns('attractors.animate',(function() {

	var three = attractors.three
		,event = attractors.event
		,util = attractors.util
		,array2array = util.array2array
		,frames = []
		,sines = []
		,offsets = []
		//
		,constantsFirst = []
		,constantsLast = []
		,cameraFirst = {
			cameraCenter: three.cameraCenter.clone()
			,update: updateCamera
		}
		,cameraLast = {
			cameraCenter: three.cameraCenter.clone()
			,update: updateCamera
		}
		//
		,w = 1
		,h = 1;

	function init() {
		onTypeChanged();
		event.ANIMATION_START.add(onAnimationStart);
		event.ANIMATION_FRAME.add(onAnimationFrame);
		event.TYPE_CHANGED.add(onTypeChanged);
		cameraFirst.update();
		cameraLast.update();
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
			sines[i] = 0;
			offsets[i] = i*(2/numConstants);
		}
	}

	var propCameraRotation = 'cameraRotationX';

	function setFrame(frame,frames,propstart,propend) {
		var part = frame/frames
			,hasCamera = propstart.hasOwnProperty('camera')
			,hasCameraRotation = propstart.hasOwnProperty(propCameraRotation)
			,hasConstants = propstart.hasOwnProperty('constants')
			,hasSines = propstart.hasOwnProperty('sines')
			,constants = attractors.attractor.constants;
		if (hasCameraRotation) {
			//todo:rewrite 360
			three.cameraRotationX = propPart(propstart[propCameraRotation],propend[propCameraRotation],part);
		}
		if (hasCamera) {
			var camStart = propstart.camera
				,camEnd = propend.camera;
			three.cameraRotationX = propPart(camStart.cameraRotationX,camEnd.cameraRotationX,part);
			three.cameraRotationY = propPart(camStart.cameraRotationY,camEnd.cameraRotationY,part);
			three.cameraDistance = propPart(camStart.cameraDistance,camEnd.cameraDistance,part);
			three.cameraCenter.x = propPart(camStart.cameraCenter.x,camEnd.cameraCenter.x,part);
			three.cameraCenter.y = propPart(camStart.cameraCenter.y,camEnd.cameraCenter.y,part);
			three.cameraCenter.z = propPart(camStart.cameraCenter.z,camEnd.cameraCenter.z,part);
		}
		if (hasConstants&&!hasSines) {
			constants.forEach(function(n,i){
				constants[i] = propPart(propstart.constants[i],propend.constants[i],part);
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

	function getFromTo(frames,rotate,loop) {
		var start = {}
			,end = {};
		if (rotate) {
			start.cameraRotationX = three.cameraRotationX;
			end.cameraRotationX = three.cameraRotationX+(360-360/(frames+1));
		} else {
			start.camera = cameraFirst;
			end.camera = cameraLast;
		}
		if (loop) {
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

	function propPart(start,end,part){
		return start + part*(end-start);
	}

	function updateCamera(){
		this.cameraCenter.x = three.cameraCenter.x;
		this.cameraCenter.y = three.cameraCenter.y;
		this.cameraCenter.z = three.cameraCenter.z;
		this.cameraRotationX = three.cameraRotationX;
		this.cameraRotationY = three.cameraRotationY;
		this.cameraRotationY = three.cameraRotationY;
		this.cameraDistance = three.cameraDistance;
	}

	return iddqd.extend(init,{
		setFrame: setFrame
		,getFromTo: getFromTo
		,get frames() { return frames; }
		,get w() { return w; }
		,get h() { return h; }
		,get sines() { return sines; }
		,get offsets() { return offsets; }
		,get constantsFirst() { return constantsFirst; }
		,get constantsLast() { return constantsLast; }
		,get cameraFirst() { return cameraFirst; }
		,get cameraLast() { return cameraLast; }
	});
})());