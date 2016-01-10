/* globals iddqd, attractor */
iddqd.ns('attractors.ui',(function(){
	var warn = console.warn.bind(console)
		,three = attractors.three
		,animate = attractors.animate
		,setFrame = animate.setFrame
		,getElementById = document.getElementById.bind(document)
		,signal = iddqd.signal
		,event = attractors.event
		,REDRAW = event.REDRAW
		,redraw = REDRAW.dispatch.bind(REDRAW)//attractors.three.redraw//
		//,xhttp = iddqd.pattern.callbackToPromise(iddqd.network.xhttp)
		,stats
		,attractor
		,constantInputs = []
	;

	function init() {
		attractor = attractors.attractor;
		initVariables();
		initUI();
		initStats();
	}

	function initVariables(){
	}

	/*function tmpl(id){
		return new Promise(function(resolve,reject){
			iddqd.utils.tmpl('constant',function(){
				console.log('foo',arguments); // todo: remove log
				resolve();
			});
		});
	}*/

	function initUI(){
		initUIAttractor();
		initUIAnimate();
		initUIRender();
		initUIImage();
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
		var wrapper = getElementById('constants')
			,html = '';
		attractor.constants.forEach(function(val,i){
			html += iddqd.utils.tmpl('constant',{value:val,index:i});
		});
		wrapper.innerHTML = html;
		//wrapper.addEventListener('mousedown',stopPropagation);
		wrapper.addEventListener('mousedown',onInputChange);
		//wrapper.addEventListener('drag',onInputChange);
		wrapper.addEventListener('change',onInputChange);
		wrapper.addEventListener('mousewheel',onInputChange);
		//signal.drag.add(onDrag);
		// buttons
		getElementById('constantsRandomize').addEventListener('click',onRandomizeClick);
		getElementById('constantsReset').addEventListener('click',onResetClick);
	}
	function initUIRender(){
		getElementById('render').addEventListener('click',onRenderClick);
		event.RENDER_PROGRESS.add(onRenderProgress);
	}
	function initUIImage(){
		getElementById('image').querySelector('.btn').addEventListener('click',onImageHide);
	}

	function initUIAnimate(){
		getElementById('animate').querySelector('.animate').addEventListener('click',function(){
			var position = { x: three.cameraRotationX }
				,onUpdate = function(position){
					three.cameraRotationX = position.x;
				}.bind(null,position);
			new TWEEN.Tween(position)
				.to({x:position.x+360}, 2000)
				.onUpdate(onUpdate)
				.start();
		});
		//signal.animate.add(TWEEN.update.bind(TWEEN));
	}

	function onRenderProgress(progress){
		var render = getElementById('render')
			,indicator = render.querySelector('.progress');
		indicator.style.width = 100-progress+'%';
	}

	function stopPropagation(e){
		console.log('e.target.nodeName',e.target.nodeName); // todo: remove log
		e.target.nodeName==='INPUT'&&e.stopPropagation();
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
			,isKeyShift = signal.key[16]
			,isKeyCTRL = signal.key[17]
			,isKeyAlt = signal.key[18];
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
				getElementById('constant'+j).value = a[j] = 24*(Math.random()-.5);
			});
			i = iterations;
			while (i--) {
				attractor(p);
				if (i===1) pp = p.clone();
			}
			size = p.distanceTo(pp);
			//console.log('pp',size); // todo: remove log
			//console.log('isNaN(size)',isNaN(size)); // todo: remove log
			//console.log('isFinite(size)',isFinite(size)); // todo: remove log
			//console.log('tries--&&(size<0.02||isNaN(size)||!isFinite(size))',tries--&&(size<0.02||isNaN(size)||!isFinite(size))); // todo: remove log
			//if (tries<0) break;
		}
		redraw();
	}

	function onResetClick(e){
		attractor.constants.reset();
		attractor.constants.forEach(function(val,i,a){
			getElementById('constant'+i).value = a[i];
		});
		redraw();
	}

	function onRenderClick(e){
		var size = (function(s){
				return s.split('-').map(function(s){
					return parseInt(s,10);
				});
			})(getElementById('image-size').value)
			,w = size[0]
			,h = size[1]
			,iterations = 1E6
			,frames = 25
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
						//.then(console.log.bind(console,'step frame',frames-i))
						.then(setFrame.bind(null,frames-i,frames,propstart,propend))
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

	function onRendered(w,h,pixels){
		var png = new PNGlib(w,h,256)
			,imageWrapper = getElementById('image')
			,img = imageWrapper.querySelector('img')||(function(img){
				img.classList.add('image');
				imageWrapper.appendChild(img);
				return img;
			})(document.createElement('img'))
			,max = 0
			,i
			,src;
		imageWrapper.classList.remove('hidden-xs-up');
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
			var color = Math.pow(pixels[i]/max,0.3)*0xFF<<0;
			png.buffer[png.index(x,y)] = png.color(color,color,color);
		}
		src = 'data:image/png;base64,'+png.getBase64();
		img.setAttribute('src',src);
		return src;
	}

	function onImageHide(){
		console.log('onImageHide',getElementById('image').classList); // todo: remove log
		getElementById('image').classList.add('hidden-xs-up');
	}

	function redrawConstants(){
		var wrapper = getElementById('constants')
			,html = '';
		attractor.constants.forEach(function(val,i){
			html += iddqd.utils.tmpl('constant',{value:val,index:i});
		});
		wrapper.innerHTML = html;
		return wrapper;
	}

	return init;
})());