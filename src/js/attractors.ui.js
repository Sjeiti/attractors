/* globals iddqd, attractor */
iddqd.ns('attractors.ui',(function(){
	var getElementById = document.getElementById.bind(document)
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
		signal.animate.add(onAnimate);
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
		initUIType();
		initUIConstants();
		initUIButtons();
	}
	function initUIType(){
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
	}
	function initUIConstants(){
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
	}
	function initUIButtons(){
		getElementById('constantsRandomize').addEventListener('click',onRandomizeClick);
		getElementById('constantsReset').addEventListener('click',onResetClick);
		getElementById('render').addEventListener('click',onRenderClick);
		event.RENDER_PROGRESS.add(onRenderProgress);
		getElementById('image').querySelector('.btn').addEventListener('click',onImageHide);
	}

	function onRenderProgress(progress){
		var render = getElementById('render')
			,indicator = render.querySelector('.progress');
		indicator.style.width = progress+'%';
	}

	function stopPropagation(e){
		console.log('e.target.nodeName',e.target.nodeName); // todo: remove log
		e.target.nodeName==='INPUT'&&e.stopPropagation();
	}

	function initStats(){
			stats = new Stats();
			getElementById('stats').appendChild( stats.domElement );
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
				asdf = onAnimateConstant.bind(null,input);
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

	function onAnimateConstant(input) {
		var index = parseInt(input.getAttribute('data-index'),10)
			,value = input.value
			,constants = attractor.constants
			,constant = constants[index]
		;
		getElementById('constant'+index).value = constants[index] = constant + value*value*value*value*value*value*value;
		redraw();
	}

	function onAnimate() {
		stats.update();
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
		var w = 640
			,h = 480
			,iterations = 1E7
		;
		attractors.three.render(w,h,iterations)
			.then(onRendered.bind(null,w,h),console.warn.bind(console));
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
			,w = 640;
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
		img.setAttribute('src','data:image/png;base64,'+png.getBase64());
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