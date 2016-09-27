iddqd.ns('attractors.ui.render',(function(){

  var renderer = attractors.renderer
      ,image = attractors.image
      ,event = attractors.event
      ,uiAnimate = attractors.ui.animate
      ,getAnimationFromTo = uiAnimate.getAnimationFromTo
      ,animate = attractors.animate
      ,setFrame = animate.setFrame
      ,util = attractors.util
      ,wait = util.wait
      ,dispatchEvent = util.dispatchEvent
      ,applyDragMove = util.applyDragMove
      ,getElementById = document.getElementById.bind(document)
      //
      ,RENDER_START = event.RENDER_START
      ,ANIMATION_START = event.ANIMATION_START
      //
      ,dispatchColorationChanged = event.COLORATION_CHANGED.dispatch
      ,dispatchBackgroundChanged = event.COLOR_BACKGROUND_CHANGED.dispatch
      ,dispatchForegroundChanged = event.COLOR_FOREGROUND_CHANGED.dispatch
      ,dispatchRadialChanged = event.IMAGE_RADIAL_CHANGED.dispatch
      ,dispatchGammaChanged = event.IMAGE_GAMMA_CHANGED.dispatch
      //
      ,dispatchIterationsChanged = event.ITERATIONS_CHANGED.dispatch
      ,dispatchImageSizeChanged = event.IMAGE_SIZE_CHANGED.dispatch
      //
      ,dispatchRenderStart = RENDER_START.dispatch
      ,dispatchRenderDone = event.RENDER_DONE.dispatch
      //
      ,classname = attractors.classname
      ,classnameRendering = classname.rendering
      //
      ,elmRender = getElementById('render')
      ,elmRenderTime = elmRender.querySelector('.cancel span')
      ,elmRenderIndicator = elmRender.querySelector('.progress')
  ;

  function init(){
    var elmColoration = getElementById('coloration')
        ,elmColorBg = getElementById('background-color')
        ,elmColorFg = getElementById('attractor-color')
        ,elmRadial = getElementById('background-radial')
        ,elmGamma = getElementById('gamma')
        ,elmGammaRange = getElementById('gammaRange')
        ,elmIterations = getElementById('iterations')
        ,elmIterationsRange = getElementById('iterationsRange')
    ;
    //
    // values that do not need a render are dispatched for image to pick up
    // coloration
    elmColoration.addEventListener('change',()=>dispatchColorationChanged(elmColoration.value));
    // color
    elmColorBg.addEventListener('change',()=>dispatchBackgroundChanged(elmColorBg.value));
    elmColorFg.addEventListener('change',()=>dispatchForegroundChanged(elmColorFg.value));
    getElementById('randomize-background-color').addEventListener('click',onRandomizeColorClick.bind(null,elmColorBg));
    getElementById('randomize-foreground-color').addEventListener('click',onRandomizeColorClick.bind(null,elmColorFg));
    event.COLORATION_CHANGED.add(coloration=>elmColorFg.parentNode.classList.toggle('hide',coloration!=='static'));
    // radial
    elmRadial.addEventListener('change',()=>dispatchRadialChanged(elmRadial.checked));
    // gamma
    elmGamma.addEventListener('change',()=>dispatchGammaChanged(parseFloat(elmGamma.value)));
    // dispatch change events for all image related elements
    [elmColoration,elmColorBg,elmColorFg,elmRadial,elmGamma].forEach(elm=>dispatchEvent(elm,'change'));
    //
    // gamma range
    applyDragMove(elmGammaRange,function(){
      var gammaValue = parseFloat(elmGammaRange.value);
      event.IMAGE_GAMMA_CHANGED.dispatch(gammaValue);
      elmGamma.value = gammaValue;
    },true);
    //
    // iterations
    applyDragMove(elmIterationsRange,function(){
      var inputValue = parseFloat(elmIterationsRange.value)
        ,max = 9
        ,maxOne = 1/max
        ,exp = inputValue*max<<0
        ,mult = Math.max(1,10 - ((maxOne*(exp+1) - inputValue)/maxOne*10<<0))
        ,result = mult*Math.pow(10,exp);
      dispatchIterationsChanged(elmIterations.value = result);
    },true);
    //
    // image size
    var sizes = {
        16:16
        ,128:128
        ,256:256
        ,512:512
        ,320:240
        ,640:480
        ,800:600
        ,1600:900
        ,2560:1440
      }
      ,availWidth = window.screen.availWidth
      ,availHeight = window.screen.availHeight
      ,elmImageSize = getElementById('image-size');
    for (var w in sizes) {
      if (sizes.hasOwnProperty(w)){
        var h = sizes[w]
          ,value = w+'-'+h
          ,option = document.createElement('option')
          ,isSelected = w==='256';//w===availWidth.toString();
        option.setAttribute('value',value);
        isSelected&&option.setAttribute('selected','selected');
        option.textContent = w+'-'+h;
        elmImageSize.appendChild(option);
      }
    }
    sizes[availWidth] = availHeight;
    elmImageSize.addEventListener('change',()=>dispatchImageSizeChanged.apply(null,elmImageSize.value.split('-').map(s=>parseInt(s,10))));
    dispatchEvent(elmImageSize,'change');
    //
    // render
    elmRender.addEventListener('click',onRenderClick);
    event.RENDER_PROGRESS.add(onRenderProgress);
    event.RENDER_CANCELED.add(onRenderStopped);
    event.RENDER_DONE.add(onRenderStopped);
  }

  function onRandomizeColorClick(elm){
    elm.value = iddqd.math.color(elm.value).huey(Math.random()).toString();
    dispatchEvent(elm,'change');
  }

  function onRenderClick(){
    if (renderer.rendering) {
      renderer.cancelRender();
    } else {
      elmRender.classList.add(classnameRendering);
      var frames = uiAnimate.frames
        ,doAnimate = getElementById('render-animate').checked
        ,render = renderer.render;
      dispatchRenderStart(doAnimate);
      if (doAnimate) { // todo: maybe move to renderer
        var i = frames
            ,anim = getAnimationFromTo()
            ,promise = Promise.resolve()
            ,start = Date.now();
        ANIMATION_START.dispatch();
        while (i--) {
          promise = promise
            .then(setFrame.bind(null,frames-i-1,frames,anim.start,anim.end))
            .then(wait)
            .then(render.bind(null,frames-i-1,frames,start))
            .then(image.draw)
          ;
        }
        promise
          .then(event.ANIMATION_DONE.dispatch)
          .then(dispatchRenderDone.bind(null,true))
          .catch(console.warn.bind(console))
        ;
      } else {
        render()
          .then(image.draw)
          .then(dispatchRenderDone);
      }
    }
  }

  /**
   * Calculate the render progress to view.
   * Has some discrepancy because progress indicates iterations and excludes the time it takes to create the image.
   * @param {Number} progress Floating point from 0 to 1 indicating the progress of the current frame
   * @param {Number} start Milliseconds at start
   * @param {Number} frame Current frame number
   * @param {Number} frames Max number of frames
   */
  function onRenderProgress(progress,start,frame,frames){
    var elapsed = Date.now()-start
        ,isAnimation = frame!==undefined&&frames!==undefined
        ,timeLeftFrame = elapsed/progress*(1-progress)
        ,framePart = isAnimation&&(frame+progress)/frames
        ,timeLeftAnim = isAnimation&&elapsed/framePart*(1-framePart)||0
        ,timeLeftTotal = isAnimation?timeLeftAnim:timeLeftFrame
        ,timeLeftMinutes = timeLeftTotal/60000<<0
        ,timeLeftSeconds = (timeLeftTotal - timeLeftMinutes*60000)/1000<<0
        ,timeLeftString = ('00'+ timeLeftMinutes).slice(-2)+':'+('00'+ timeLeftSeconds).slice(-2)
        ;
    elmRenderIndicator.style.width = 100*(isAnimation?framePart:progress)+'%';
    elmRenderTime.textContent = timeLeftString;
  }

  function onRenderStopped(){
    elmRender.classList.remove(classnameRendering);
  }

  return init;
})());