/* globals Stats */
iddqd.ns('attractors.ui',(function(){
	var warn = console.warn.bind(console)
		,three = attractors.three
		,animate = attractors.animate
		,setFrame = animate.setFrame
		,getElementById = document.getElementById.bind(document)
		,signal = iddqd.signal
		,event = attractors.event
		,REDRAW = event.REDRAW
		,center = three.center
		,redraw = REDRAW.dispatch.bind(REDRAW)//attractors.three.redraw//
		//,xhttp = iddqd.pattern.callbackToPromise(iddqd.network.xhttp)
		//
		,elmConstants = getElementById('constants')
		,elmRender = getElementById('render')
		,elmImage = getElementById('image')
		//
		,constantsFirst = []
		,constantsLast = []
		//
		,gammaValue = 0.6
		,iterations = 1E7
		//
		,stats
		,attractor
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
			;
		//
		//
		elmGamma.value = gammaValue;
		elmGamma.addEventListener('change',function(){gammaValue = parseFloat(elmGamma.value);});
		elmGammaRange.addEventListener('mousedown',function(){
			elmGammaRange.addEventListener('mousemove',changeGamma);
		});
		document.addEventListener('mouseup',function(){
			elmGammaRange.removeEventListener('mousemove',changeGamma);
		});
		elmGammaRange.addEventListener('change',changeGamma);
		//
		//
		elmIterations.value = iterations;
		elmIterations.addEventListener('change',function(){iterations = parseFloat(elmIterations.value);});
		elmIterationsRange.addEventListener('mousedown',function(){
			elmIterationsRange.addEventListener('mousemove',changeIterations);
		});
		document.addEventListener('mouseup',function(){
			elmIterationsRange.removeEventListener('mousemove',changeIterations);
		});
		elmIterationsRange.addEventListener('change',changeIterations);
		//
		//
		elmRender.addEventListener('click',onRenderClick);
		event.RENDER_PROGRESS.add(onRenderProgress);
	}
	function initUIResult(){
		elmImage.querySelector('.btn').addEventListener('click',onImageHide);
	}

	function initUIAnimate(){
		var constants = attractor.constants;
		getElementById('store-first').addEventListener('click',array2array.bind(null,constants,constantsFirst));
		getElementById('load-first').addEventListener('click',function(){
			array2array(constantsFirst,constants);
			redraw();
		});
		getElementById('store-last').addEventListener('click',array2array.bind(null,constants,constantsLast));
		getElementById('load-last').addEventListener('click',function(){
			array2array(constantsLast,constants);
			redraw();
		});
		//
		getElementById('animate').querySelector('.animate').addEventListener('click',function(){
			var from = { x: three.cameraRotationX }
				,to = { x: from.x+360 }
				,onUpdate = function(position){
				var hasConstants = false;
					three.cameraRotationX = position.x;
				  constants.forEach(function(n,i){
						var c = position[i];
				  	if (c) {
							constants[i] = c;
							hasConstants = true;
						}
				  });
					hasConstants&&redraw();
				}.bind(null,from);
			array2array(constantsFirst,from);
			array2array(constantsLast,to);
			new TWEEN.Tween(from)
				.to(to, 2000)
				.onUpdate(onUpdate)
				.start();
		});
		//signal.animate.add(TWEEN.update.bind(TWEEN));
	}

	function onRenderProgress(progress){
		var indicator = elmRender.querySelector('.progress');
		indicator.style.width = 100-progress+'%';
	}

	function initStats(){
		stats = new Stats();
		getElementById('stats').appendChild( stats.domElement );
		signal.animate.add(stats.update.bind(stats));
	}

	/*function onDrag(o,e){
		console.log('onDrag',arguments); // todo: remove log
		if (e.target.nodeName==='INPUT') e.stopPropagation();
	}*/

	function onTypeChange(e){
		var index = e.target.value;
		event.TYPE_CHANGED.dispatch(index);
		attractor = attractors.attractor;
		redrawConstants();
	}

	var asdf;

	function onInputChange(e){
		console.log('onInputChange'); // todo: remove log
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
			console.log('onInputChange',attractor.name,type,input.value,attractor.constants); // todo: remove log
			attractor.constants[index] = parseFloat(input.value);
			redraw();
			//if (event==='mousewheel') setTimeout(attractor.redraw,40);
			//console.log('event',event); // todo: remove log
			/*if (event==='mousewheel') {
				e.type = 'foo';
				setTimeout(onInputChange.bind(null,e),1);
			} else {
			}
			console.log('event',event); // todo: remove log*/
		} else if (type==='range') {
			if (event==='mousedown') {
				asdf = onMoveConstant.bind(null,input);
				console.log('attractor.name',attractor.name); // todo: remove log
				signal.animate.add(asdf);
			} else {
				signal.animate.remove(asdf);
				input.value = 0;
				e.stopPropagation();
			}
			console.log('range',input.value); // todo: remove log
		}
		//attractor.redraw();
		////e.preventDefault();//todo:fix
		//console.log('signal.key',signal.key); // todo: remove log
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

	function onRandomizeClick(e){
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

	function onResetClick(e){
		attractor.constants.reset();
		attractor.constants.forEach(function(val,i,a){
			getElementById('constant'+i).value = a[i];
		});
		redraw();
		center();
	}

	function onRenderClick(e){
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
				,cameraRotationX = three.cameraRotationX
				,propstart = {cameraRotationX:cameraRotationX}
				,propend = {cameraRotationX:cameraRotationX+(360-360/(frames+1))}
				,promise;
			animate.start();
			while (i--) {
				if (!promise) {
					promise = render();
				} else {
					promise = promise
						.then(setFrame.bind(null,frames-i-1,frames,propstart,propend))
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
			;
		} else {
			render().then(onRendered.bind(null,w,h),warn);
		}
	}

	function wait(){
		return new Promise(function(resolve){
			setTimeout(resolve,40);
		});
	}

	function onRendered(w,h,pixels){
		var png = new PNGlib(w,h,256)
			,resultWrapper = getElementById('result')
			,img = resultWrapper.querySelector('img')||(function(img){
				img.classList.add('image');
				elmImage.appendChild(img);
				return img;
			})(document.createElement('img'))
			,max = 0
			,i
			,src;
		resultWrapper.classList.remove('hidden-xs-up');
		png.color(0, 0, 0, 0); // set the background transparent
		//
		i = pixels.length;
		while (i--) {
			var val = pixels[i];
			if (max<val) max = val;
		}
		i = pixels.length;
		while (i--) {
			var x = i%w
				,y = i/w<<0;
			var color = Math.pow(pixels[i]/max,gammaValue)*0xFF<<0;
			png.buffer[png.index(x,y)] = png.color(color,color,color);
		}
		src = 'data:image/png;base64,'+png.getBase64();
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

	function countDigits(n){
		var count = 0;
		while (n << 0>0) {
			n /= 10;
			count++;
		}
		return count;
	}

	function array2array(a,b){
		a.forEach(function(n,i){
			b[i] = n;
		});
	}

	return init;
})());