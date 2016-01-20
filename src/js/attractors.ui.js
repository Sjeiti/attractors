/* globals Stats */
iddqd.ns('attractors.ui',(function(){
	var three = attractors.three
		,animate = attractors.animate
		,setFrame = animate.setFrame
		,getElementById = document.getElementById.bind(document)
		,util = attractors.util
		,wait = util.wait
		,applyDragMove = util.applyDragMove
		,array2array = util.array2array
		,signal = iddqd.signal
		,event = attractors.event
		,ANIMATION_START = event.ANIMATION_START
		,ANIMATION_FRAME = event.ANIMATION_FRAME
		,ANIMATION_DONE = event.ANIMATION_DONE
		,center = three.center
		,redraw = three.redraw
		//,warn = console.warn.bind(console)
		//
		,moveConstant
		//
		,elmConstants = getElementById('constants')
		,elmRender = getElementById('render')
		,elmRenderIndicator = elmRender.querySelector('.progress')
		,elmImage = getElementById('image').querySelector('img')
		,elmVideo = getElementById('video').querySelector('video')
		//
		,constantsFirst = []
		,constantsLast = []
		//
		,gammaValue = 0.4
		,iterations = 1E7
		//
		,classnameRendering = 'rendering'
		//
		,stats
		,attractor
		//
		,canvas = document.createElement('canvas')
		,context = canvas.getContext('2d')
	;

	function init() {
		attractor = attractors.attractor;
		initUIAttractor();
		initUIAnimate();
		initUIRender();
		initUIResult();
		initStats();
	}

	function initUIAttractor(){
		// type
		var select = getElementById('type')
			,fragment = document.createDocumentFragment();
		attractors.list.forEach(function(attractor,i){
			var option = document.createElement('option');
			option.textContent = attractor.name;
			option.value = i;
			attractors.attractor===attractor&&option.setAttribute('selected','selected');
			fragment.appendChild(option);
		});
		select.appendChild(fragment);
		select.addEventListener('change',onTypeChange);
		// constants
		var html = '';
		attractor.constants.forEach(function(val,i){
			html += iddqd.utils.tmpl('constant',{value:val,index:i});
		});
		elmConstants.innerHTML = html;
		elmConstants.addEventListener('mousedown',onInputChange);
		elmConstants.addEventListener('change',onInputChange);
		elmConstants.addEventListener('mousewheel',onInputChange);
		// buttons
		getElementById('constantsRandomize').addEventListener('click',onRandomizeClick);
		getElementById('constantsReset').addEventListener('click',onResetClick);
		getElementById('centerAxis').addEventListener('click',center);
	}

	function initUIAnimate(){
		getElementById('store-first').addEventListener('click',function(){
			array2array(attractor.constants,constantsFirst);
		});
		getElementById('load-first').addEventListener('click',function(){
			array2array(constantsFirst,attractor.constants);
			redraw();
		});
		getElementById('store-last').addEventListener('click',function(){
			array2array(attractor.constants,constantsLast);
		});
		getElementById('load-last').addEventListener('click',function(){
			array2array(constantsLast,attractor.constants);
			redraw();
		});
		//
		getElementById('animate').querySelector('.animate').addEventListener('click',onAnimateClick);
	}

	function initUIRender(){
		var elmGamma = getElementById('gamma')
			,elmGammaRange = getElementById('gammaRange')
			,elmIterations = getElementById('iterations')
			,elmIterationsRange = getElementById('iterationsRange')
		;
		// gamma
		elmGamma.value = gammaValue;
		elmGamma.addEventListener('change',function(){gammaValue = parseFloat(elmGamma.value);});
		applyDragMove(elmGammaRange,function(){
			gammaValue = parseFloat(elmGammaRange.value);
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
		ANIMATION_DONE.add(onAnimationFinished);
	}

	function initUIResult(){
		var elmResult = getElementById('tabs-result').nextElementSibling;
		elmResult.querySelector('.btn.img').addEventListener('click',onDownloadClick);
		elmResult.querySelector('.btn.video').addEventListener('click',onDownloadClick);
	}

	function initStats(){
		stats = new Stats();
		getElementById('stats').appendChild( stats.domElement );
		signal.animate.add(stats.update.bind(stats));
	}

	function onTypeChange(e){
		var index = e.target.value;
		event.TYPE_CHANGED.dispatch(index);
		attractor = attractors.attractor;
		redrawConstants();
	}

	function onInputChange(e){
		var input = e.target
			,event = e.type
			,type = input.getAttribute('type')
			,index = parseInt(input.getAttribute('data-index'),10)
		//,isKeyShift = signal.key[16]
		//,isKeyCTRL = signal.key[17]
		//,isKeyAlt = signal.key[18]
			;
		if (type==='number') {
			e.stopPropagation();
			attractor.constants[index] = parseFloat(input.value);
			redraw();
		} else if (type==='range') {
			if (event==='mousedown') {
				moveConstant = onMoveConstant.bind(null,input);
				signal.animate.add(moveConstant);
			} else {
				signal.animate.remove(moveConstant);
				input.value = 0;
				e.stopPropagation();
			}
		}
	}

	function onMoveConstant(input) {
		var index = parseInt(input.getAttribute('data-index'),10)
			,value = input.value
			,constants = attractor.constants
			,constant = constants[index]
			;
		getElementById('constant'+index).value = constants[index] = constant + value*value*value*value*value*value*value;
		redraw();
	}

	function onRandomizeClick(){
		var iterations = 20
			,p = new THREE.Vector3(Math.random(),Math.random(),Math.random())
			,pp
			,size = 1E-3
			,tries = 1E4
			,constants = attractor.constants
			,i;
		while (tries--&&(size<0.02||isNaN(size)||!isFinite(size))) {
			constants.forEach(function(val,j,a){
				getElementById('constant'+j).value = a[j] = 24*(Math.random()-0.5);
			});
			i = iterations;
			while (i--) {
				attractor(p);
				if (i===1) pp = p.clone();
			}
			size = p.distanceTo(pp);
		}
		redraw();
		center();
	}

	function onResetClick(){
		attractor.constants.reset();
		attractor.constants.forEach(function(val,i,a){
			getElementById('constant'+i).value = a[i];
		});
		redraw();
		center();
	}

	function onAnimateClick(){
		var anim = getAnimationFromTo()
			,from = {f:0}
			,onUpdate = function(position){
				setFrame(position.f,1,anim.start,anim.end);
				redraw();
			}.bind(null,from)
		;
		new TWEEN.Tween(from)
			.to({f:1}, 2000)
			.onUpdate(onUpdate)
			.start();
	}

	function onRenderClick(){
		if (three.rendering) {
			three.cancelRender();
		} else {
			elmRender.classList.add(classnameRendering);
			var size = (function(s){
					return s.split('-').map(function(s){
						return parseInt(s,10);
					});
				})(getElementById('image-size').value)
				,w = size[0]
				,h = size[1]
				,frames = parseInt(getElementById('frames').value,10)
				,doAnimate = getElementById('render-animate').checked
				,render = attractors.three.render.bind(null,w,h,iterations)
				,rendered = onRendered.bind(null,w,h)
				,dispatchRenderDone = event.RENDER_DONE.dispatch
				;
			if (doAnimate) {
				var i = frames
					,anim = getAnimationFromTo()
					,promise = util.emptyPromise();
				ANIMATION_START.dispatch(w,h);
				while (i--) {
					promise = promise
						.then(setFrame.bind(null,frames-i-1,frames,anim.start,anim.end))
						.then(wait)
						.then(render)
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

	function onRenderProgress(progress,start){
		var elapsed = Date.now()-start
			,timeLeft = elapsed/progress*(100-progress);
		elmRenderIndicator.style.width = progress+'%';
		elmRenderIndicator.textContent = timeLeft/1000<<0;
	}

	function onRenderStopped(){
		elmRender.classList.remove(classnameRendering);
	}

	function onRenderDone(){
		getElementById('tabs-attractor').checked = false;
		getElementById('tabs-result').checked = true;
	}

	function onAnimationFinished(){
		var frames = attractors.animate.frames
			,w = attractors.animate.w
			,h = attractors.animate.h;
		var images = (function (a) {
				frames.forEach(function (src) {
					var img = document.createElement('img');
					img.setAttribute('src',src);
					a.push(img);
				});
				return a;
			})([]);
		wait().then(function(){
			gifshot.createGIF({
				gifWidth: w
				,gifHeight: h
				,images: images
				,interval: 0.04
			},function (obj) {
				if (!obj.error) {
					var image = obj.image;
					elmImage.setAttribute('src',image);
				}
			});
		});
		//////////////////////////////////////
		var encoder = new Whammy.Video();//25
		frames.forEach(encoder.add.bind(encoder));
		encoder.compile(false,function(output){
			var url = (window.webkitURL || window.URL).createObjectURL(output);
			elmVideo.src = url;
		});
	}

	function onRendered(w,h,pixels){
		var resultWrapper = getElementById('tabs-result')
			//
			,colorMax = 255
			,colorBg = getElementById('background-color').value
			,colorBgR = parseInt(colorBg.substr(1,2),16)/colorMax
			,colorBgG = parseInt(colorBg.substr(3,2),16)/colorMax
			,colorBgB = parseInt(colorBg.substr(5,2),16)/colorMax
			,colorAt = getElementById('attractor-color').value
			,colorAtR = parseInt(colorAt.substr(1,2),16)/colorMax
			,colorAtG = parseInt(colorAt.substr(3,2),16)/colorMax
			,colorAtB = parseInt(colorAt.substr(5,2),16)/colorMax
			//
			,imagedata = new ImageData(w,h)
			,data = imagedata.data
			//
			,max = 0
			,i
		;
		//
		canvas.width = w;
		canvas.height = h;
		//
		resultWrapper.classList.remove('hidden-xs-up');
		//
		i = pixels.length;
		while (i--) {
			var val = pixels[i];
			if (max<val) max = val;
		}
		i = pixels.length;
		while (i--) {
			var piximaxgam = Math.pow(pixels[i]/max,gammaValue)
				// screen
				,r = (1 - (1-colorBgR)*(1-piximaxgam*colorAtR))*colorMax<<0
				,g = (1 - (1-colorBgG)*(1-piximaxgam*colorAtG))*colorMax<<0
				,b = (1 - (1-colorBgB)*(1-piximaxgam*colorAtB))*colorMax<<0
				// multiply
				//,r = (colorBgR * piximaxgam*colorAtR)*colorMax<<0
				//,g = (colorBgG * piximaxgam*colorAtG)*colorMax<<0
				//,b = (colorBgB * piximaxgam*colorAtB)*colorMax<<0
				//
				//,r = (colorBgR&&piximaxgam*colorAtR)*colorMax<<0
				//,g = (colorBgG&&piximaxgam*colorAtG)*colorMax<<0
				//,b = (colorBgB&&piximaxgam*colorAtB)*colorMax<<0
				//,r = (colorBgR||piximaxgam*colorAtR)*colorMax<<0
				//,g = (colorBgG||piximaxgam*colorAtG)*colorMax<<0
				//,b = (colorBgB||piximaxgam*colorAtB)*colorMax<<0
				//,r = ((1-colorBgR) * piximaxgam*colorAtR)*colorMax<<0
				//,g = ((1-colorBgG) * piximaxgam*colorAtG)*colorMax<<0
				//,b = ((1-colorBgB) * piximaxgam*colorAtB)*colorMax<<0
				//,r = Math.max(colorBgR,piximaxgam*colorAtR)*colorMax<<0
				//,g = Math.max(colorBgG,piximaxgam*colorAtG)*colorMax<<0
				//,b = Math.max(colorBgB,piximaxgam*colorAtB)*colorMax<<0
			;
			data[4*i] = r;
			data[4*i+1] = g;
			data[4*i+2] = b;
			data[4*i+3] = 255;
		}
		//
		context.putImageData(imagedata,0,0);
		//
		elmImage.setAttribute('src',canvas.toDataURL('image/png'));
		return canvas.toDataURL('image/webp');
	}

	function onDownloadClick(e){
			var elm = e.currentTarget
				,isImage = elm.classList.contains('img')
				,elmMedium = isImage?elmImage:elmVideo
				,extension = isImage?'.png':'.webm';
			elm.setAttribute('href',elmMedium.getAttribute('src'));
			elm.setAttribute('download',attractor.name+extension);
	}

	function redrawConstants(){
		var html = '';
		attractor.constants.forEach(function(val,i){
			html += iddqd.utils.tmpl('constant',{value:val,index:i});
		});
		elmConstants.innerHTML = html;
		return elmConstants;
	}

	function getAnimationFromTo(){
		var start = {}
			,end = {}
			,frames = parseInt(getElementById('frames').value,10)
			,isAnimateRotate = getElementById('animate-rotate').checked;
		if (isAnimateRotate) {
			start.cameraRotationX = three.cameraRotationX;
			end.cameraRotationX = three.cameraRotationX+(360-360/(frames+1));
		}
		if (constantsFirst.length&&constantsLast.length) {
			start.constants = constantsFirst;
			end.constants = constantsLast;
		}
		return {start:start,end:end};
		/*return attractors.animate.getFromTo(
			parseInt(getElementById('frames').value,10)
			,getElementById('animate-rotate').checked
		);*/
	}

	return init;
})());