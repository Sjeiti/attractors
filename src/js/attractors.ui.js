/* globals Stats */
iddqd.ns('attractors.ui',(function(){
	var three = attractors.three
		,animate = attractors.animate
		,renderer = attractors.renderer
		,image = attractors.image
		,random = attractors.util.random
		,rndSize = 5
		,setFrame = animate.setFrame
		,getElementById = document.getElementById.bind(document)
		,util = attractors.util
		,dispatchEvent = util.dispatchEvent
		,addDragEvent = util.addDragEvent
		,wait = util.wait
		,applyDragMove = util.applyDragMove
		,array2array = util.array2array
		,signal = iddqd.signal
		,event = attractors.event
		,ANIMATION_START = event.ANIMATION_START
		,ANIMATION_FRAME = event.ANIMATION_FRAME
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
		initTabs();
		initUIAttractor();
		initUIAnimate();
		initUIRender();
		initUIResult();
		initStats();
		initTouch();
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
				,highest = -Infinity
				,i = paths.length;
			if (numPaths!==numConstants) {
				while (i-->1) svg.removeChild(paths[i]);
				//while (paths.length>1) svg.removeChild(paths[0]);
				for (i=1;i<numConstants;i++) svg.appendChild(paths[0].cloneNode());
			}
			//
			paths = svg.querySelectorAll('path');
			//
			for (i=0;i<numConstants;i++) {
				var high = Math.abs(parseFloat(getElementById('sines'+i).value));
				if (high>highest) highest = high;
			}
			svg.classList.toggle(classnameHide,highest===0);
			//
			for (i=0;i<numConstants;i++) {
				var path = paths[i]
					,sine = Math.abs(parseFloat(getElementById('sines'+i).value))
					,part = sine/highest
					,offset = getElementById('offsets'+i).value;
				part&&path.setAttribute('transform','translate('+-offset*128+','+(1-part)*64+') scale(1,'+part+')');
			}
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
				128:128
				,256:256
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
		var elmResult = getElementById('tabs-result').nextElementSibling;
		elmResult.querySelector('.btn.img').addEventListener('click',onDownloadClick);
		elmResult.querySelector('.btn.video').addEventListener('click',onDownloadClick);
		//
		var image = document.createElement('img');
		var input = document.createElement('input');
		input.setAttribute('type','file');
		elmResult.appendChild(input);
		image.addEventListener('load',onImageLoad);
		input.addEventListener('change', onFilesChange.bind(null,image), false);
		document.body.addEventListener('dragover',function(e){e.preventDefault();});
		document.body.addEventListener('drop',onDrop.bind(null,image));
		//elmImageWrapper.addEventListener('click',DOMTokenList.prototype.toggle.bind(elmImageWrapper.classList,'zoom',undefined));
		elmImageWrapper.addEventListener('click',function(){elmImageWrapper.classList.toggle('zoom');});
		//
		event.IMAGE_DRAWN.add(onImageDrawn);
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
		openTabs.length>2&&(openTabs.pop().checked = false);
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
			,pp
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
		while (tries--&&(i===undefined||isNaN(size)||!isFinite(size))) { //size<0.02||
			unlockedIndex = numUnlocked;
			while (unlockedIndex--) {
				constantIndex = unLocked[unlockedIndex];
				constants[constantIndex] = (isMove?constants[constantIndex]:0) + random(rnd*maxConstant);
			}
			i = iterations;
			while (i--) {
				attractor(p);
				if (i===1) pp = p.clone();
			}
			size = p.distanceTo(pp);
		}
		constants.forEach(function(val,j,a){
			getElementById('constants'+j).value = a[j];
		});
		dispatchConstantsChanged(constants);
		//if (isNaN(size)||!isFinite(size)) center(0,0,0);
		//else center();
		center(0,0,0);
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
			,frame = util.emptyPromise()
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
				,colorAt = getElementById('attractor-color').value
				,colorBg = getElementById('background-color').value
				,bgRadial = getElementById('background-radial').checked
				,calcDistance = getElementById('coloring-distance').checked
				,calcLyapunov = getElementById('coloring-lyapunov').checked
				,calcSurface = getElementById('coloring-surface').checked
				,render = renderer.render.bind(null,w,h,iterations,calcDistance,calcLyapunov,calcSurface)
				,rendered = image.draw.bind(null,w,h,colorAt,colorBg,bgRadial)
				,dispatchRenderDone = event.RENDER_DONE.dispatch
				;
			if (doAnimate) {
				var i = frames
					,anim = getAnimationFromTo()
					,promise = util.emptyPromise();
				ANIMATION_START.dispatch();
				while (i--) {
					promise = promise
						.then(setFrame.bind(null,frames-i-1,frames,anim.start,anim.end))
						.then(wait)
						.then(render.bind(null,frames-i-1,frames))
						.then(rendered)
						.then(ANIMATION_FRAME.dispatch);
				}
				promise
					.then(event.ANIMATION_DONE.dispatch)
					.then(dispatchRenderDone);
			} else {
				render()
					.then(rendered)
					.then(dispatchRenderDone);
			}
		}
	}

	function onRenderProgress(progress,start,frame,frames){
		var elapsed = Date.now()-start
			,isAnimation = frame!==undefined&&frames!==undefined
			,timeLeft = elapsed/progress*(100-progress);
		elmRenderIndicator.style.width = (isAnimation?frame/frames*100+progress/frames:progress)+'%';
		//elmRenderIndicator.textContent = timeLeft/1000<<0;
		elmRenderTime.textContent = timeLeft/1000<<0;
	}

	function onRenderStopped(){
		elmRender.classList.remove(classnameRendering);
	}

	function onRenderDone() {
		getElementById('tabs-attractor').checked = false;
		getElementById('tabs-result').checked = true;
		dispatchEvent(getElementById('tabs-attractor'),'change');
		dispatchEvent(getElementById('tabs-result'),'change');
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

	function onDownloadClick(e){
			var elm = e.currentTarget
				,isImage = elm.classList.contains('img')
				,elmMedium = isImage?elmImage:elmVideo
				,src = elmMedium.getAttribute('src')
				,extension = src.match(/\/(\w+);/).pop();
			elm.setAttribute('href',src);
			elm.setAttribute('download',attractor.name+'.'+extension);
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
		setAttractor(readResult.name,readResult.constants);
	}

	function setAttractor(name,constants){
		name&&Array.prototype.forEach.call(elmType.querySelectorAll('option'),function(option,i){
			var name = option.textContent.toLowerCase();
			if (name===name.toLowerCase()) {
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