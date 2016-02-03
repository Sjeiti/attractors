iddqd.ns('attractors.util.addDragEvent',(function() {

	var movesAdded = []
		,vecMouse = {x:0,y:0}
		,isDragging = false
		;

	function addDragEvent(element,callback){
		element.addEventListener('touchstart',onTouchStart.bind(null,callback));
		document.addEventListener('touchend',onTouchEnd);
		element.addEventListener('mousedown',onMouseDown.bind(null,callback));
		document.addEventListener('mouseup',onMouseUp);
	}

	function onTouchStart(callback,e){
		addMove('touchmove',onTouchMove,callback);
		onTouchMove(callback,e);
	}

	function onTouchEnd(e){
		if (e.touches.length===0) {
			removeOldMoves();
			isDragging = false;
		}
	}

	function onTouchMove(callback,e){
		var touches = e.touches
			,touchesNum = touches.length;
		if (touchesNum===1) {
			drag(callback,e,touches[0]);
		}
	}

	function onMouseDown(callback,e){
		addMove('mousemove',onMouseMove,callback);
		onMouseMove(callback,e);
	}

	function onMouseUp(){
		removeOldMoves();
		isDragging = false;
	}

	function onMouseMove(callback,e){
		drag(callback,e);
	}

	function drag(callback,e,touch){
		var pos = touch||e
			,x = pos.pageX
			,y = pos.pageY
			,offsetX = x - vecMouse.x
			,offsetY = y - vecMouse.y;
		vecMouse.x = x;
		vecMouse.y = y;
		if (isDragging===false) {
			isDragging = true;
		} else {
			callback(e,offsetX,offsetY);
		}
	}

	function addMove(type,listener,callback){
		var move = listener.bind(null,callback);
		removeOldMoves();
		movesAdded.push(move);
		document.addEventListener(type,move);
	}

	function removeOldMoves(){
		movesAdded.forEach(function(move){
			document.removeEventListener('touchmove',move);
			document.removeEventListener('mousemove',move);
		});
		movesAdded.length = 0;
	}

	return addDragEvent;
})());