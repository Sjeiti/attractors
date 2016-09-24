iddqd.ns('attractors.util.addDragEvent',(function() {

  var movesAdded = []
    ,pointerVector = {x:0,y:0}
    ,pointerSize = null
    ,pointerNum = 1
    ,isDragging = false
  ;

  function addDragEvent(element,callback){
    element.addEventListener('touchstart',onTouchStart.bind(null,callback));
    document.addEventListener('touchend',onTouchEnd);
    element.addEventListener('mousedown',onMouseDown.bind(null,callback));
    document.addEventListener('mouseup',onMouseUp);
  }

  function onTouchStart(callback,e){
    addMove('touchmove',onMove,callback);
    onMove(callback,e);
  }

  function onTouchEnd(e){
    if (e.touches.length===0) {
      removeOldMoves();
      isDragging = false;
    }
  }

  function onMouseDown(callback,e){
    addMove('mousemove',onMove,callback);
    onMove(callback,e);
  }

  function onMouseUp(){
    removeOldMoves();
    isDragging = false;
  }

  /**
   * @param {Function} callback
   * @param {MouseEvent|TouchEvent} e
   * @todo add difference when switching from one to two e.touchess
   */
  function onMove(callback,e){
    var isTouch = isTouchEvent(e)
      ,touches = isTouch&&e.touches
      ,touchesNum = isTouch&&touches.length
      ,isMultiTouch = isTouch&&touchesNum>1
      ,pos = isTouch?(isMultiTouch?touchesDeltaPosition(e):touches[0]):e
      ,x = pos.pageX
      ,y = pos.pageY
      ,size = isTouch&&isMultiTouch?touchesLength(e):null
      ,offsetX = x - pointerVector.x
      ,offsetY = y - pointerVector.y
      ,offsetSize = size!==null&&pointerSize!==null?size - pointerSize:0;
    if (pointerNum>0&&touchesNum>0&&pointerNum!==touchesNum) {
      offsetX = 0;
      offsetY = 0;
    }
    pointerVector.x = x;
    pointerVector.y = y;
    pointerSize = size;
    pointerNum = isMultiTouch?touchesNum:1;
    if (isDragging===false) {
      isDragging = true;
    } else {
      callback(e,offsetX,offsetY,offsetSize);
    }
  }

  function touchesDeltaPosition(e){
    var sum = touchesSum(e)
      ,numTouches = e.touches.length;
    return {pageX:sum[0]/numTouches,pageY:sum[1]/numTouches};
  }

  function touchesLength(e){
    var sum = touchesSubtract(e);
    return Math.sqrt(sum[0]*sum[0] + sum[1]*sum[1]);
  }

  /**
   * @param {TouchEvent} e
   * @returns {number[]}
   */
  function touchesSum(e){
    var sum;
    if (e.sum) {
      sum = e.sum;
    } else {
      sum = e.sum = [0,0];
      var touches = e.touches
        ,numTouches = touches.length
        ,i = numTouches;
      while (i--) {
        var touch = touches[i];
        sum[0] += touch.pageX;
        sum[1] += touch.pageY;
      }
    }
    return sum;
  }

  /**
   * @param {TouchEvent} e
   * @returns {number[]}
   */
  function touchesSubtract(e){
    var subtract;
    if (e.subtract) {
      subtract = e.subtract;
    } else {
      var touches = e.touches
        ,touch0 = touches[0]
        ,touch1 = touches[1];
      subtract = e.subtract = [
        touch0.pageX - touch1.pageX
        ,touch0.pageY - touch1.pageY
      ];
    }
    return subtract;
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

  function isTouchEvent(e){
    return window.TouchEvent&&e.constructor===TouchEvent;
  }

  return addDragEvent;
})());