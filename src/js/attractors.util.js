iddqd.ns('attractors.util',(function() {

  var mathrandom = Math.random;

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

  function random(f){
    return f*(mathrandom()-0.5);
  }

  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   * @param   {Number} h The hue
   * @param   {Number} s The saturation
   * @param   {Number} l The lightness
   * @return  {Array} The RGB representation
   */
  function hslToRgb(h,s,l) {
    var r,g,b;
    if (s===0) {
      r = g = b = l; // achromatic
    } else {
      var hue2rgb = function hue2rgb(p,q,t) {
        if (t<0) t += 1;
        if (t>1) t -= 1;
        if (t<1 / 6) return p + (q - p) * 6 * t;
        if (t<1 / 2) return q;
        if (t<2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var q = l<0.5?l * (1 + s):l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p,q,h + 1 / 3);
      g = hue2rgb(p,q,h);
      b = hue2rgb(p,q,h - 1 / 3);
    }
    return [Math.round(r * 255),Math.round(g * 255),Math.round(b * 255)];
  }

  function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    var byteCharacters = atob(b64Data)
      ,byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize)
        ,sliceNum = slice.length
        ,byteNumbers = new Array(sliceNum)
        ,i = sliceNum
        ,byteArray;
      while (i--) byteNumbers[i] = slice.charCodeAt(i);
      byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
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
    ,random: random
    ,hslToRgb: hslToRgb
    ,b64toBlob: b64toBlob
  };
})());