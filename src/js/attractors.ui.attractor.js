iddqd.ns('attractors.ui.attractor',(function(){

  var three = attractors.three
      ,center = three.center
      ,setCamera = three.setCamera
      ,animate = attractors.animate
      ,util = attractors.util
      ,random = util.random
      ,event = attractors.event
      ,dispatchConstantsChanged = event.CONSTANTS_CHANGED.dispatch
      ,dispatchSinesChanged = event.SINES_CHANGED.dispatch
      ,signal = iddqd.signal
      ,getElementById = document.getElementById.bind(document)
      ,rndSize = 5
      //
      ,elmType = getElementById('type')
      ,elmConstants = getElementById('constants')
      ,elmSines = getElementById('sines')
      ,elmOffsets = getElementById('offsets')
      //
      ,moveConstant
      ,attractor
  ;

  function init(){
    attractor = attractors.attractor;
    //
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

  return init;
})());