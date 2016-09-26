iddqd.ns('attractors.ui.render',(function(){

  var renderer = attractors.renderer
      ,image = attractors.image
      ,event = attractors.event
      ,animate = attractors.animate
      ,setFrame = animate.setFrame
      ,RENDER_START = event.RENDER_START
      ,ANIMATION_START = event.ANIMATION_START
      ,util = attractors.util
      ,dispatchEvent = util.dispatchEvent
      ,wait = util.wait
      ,applyDragMove = util.applyDragMove
      ,getElementById = document.getElementById.bind(document)
      //
      ,classname = attractors.classname
      ,classnameRendering = classname.rendering
      //
      ,iterations = 1E7
      //
      ,elmColoration = getElementById('coloration')
      ,elmColorBg = getElementById('background-color')
      ,elmColorFg = getElementById('attractor-color')
      ,elmVideo = document.createElement('video')
      ,elmRender = getElementById('render')
      ,elmRenderTime = elmRender.querySelector('.cancel span')
      ,elmRenderIndicator = elmRender.querySelector('.progress')
      ,elmFrames = getElementById('frames')
      ,elmUseSines = getElementById('use-sines')
      ,elmResult = getElementById('tabs-result').nextElementSibling
      ,elmImageWrapper = getElementById('image')
      ,elmImage = elmImageWrapper.querySelector('img')
  ;

  function init(){
    var elmGamma = getElementById('gamma')
      ,elmGammaRange = getElementById('gammaRange')
      ,elmIterations = getElementById('iterations')
      ,elmIterationsRange = getElementById('iterationsRange')
    ;
    event.COLORATION_CHANGED.add(function(type){
      console.log('type',type); // todo: remove log
    });
    //
    elmColoration.addEventListener('change',function(e){
      var coloration = e.currentTarget.value;
      event.COLORATION_CHANGED.dispatch(coloration);
      elmColorFg.parentNode.classList.toggle('hide',coloration!=='static');
    });
    //
    // gamma
    elmGamma.addEventListener('change',function(){
      event.IMAGE_GAMMA_CHANGED.dispatch(parseFloat(elmGamma.value));
    });
    applyDragMove(elmGammaRange,function(){
      var gammaValue = parseFloat(elmGammaRange.value);
      event.IMAGE_GAMMA_CHANGED.dispatch(gammaValue);
      elmGamma.value = gammaValue;
    },true);
    // iterations
    elmIterations.value = iterations;
    elmIterations.addEventListener('change',function(){iterations = parseFloat(elmIterations.value);});
    applyDragMove(elmIterationsRange,function(){
      var inputValue = parseFloat(elmIterationsRange.value)
        ,max = 9
        ,maxOne = 1/max
        ,exp = inputValue*max<<0
        ,mult = Math.max(1,10 - ((maxOne*(exp+1) - inputValue)/maxOne*10<<0))
        ,result = mult*Math.pow(10,exp);
      iterations = result;
      elmIterations.value = result;
    },true);
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
    // color
    event.COLOR_BACKGROUND_CHANGED.dispatch(elmColorBg.value);
    elmColorBg.addEventListener('change',function(){
      event.COLOR_BACKGROUND_CHANGED.dispatch(elmColorBg.value);
    });
    event.COLOR_FOREGROUND_CHANGED.dispatch(elmColorFg.value);
    elmColorFg.addEventListener('change',function(){
      event.COLOR_FOREGROUND_CHANGED.dispatch(elmColorFg.value);
    });
    getElementById('randomize-background-color').addEventListener('click',onRandomizeColorClick.bind(null,elmColorBg));
    getElementById('randomize-foreground-color').addEventListener('click',onRandomizeColorClick.bind(null,elmColorFg));
    // render
    elmRender.addEventListener('click',onRenderClick);
    event.RENDER_PROGRESS.add(onRenderProgress);
    event.RENDER_CANCELED.add(onRenderStopped);
    event.RENDER_DONE.add(onRenderStopped);
    event.RENDER_DONE.add(onRenderDone);
    event.ANIMATION_DRAWN.add(onAnimationDrawn);
    event.ANIMATION_DRAWN_WEBM.add(onAnimationDrawnWebm);
  }

  function onRandomizeColorClick(elm){
    elm.value = iddqd.math.color(elm.value).huey(Math.random()).toString();
    (elm===elmColorBg&&event.COLOR_BACKGROUND_CHANGED||event.COLOR_FOREGROUND_CHANGED).dispatch(elm.value);
  }

  function onRenderClick(){
    if (renderer.rendering) {
      renderer.cancelRender();
    } else {
      elmRender.classList.add(classnameRendering);
      var size = (function(s){
          return s.split('-').map(function(s){
            return parseInt(s,10);
          });
        })(getElementById('image-size').value)
        ,w = size[0]
        ,h = size[1]
        ,frames = parseInt(elmFrames.value,10)
        ,doAnimate = getElementById('render-animate').checked
        ,colorAt = elmColorFg.value
        ,colorBg = elmColorBg.value
        ,bgRadial = getElementById('background-radial').checked
        ,calcDistance = false//getElementById('coloring-distance').checked
        ,calcLyapunov = false//getElementById('coloring-lyapunov').checked
        ,calcSurface = false//getElementById('coloring-surface').checked
        ,calcSpace = elmColoration.value==='space'//!calcDistance&&!calcLyapunov&&!calcSurface&&!elmStaticColor.checked
        ,render = renderer.render.bind(null,w,h,iterations,calcSpace,calcDistance,calcLyapunov,calcSurface)
        ,rendered = image.draw.bind(null,w,h,colorAt,colorBg,bgRadial)
        ,dispatchRenderDone = event.RENDER_DONE.dispatch
        ;
      RENDER_START.dispatch(doAnimate);
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
            .then(rendered)
          ;
        }
        promise
          .then(event.ANIMATION_DONE.dispatch)
          .then(dispatchRenderDone.bind(null,true))
          .catch(console.warn.bind(console))
        ;
      } else {
        render()
          .then(rendered)
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

  function onRenderDone(isAnimation) {
    getElementById('tabs-attractor').checked = false;
    getElementById('tabs-result').checked = true;
    dispatchEvent(getElementById('tabs-attractor'),'change');
    dispatchEvent(getElementById('tabs-result'),'change');
    //
    elmResult.querySelector('.btn.img').classList.remove('hide');
    isAnimation&&elmResult.querySelector('.btn.sequence').classList.remove('hide');
  }

  function onAnimationDrawn(image){
    elmImage.setAttribute('src',image);
  }

  function onAnimationDrawnWebm(output){
    elmVideo.src = (window.webkitURL || window.URL).createObjectURL(output);
  }

  function getAnimationFromTo(){ // todo: duplicate in ui.animate
    return animate.getFromTo(
      parseInt(elmFrames.value,10)
      ,getElementById('animate-rotate').checked
      ,elmUseSines.checked
    );
  }


  return init;
})());