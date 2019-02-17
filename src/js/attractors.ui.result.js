iddqd.ns('attractors.ui.result',(function(){
  var pad = iddqd.internal.native.string.pad
      ,classname = attractors.classname
      ,event = attractors.event
      ,util = attractors.util
      ,dispatchEvent = util.dispatchEvent
      ,b64toBlob = util.b64toBlob
      ,addDragEvent = util.addDragEvent
      ,getElementById = document.getElementById.bind(document)
      ,elmResult = getElementById('tabs-result').nextElementSibling
      ,elmImageWrapper = getElementById('image')
      ,elmImage = elmImageWrapper.querySelector('img')
      ,elmVideo = document.createElement('video')
      //
      ,percentStartX = 50
      ,percentStartY = 50
      ,elmImageStyle = elmImage.style
      ,imageScale
      ,removeDragEvent
      ,isNextClickInvalid = false
  ;

  function init(){
    // var matchScale = iddqd.style.select('#image.zoom img').pop().style.transform.match(/scale\(\s?([^,]+)/);
    // imageScale = parseFloat(matchScale&&matchScale.pop()||1);
    imageScale = 1;
    //
    elmResult.querySelector('.btn.img').addEventListener('click',onDownloadImgClick);
    elmResult.querySelector('.btn.sequence').addEventListener('click',onDownloadSequenceClick);
    //elmResult.querySelector('.btn.video').addEventListener('click',onDownloadClick);
    //
    elmImageWrapper.addEventListener('click',onResultImageClick);
    //
    event.IMAGE_DRAWN.add(onImageDrawn);
    event.RENDER_START.add(onRenderStart);
    event.RENDER_DONE.add(onRenderDone);
    event.ANIMATION_DRAWN.add(onAnimationDrawn);
    event.ANIMATION_DRAWN_WEBM.add(onAnimationDrawnWebm);
  }

  function onImageDrawn(canvas){
    var resultWrapper = getElementById('tabs-result');
    resultWrapper.classList.remove(classname.hide);
    elmImage.setAttribute('src',canvas.toDataURL('image/png'));
  }

  function onRenderStart(){//isAnimation
    Array.prototype.forEach.call(elmResult.querySelector('.btn'),function(elm){
      elm.classList.add('hide');
    });
  }

  function onRenderDone(isAnimation) {
    getElementById('tabs-result').checked = true;
    dispatchEvent(getElementById('tabs-result'),'change');
    //
    elmResult.querySelector('.btn.img').classList.remove('hide');
    isAnimation&&elmResult.querySelector('.btn.sequence').classList.remove('hide');
  }

  function onDownloadImgClick(e){
    e.preventDefault();
    var src = elmImage.getAttribute('src')
      ,fileType = src.match(/:([^;]+)/).pop()
      ,extension = fileType.split('/').pop()
      ,base64 = src.split(',').pop()
      ,blob = b64toBlob(base64,fileType)
      ,fileName = attractors.attractor.name+'.'+extension
    ;
    saveAs(blob,fileName);
  }

  function onDownloadSequenceClick(){
    var frames = attractors.animate.frames
      ,zip = new JSZip()
      ,fileName = attractors.attractor.name.replace(/\s/g,'')
      ,digits = String(frames.length).length;
    frames.forEach(function(src,i) {
      var ext = src.match(/\/([^;]+)/).pop()
        ,base64 = src.split(',').pop();
      zip.file(fileName+'_'+pad(String(i),digits,'0',true)+'.'+ext, base64, {base64: true});
    });
    saveAs(zip.generate({type:'blob'}), fileName+'.zip');
  }

  function onResultImageClick(e){
    if (!isNextClickInvalid) {
      var isZoom = elmImageWrapper.classList.toggle('zoom');
      if (isZoom) {
        removeDragEvent = addDragEvent(elmImage,onResultImageDrag);
        var rect = elmImageWrapper.getBoundingClientRect()
            ,clickX = e.pageX - rect.left
            ,clickY = e.pageY - rect.top
            ,clickPartX = clickX/rect.width
            ,clickPartY = clickY/rect.height
        ;
        clickPartX = 0.5 - imageScale*(clickPartX-0.5);
        clickPartY = 0.5 - imageScale*(clickPartY-0.5);
        percentStartX = 100*clickPartX;
        percentStartY = 100*clickPartY;
        elmImageStyle.left = percentStartX + '%';
        elmImageStyle.top  = percentStartY + '%';
      } else {
        removeDragEvent&&removeDragEvent();
      }
    } else {
      isNextClickInvalid = false;
    }
  }

  function onResultImageDrag(e,offsetX,offsetY){
    percentStartX = percentStartX + offsetX/imageScale;
    percentStartY = percentStartY + offsetY/imageScale;
    elmImageStyle.left = percentStartX + '%';
    elmImageStyle.top  = percentStartY + '%';
    isNextClickInvalid = true;
  }

  function onAnimationDrawn(image){
    elmImage.setAttribute('src',image);
  }

  function onAnimationDrawnWebm(output){
    elmVideo.src = (window.webkitURL || window.URL).createObjectURL(output);
  }

  return init;
})());