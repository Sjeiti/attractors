/* globals Stats */
iddqd.ns('attractors.ui',(function(){
  var getElementById = document.getElementById.bind(document)
      ,util = attractors.util
      ,dispatchEvent = util.dispatchEvent
      ,array2array = util.array2array
      ,signal = iddqd.signal
      ,event = attractors.event
      ,dispatchConstantsChanged = event.CONSTANTS_CHANGED.dispatch
      //
      ,elmUi = getElementById('ui')
      ,elmsInputTabs = document.querySelectorAll('#ui>.tab input.tabs')
      ,elmType = getElementById('type')
      //
      ,stats
      ,attractor
      //
      ,openTabs = []
  ;

  function init() {
    attractor = attractors.attractor;
    var ui = attractors.ui;
    //
    initUi();
    initTabs();
    //
    ui.attractor();
    ui.animate();
    ui.render();
    ui.result();
    //
    initImageDrop();
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

  function initImageDrop(){
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

  return init;
})());