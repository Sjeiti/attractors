iddqd.ns('attractors.util.addDragEvent',(function() {

	var dragCallback
		,vecMouse = new THREE.Vector3(0,0,0)
		;

	function addDragEvent(element,callback){
		dragCallback = callback;
		element.addEventListener('mousedown',onMouseDown);
		document.addEventListener('mouseup',onMouseUp);
		element.addEventListener('touchstart',onTouchStart);
		document.addEventListener('touchend',onTouchEnd);
	}

	function onTouchStart(e){
		document.removeEventListener('touchmove',onTouchMove);
		document.addEventListener('touchmove',onTouchMove);
		onTouchMove(e);
	}

	function onTouchEnd(e){
		if (e.touches.length===0) {
			document.removeEventListener('touchmove',onTouchMove);
			vecMouse.z = 0;
		}
	}

	function onTouchMove(e){
		var touches = e.touches
			,touchesNum = touches.length;
		if (touchesNum===1) {
			drag(touches[0]);
		}
	}

	function onMouseDown(e){
		document.removeEventListener('mousemove',onMouseMove);
		document.addEventListener('mousemove',onMouseMove);
		onMouseMove(e);
	}

	function onMouseUp(){
		document.removeEventListener('mousemove',onMouseMove);
		vecMouse.z = 0;
	}

	function onMouseMove(e){
		drag(e);
	}

	function drag(touchOrE){
		var x = touchOrE.pageX
			,y = touchOrE.pageY
			,offsetX = x - vecMouse.x
			,offsetY = y - vecMouse.y;
		vecMouse.x = x;
		vecMouse.y = y;
		if (vecMouse.z===0) {
			vecMouse.z = 1;
		} else {
			dragCallback(touchOrE,offsetX,offsetY);
		}
	}

	return addDragEvent;
})());