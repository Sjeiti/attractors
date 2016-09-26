/* globals Stats */
iddqd.ns('attractors.ui',(function(){
  var pad = iddqd.internal.native.string.pad
    ,three = attractors.three
    ,animate = attractors.animate
    ,renderer = attractors.renderer
    ,image = attractors.image
    ,rndSize = 5
    ,setFrame = animate.setFrame
    ,getElementById = document.getElementById.bind(document)
    ,util = attractors.util
    ,random = util.random
    ,b64toBlob = util.b64toBlob
    ,dispatchEvent = util.dispatchEvent
    ,addDragEvent = util.addDragEvent
    ,wait = util.wait
    ,applyDragMove = util.applyDragMove
    ,array2array = util.array2array
    ,signal = iddqd.signal
    ,event = attractors.event
    ,RENDER_START = event.RENDER_START
    ,ANIMATION_START = event.ANIMATION_START
    ,CONSTANTS_CHANGED = event.CONSTANTS_CHANGED
    ,dispatchConstantsChanged = CONSTANTS_CHANGED.dispatch
    ,SINES_CHANGED = event.SINES_CHANGED
    ,dispatchSinesChanged = SINES_CHANGED.dispatch
    ,center = three.center
    ,setCamera = three.setCamera
    //,warn = console.warn.bind(console)
    //
    ,moveConstant
    //
    ,elmUi = getElementById('ui')
    ,elmConstants = getElementById('constants')
    ,elmSines = getElementById('sines')
    ,elmOffsets = getElementById('offsets')
    ,elmRender = getElementById('render')
    ,elmRenderTime = elmRender.querySelector('.cancel span')
    ,elmRenderIndicator = elmRender.querySelector('.progress')
    ,elmImageWrapper = getElementById('image')
    ,elmImage = elmImageWrapper.querySelector('img')
    ,elmVideo = document.createElement('video')
    ,elmsInputTabs = document.querySelectorAll('#ui>.tab input.tabs')
    ,elmType = getElementById('type')
    ,elmFrames = getElementById('frames')
    ,elmTrack = getElementById('track')
    ,elmAnimate = getElementById('animate')
    ,elmUseSines = getElementById('use-sines')
    ,elmColorBg = getElementById('background-color')
    ,elmColorFg = getElementById('attractor-color')
    //,elmStaticColor = getElementById('static-color')
    ,elmColoration = getElementById('coloration')
    ,elmResult = getElementById('tabs-result').nextElementSibling
    //
    ,iterations = 1E7
    //
    ,classnameRendering = 'rendering'
    ,classnameHide = 'hidden-xs-up'
    //
    ,stats
    ,attractor
    //
    ,openTabs = []
  ;

  function init() {
    attractor = attractors.attractor;
    //
    initUi();
    initTabs();
    initUIAttractor();
    initUIAnimate();
    initUIRender();
    initUIResult();
    initStats();
    initTouch();
  }

  function initUi(){
    var uiClassList = elmUi.classList;
    //elmUi.addEventListener('mouseleave',DOMTokenList.prototype.remove.bind(uiClassList,'hover'));
    //elmUi.addEventListener('mouseup',DOMTokenList.prototype.add.bind(uiClassList,'hover'));
    //$timeout(DOMTokenList.prototype.add.bind(elm.classList,'scroll-fixed'));
    elmUi.addEventListener('mouseleave',function(){
      uiClassList.remove('hover');
    });
    elmUi.addEventListener('mouseup',function(){
      uiClassList.add('hover');
    });
    elmUi.addEventListener('mousewheel',function(e){
      e.stopPropagation();
    });
  }

  function initTabs(){
    Array.prototype.forEach.call(elmsInputTabs,function(input){
      input.addEventListener('change',onTabChange);
      input.checked&&openTabs.push(input);
    });
  }

  function initUIAttractor(){
    // type
    var fragment = document.createDocumentFragment();
    attractors.list.forEach(function(attractor,i){
      var option = document.createElement('option');
      option.textContent = attractor.name;
      option.value = i;
      attractors.attractor===attractor&&option.setAttribute('selected','selected');
      fragment.appendChild(option);
    });
    elmType.appendChild(fragment);
    elmType.addEventListener('change',onTypeChange);
    event.TYPE_CHANGED.add(onTypeChanged);
    // constants
    redrawConstants();
    [elmConstants,elmSines,elmOffsets].forEach(function(elm){
      elm.addEventListener('mousedown',onInputChange);
      elm.addEventListener('touchstart',onInputChange);
      elm.addEventListener('change',onInputChange);
      elm.addEventListener('mousewheel',onInputChange);
    });
    // buttons
    getElementById('constantsRandomize').addEventListener('click',onRandomizeClick);
    getElementById('constantsRandomizeTiny').addEventListener('click',onRandomizeClick.bind(null,1E-3));
    getElementById('constantsReset').addEventListener('click',onResetClick);
    getElementById('centerAttractor').addEventListener('click',center);
    getElementById('centerAxis').addEventListener('click',center.bind(null,0,0,0));
  }

  function initUIAnimate(){
    array2array(attractor.constants,animate.constantsFirst);
    array2array(attractor.constants,animate.constantsLast);
    //
    elmFrames.addEventListener('change',function(){
      elmTrack.setAttribute('max',elmFrames.value);
    });
    //
    //
    var fncApplySines = function(){ // todo: extract
      var constantsFirst = animate.constantsFirst
        ,constantsLast = animate.constantsLast
        ,constants = attractor.constants
        ,sines = animate.sines
        ,diffFr = constantsFirst.length===0?constants:constantsFirst
        ,diffTo = constantsLast.length===0?constants:constantsLast
      ;
      diffTo.forEach(function(f,i){
        getElementById('sines'+i).value = sines[i] = f - diffFr[i];
      });
      dispatchSinesChanged();
    };
    //
    elmUseSines.addEventListener('change',function(){
      var isChecked = elmUseSines.checked;
      elmAnimate.classList.toggle('use-sines',isChecked);
      getElementById('use-sines-switch').checked = isChecked;
      isChecked&&fncApplySines();
    });
    //
    //
    /////////////////////////////////////////////
    var lastFrame
      ,fnChange = function(force){ // todo: extract
        var anim = getAnimationFromTo() // todo: cache?
          ,frames = elmFrames.value
          ,frame = elmTrack.value;
        if (force===true||lastFrame!==frame) {
          setFrame(frame,frames,anim.start,anim.end);
          dispatchConstantsChanged(attractor.constants);
          updateContantsInputs();
        }
        lastFrame = frame;
      }
    ;
    addDragEvent(elmTrack,fnChange);
    elmTrack.addEventListener('change',fnChange);
    SINES_CHANGED.add(fnChange.bind(null,true));
    /////////////////////////////////////////////
    //
    getElementById('store-first').addEventListener('click',function(){
      array2array(attractor.constants,animate.constantsFirst);
      elmUseSines.checked&&fncApplySines();
      animate.cameraFirst.update();
    });
    /*getElementById('load-first').addEventListener('click',function(){
      dispatchConstantsChanged(array2array(animate.constantsFirst,attractor.constants));
      updateContantsInputs();
      setCamera();
      elmTrack.value = 0;
    });*/
    //
    getElementById('store-last').addEventListener('click',function(){
      array2array(attractor.constants,animate.constantsLast);
      elmUseSines.checked&&fncApplySines();
      animate.cameraLast.update();
    });
    /*getElementById('load-last').addEventListener('click',function(){
      dispatchConstantsChanged(array2array(animate.constantsLast,attractor.constants));
      updateContantsInputs();
      setCamera();
      elmTrack.value = elmFrames.value;
    });*/
    //
    //getElementById('set-sines').addEventListener('click',fncApplySines);
    /////////////////////////////////////////////
    var svg = getElementById('wrapper-track').querySelector('svg');
    SINES_CHANGED.add(function(){ // todo: extract
      var constants = attractor.constants
          ,paths = svg.querySelectorAll('path')
          ,numPaths = paths.length
          ,numConstants = constants.length
          ,getValues = function(type){
            var a = []
                ,i = numConstants;
            while (i--) a.push(Math.abs(parseFloat(getElementById(type+(numConstants-1-i)).value)));
            return a;
          }
          ,values = getValues('sines')
          ,offsets = getValues('offsets')
          ,highest = Math.max.apply(null,values)//-Infinity
          ,i = paths.length
      ;
      if (numPaths!==numConstants) {
        while (i-->1) svg.removeChild(paths[i]);
        for (i=1;i<numConstants;i++) svg.appendChild(paths[0].cloneNode());
      }
      //
      paths = svg.querySelectorAll('path');
      //
      svg.classList.toggle(classnameHide,highest===0);
      //
      for (i=0;i<numConstants;i++) {
        var path = paths[i]
          ,sine = values[i]
          ,offset = offsets[i]
          ,part = highest&&sine/highest||0;
        path.setAttribute('transform','translate('+-offset*128+','+(1-part)*64+') scale(1,'+part+')');
      }
      dispatchConstantsChanged();
    });
    dispatchSinesChanged();
    /////////////////////////////////////////////
    //
    elmAnimate.querySelector('.animate').addEventListener('click',onAnimateClick);
  }

  function initUIRender(){
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

  function initUIResult(){
    elmResult.querySelector('.btn.img').addEventListener('click',onDownloadImgClick);
    elmResult.querySelector('.btn.sequence').addEventListener('click',onDownloadSequenceClick);
    //elmResult.querySelector('.btn.video').addEventListener('click',onDownloadClick);
    //
    event.IMAGE_DRAWN.add(onImageDrawn);
    event.RENDER_START.add(onRenderStart);
    //
    // reading dropped image data
    var image = document.createElement('img');
    image.addEventListener('load',onImageLoad);
    //
    var input = document.createElement('input');
    input.setAttribute('type','file');
    input.addEventListener('change', onFilesChange.bind(null,image), false);
    //elmResult.appendChild(input);
    document.body.addEventListener('dragover',function(e){e.preventDefault();});
    document.body.addEventListener('drop',onDrop.bind(null,image));
    //
    // zoom and drag zoomed
    var percentStartX = 50
        ,percentStartY = 50
        ,elmImageStyle = elmImage.style
        ,matchScale = iddqd.style.select('#image.zoom img').pop().style.transform.match(/scale\(\s?([^,]+)/)
        ,imageScale = parseFloat(matchScale&&matchScale.pop()||1)
        ,removeDragEvent
        ,isNextClickInvalid = false
    ;
    elmImageWrapper.addEventListener('click',onResultImageClick);
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
  }

  function initStats(){
    stats = new Stats();
    getElementById('stats').appendChild( stats.domElement );
    signal.animate.add(stats.update.bind(stats));
  }

  function initTouch(){
    document.body.addEventListener('touchstart',onBodyTouchStart);
    document.body.addEventListener('click',onBodyClickStart);
    function onBodyTouchStart(){
      removeEvents();
      document.documentElement.classList.add('touch');
    }
    function onBodyClickStart(){
      removeEvents();
      document.documentElement.classList.add('no-touch');
    }
    function removeEvents(){
      document.body.removeEventListener('touchstart',onBodyTouchStart);
      document.body.removeEventListener('click',onBodyClickStart);
    }
  }

  function onTabChange(e){
    var input = e.currentTarget
      ,checked = input.checked
      ,index = openTabs.indexOf(input);
    index!==-1&&openTabs.splice(index,1);
    checked&&openTabs.unshift(input);
    //openTabs.length>2&&(openTabs.pop().checked = false);
  }

  function onTypeChange(e){
    var index = e.target.value;
    event.TYPE_CHANGED.dispatch(index);
    attractor = attractors.attractor;
    redrawConstants();
  }

  function onTypeChanged(index){
    elmType.value = index;
  }

  function onInputChange(e){
    var wrapper = e.currentTarget
      ,input = e.target
      ,event = e.type
      ,type = input.getAttribute('type')
      ,index = parseInt(input.getAttribute('data-index'),10)
      ,isControlAdd = input.getAttribute('data-type')==='add'
      ,model = {
        constants: attractor.constants
        ,sines: animate.sines
        ,offsets: animate.offsets
      }[input.getAttribute('data-model')]
      ,isModelConstants = model===attractor.constants
      ,animations = wrapper.a||(wrapper.a=[])
      ,removeAnimations = function(){while (animations.length) signal.animate.remove(animations.pop());}
      ,dispatch = isModelConstants?dispatchConstantsChanged:dispatchSinesChanged
    ;
    if (type==='number') {
      e.stopPropagation();
      model[index] = parseFloat(input.value);
      dispatch&&dispatch(model);
    } else if (type==='range') {
      if (event==='mousedown'||event==='touchstart') {
        removeAnimations();
        moveConstant = onMoveConstant.bind(null,input,input.nextElementSibling,model,index,isControlAdd,dispatch);
        signal.animate.add(moveConstant);
        animations.push(moveConstant);
      } else {
        removeAnimations();
        signal.animate.remove(moveConstant);
        isControlAdd&&(input.value = 0);
        e.stopPropagation();
        isModelConstants&&three.computeBoundingSphere();
      }
    }
  }

  function onMoveConstant(input,inputNumber,model,index,isControlAdd,dispatch) {
    var value = input.value
      ,numberValue = model[index];
    inputNumber.value = model[index] = isControlAdd?numberValue + value*value*value*value*value*value*value:value;
    dispatch&&dispatch(model);
  }

  function onRandomizeClick(rnd,e){
    var iterations = 20
      ,isMove = typeof rnd==='number'
      ,p = new THREE.Vector3(random(rndSize),random(rndSize),random(rndSize))
      ,pp = new THREE.Vector3(0,0,0)
      ,size = 1E-3
      ,tries = 1E6
      ,constants = attractor.constants
      ,maxConstant = attractor.constantSize
      ,unLocked = Array.prototype.filter.call(getElementById('constants').querySelectorAll('fieldset input[type=checkbox]'),function(input){
          return !input.checked;
        }).map(function(input){
          return parseInt(input.getAttribute('data-index'),10);
        })
      ,numUnlocked = unLocked.length
      ,unlockedIndex
      ,constantIndex
      ,i
    ;
    if (!isMove) rnd = 1;
    //
    while (tries--&&(i===undefined||isNaN(size)||!isFinite(size)||size<0.02)) { //size<0.02||
      unlockedIndex = numUnlocked;
      while (unlockedIndex--) {
        constantIndex = unLocked[unlockedIndex];
        constants[constantIndex] = (isMove?constants[constantIndex]:0) + random(rnd*maxConstant);
      }
      i = iterations;
      while (i--) {
        attractor(p);
        if (i===1) {
          pp.x = p.x;
          pp.y = p.y;
          pp.z = p.z;
        }
      }
      size = p.distanceTo(pp);
    }
    constants.forEach(function(val,j,a){
      getElementById('constants'+j).value = a[j];
    });
    dispatchConstantsChanged(constants);
    center();
    setCamera();
  }

  function onResetClick(){
    var constants = attractor.constants;
    constants.reset();
    updateContantsInputs();
    dispatchConstantsChanged(constants);
    center();
    setCamera();
  }

  function onAnimateClick(){
    var anim = getAnimationFromTo()
      ,frames = parseInt(elmFrames.value,10)
      ,i = frames
      ,frame = Promise.resolve()
    ;
    while (i--) {
      frame = frame
        .then(setFrame.bind(null,frames-i-1,frames,anim.start,anim.end))
        .then(function(){
          dispatchConstantsChanged(attractor.constants);
          updateContantsInputs();
        })
        .then((function(frame){
          return function(){ elmTrack.value = frame; };
        })(frames-i-1))
        .then(util.promiseAnimationFrame);
    }
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

  function onImageDrawn(canvas){
    var resultWrapper = getElementById('tabs-result');
    resultWrapper.classList.remove(classnameHide);
    elmImage.setAttribute('src',canvas.toDataURL('image/png'));
  }

  function onRenderStart(){//isAnimation
    Array.prototype.forEach.call(elmResult.querySelector('.btn'),function(elm){
      elm.classList.add('hide');
    });
  }

  function onDownloadImgClick(e){
    e.preventDefault();
    var src = elmImage.getAttribute('src')
      ,fileType = src.match(/:([^;]+)/).pop()
      ,extension = fileType.split('/').pop()
      ,base64 = src.split(',').pop()
      ,blob = b64toBlob(base64,fileType)
      ,fileName = attractor.name+'.'+extension
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

  function onDrop(image,e){
    e.preventDefault();
    readFiles(image,e.dataTransfer.files);
  }
  function onFilesChange(image,e) {
    readFiles(image,e.target.files);
  }
  function readFiles(image,files){
    for (var i = 0, f; f = files[i]; i++) {
      if (f.type.match('image.*')) {
        var reader = new FileReader();
        reader.addEventListener('load',onReaderLoad.bind(reader,image));
        reader.readAsDataURL(f);
      }
    }
  }
  function onReaderLoad(image,e){
    image.setAttribute('src',e.target.result);
  }
  function onImageLoad(e){
    var image = e.target
      ,readResult = attractors.image.read(image);
    console.log('readResult',readResult); // todo: remove log
    setAttractor(readResult.name,readResult.constants);
  }

  function setAttractor(attractorName,constants){
    attractorName&&Array.prototype.forEach.call(elmType.querySelectorAll('option'),function(option,i){
      var name = option.textContent.toLowerCase();
      if (name===attractorName.toLowerCase()) {
        if (elmType.value!==option.value) {
          elmType.value = option.value;
          dispatchEvent(elmType,'change');
        }
      }
    });
    constants&&dispatchConstantsChanged(array2array(constants,attractor.constants));
  }

  function updateContantsInputs(){
    attractor.constants.forEach(function(val,i,a){
      getElementById('constants'+i).value = a[i];
    });
  }

  function redrawConstants(){
    var constants = attractor.constants
      ,offsets = animate.offsets
      ,htmlConstants = ''
      ,htmlsines = elmSines.querySelector('h3').outerHTML
      ,htmlOffsets = elmOffsets.querySelector('h3').outerHTML;
    constants.forEach(function(val,i){
      htmlConstants += iddqd.utils.tmpl('constant',{value:val,index:i,min:-1,max:1,rangevalue:0,model:'constants',type:'add'});
      htmlsines +=     iddqd.utils.tmpl('constant',{value:0,index:i,min:-1,max:1,rangevalue:0,model:'sines',type:'add'});
      htmlOffsets +=   iddqd.utils.tmpl('constant',{value:offsets[i],index:i,min:0,max:2,rangevalue:offsets[i],model:'offsets',type:'absolute'});
    });
    elmConstants.innerHTML = htmlConstants;
    elmSines.innerHTML = htmlsines;
    elmOffsets.innerHTML = htmlOffsets;
    //
    Array.prototype.forEach.call(elmSines.querySelectorAll('.hide,.icon-lock'),function(elm){
      elm.parentNode.removeChild(elm);
    });
    Array.prototype.forEach.call(elmOffsets.querySelectorAll('.hide,.icon-lock'),function(elm){
      elm.parentNode.removeChild(elm);
    });
    //
    return elmConstants;
  }

  function getAnimationFromTo(){
    return animate.getFromTo(
      parseInt(elmFrames.value,10)
      ,getElementById('animate-rotate').checked
      ,elmUseSines.checked
    );
  }

  return init;
})());