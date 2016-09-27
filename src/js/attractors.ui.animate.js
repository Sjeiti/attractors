iddqd.ns('attractors.ui.animate',(function(){

  var animate = attractors.animate
      ,setFrame = animate.setFrame
      ,event = attractors.event
      ,util = attractors.util
      ,addDragEvent = util.addDragEvent
      ,array2array = util.array2array
      ,SINES_CHANGED = event.SINES_CHANGED
      ,dispatchSinesChanged = event.SINES_CHANGED.dispatch
      ,dispatchConstantsChanged = event.CONSTANTS_CHANGED.dispatch
      ,getElementById = document.getElementById.bind(document)
      //
      ,classname = attractors.classname
      ,classnameHide = classname.hide
      //
      ,elmFrames = getElementById('frames')
      ,elmTrack = getElementById('track')
      ,elmUseSines = getElementById('use-sines')
      ,elmAnimate = getElementById('animate')
      //
      ,returnValue = iddqd.extend(init,{
        getAnimationFromTo: getAnimationFromTo
      })
  ;

  Object.defineProperty(returnValue, 'frames', {
    get: getFrames
  });

  function init(){
    var attractor = attractors.attractor;
    //
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
      svg.classList&&svg.classList.toggle(classnameHide,highest===0);
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
          dispatchConstantsChanged(attractors.attractor.constants);
          updateContantsInputs();
        })
        .then((function(frame){
          return function(){ elmTrack.value = frame; };
        })(frames-i-1))
        .then(util.promiseAnimationFrame);
    }
  }

  function updateContantsInputs(){ // todo possible duplicate
    attractors.attractor.constants.forEach(function(val,i,a){
      getElementById('constants'+i).value = a[i];
    });
  }

  function getAnimationFromTo(){
    return animate.getFromTo(
      getFrames()
      ,getElementById('animate-rotate').checked
      ,elmUseSines.checked
    );
  }

  function getFrames(){
  	return parseInt(elmFrames.value,10);
  }

  return returnValue;
})());