/* globals Stats */
iddqd.ns('attractors.ui',(function(){
	var warn = console.warn.bind(console)
		,three = attractors.three
		,animate = attractors.animate
		,setFrame = animate.setFrame
		,getElementById = document.getElementById.bind(document)
		,util = attractors.util
		,wait = util.wait
		,array2array = util.array2array
		,signal = iddqd.signal
		,event = attractors.event
		,center = three.center
		,redraw = three.redraw
		//
		,moveConstant
		//
		,elmConstants = getElementById('constants')
		,elmRender = getElementById('render')
		,elmRenderIndicator = elmRender.querySelector('.progress')
		,elmImage = getElementById('image')
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
		//var wrapper = redrawConstants();
		var html = '';
		attractor.constants.forEach(function(val,i){
			html += iddqd.utils.tmpl('constant',{value:val,index:i});
		});
		elmConstants.innerHTML = html;
		//wrapper.addEventListener('mousedown',stopPropagation);
		elmConstants.addEventListener('mousedown',onInputChange);
		//wrapper.addEventListener('drag',onInputChange);
		elmConstants.addEventListener('change',onInputChange);
		elmConstants.addEventListener('mousewheel',onInputChange);
		//signal.drag.add(onDrag);
		// buttons
		getElementById('constantsRandomize').addEventListener('click',onRandomizeClick);
		getElementById('constantsReset').addEventListener('click',onResetClick);
		getElementById('centerAxis').addEventListener('click',center);
	}
	function initUIRender(){
		var elmGamma = getElementById('gamma')
			,elmGammaRange = getElementById('gammaRange')
			,elmIterations = getElementById('iterations')
			,elmIterationsRange = getElementById('iterationsRange')
			,changeGamma = function(){
				gammaValue = parseFloat(elmGammaRange.value);
				elmGamma.value = gammaValue;
			}
			,changeIterations = function(){
				var inputValue = parseFloat(elmIterationsRange.value)
					,max = 9
					,maxOne = 1/max
					,exp = inputValue*max<<0
					,mult = Math.max(1,10 - ((maxOne*(exp+1) - inputValue)/maxOne*10<<0))
					,result = mult*Math.pow(10,exp);
				iterations = result;
				elmIterations.value = result;
			}
			,renderClasslist = elmRender.classList
			,renderFinished = renderClasslist.remove.bind(renderClasslist,classnameRendering)
		;
		//
		// gamma
		elmGamma.value = gammaValue;
		elmGamma.addEventListener('change',function(){gammaValue = parseFloat(elmGamma.value);});
		elmGammaRange.addEventListener('mousedown',function(){
			elmGammaRange.addEventListener('mousemove',changeGamma);
		});
		document.addEventListener('mouseup',function(){
			elmGammaRange.removeEventListener('mousemove',changeGamma);
		});
		elmGammaRange.addEventListener('change',changeGamma);
		changeGamma();
		//
		// iterations
		elmIterations.value = iterations;
		elmIterations.addEventListener('change',function(){iterations = parseFloat(elmIterations.value);});
		elmIterationsRange.addEventListener('mousedown',function(){
			elmIterationsRange.addEventListener('mousemove',changeIterations);
		});
		document.addEventListener('mouseup',function(){
			elmIterationsRange.removeEventListener('mousemove',changeIterations);
		});
		elmIterationsRange.addEventListener('change',changeIterations);
		changeIterations();
		//
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
					,isSelected = w==256;//w===availWidth.toString();
				option.setAttribute('value',value);
				isSelected&&option.setAttribute('selected','selected');
				option.textContent = w+'-'+h;
				elmImageSize.appendChild(option);
			}
		}
		sizes[availWidth] = availHeight;
		//
		// render
		elmRender.addEventListener('click',onRenderClick);
		event.RENDER_PROGRESS.add(onRenderProgress);
		event.RENDER_CANCELED.add(renderFinished);
		event.RENDER_DONE.add(renderFinished);
	}
	function initUIResult(){
		elmImage.querySelector('.btn').addEventListener('click',onImageHide);
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
		getElementById('animate').querySelector('.animate').addEventListener('click',function(){
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
		});
	}

	function onRenderProgress(progress,start){
		var elapsed = Date.now()-start
			,timeLeft = elapsed/progress*(100-progress);
		elmRenderIndicator.style.width = progress+'%';
		elmRenderIndicator.textContent = timeLeft/1000<<0;
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
			;
			if (doAnimate) {
				var rendered = onRendered.bind(null,w,h)
					,i = frames
					,anim = getAnimationFromTo()
					,promise;
				animate.start();
				while (i--) {
					if (!promise) {
						setFrame(0,frames,anim.start,anim.end);
						promise = wait().then(render);
					} else {
						promise = promise
							.then(setFrame.bind(null,frames-i-1,frames,anim.start,anim.end))
							.then(wait)
							.then(render);
					}
					promise = promise
						.then(rendered,warn)
						.then(animate.storeFrame,warn);
				}
				promise
					.then(console.log.bind(console,'pack frames into animation'))
					.then(animate.end.bind(null,w,h))
					.then(event.RENDER_DONE.dispatch);
			} else {
				render()
					.then(onRendered.bind(null,w,h),warn)
					.then(event.RENDER_DONE.dispatch);
			}
		}
	}

	function onRendered(w,h,pixels){
		var resultWrapper = getElementById('result')
			,img = resultWrapper.querySelector('img')||(function(img){
				img.classList.add('image');
				elmImage.appendChild(img);
				return img;
			})(document.createElement('img'))
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
			,src
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
		src = canvas.toDataURL();
		//
		img.setAttribute('src',src);
		return src;
	}

	function onImageHide(){
		getElementById('result').classList.add('hidden-xs-up');
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
			,isAnimateRotate = getElementById('animate-rotate').checked;
		if (isAnimateRotate) {
			start.cameraRotationX = three.cameraRotationX;
			end.cameraRotationX = start.cameraRotationX+(360-360/(frames+1));
		}
		if (constantsFirst.length&&constantsLast.length) {
			start.constants = constantsFirst;
			end.constants = constantsLast;
		}
		return {start:start,end:end};
	}

	return init;
})());