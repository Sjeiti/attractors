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
		,CONSTANTS_CHANGED = event.CONSTANTS_CHANGED
		,dispatchConstantsChanged = CONSTANTS_CHANGED.dispatch
		,center = three.center
		//,warn = console.warn.bind(console)
		//
		,moveConstant
		//
		,elmConstants = getElementById('constants')
		,elmSines = getElementById('sines')
		,elmOffsets = getElementById('offsets')
		,elmRender = getElementById('render')
		,elmRenderIndicator = elmRender.querySelector('.progress')
		,elmImage = getElementById('image').querySelector('img')
		,elmVideo = document.createElement('video')
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
		event.TYPE_CHANGED.add(onTypeChanged);
		// constants
		redrawConstants();
		[elmConstants,elmSines,elmOffsets].forEach(function(elm){
			elm.addEventListener('mousedown',onInputChange);
			elm.addEventListener('change',onInputChange);
			elm.addEventListener('mousewheel',onInputChange);
		});
		// buttons
		getElementById('constantsRandomize').addEventListener('click',onRandomizeClick);
		getElementById('constantsReset').addEventListener('click',onResetClick);
		getElementById('centerAxis').addEventListener('click',center);
	}

	function initUIAnimate(){
		getElementById('store-first').addEventListener('click',function(){
			array2array(attractor.constants,animate.constantsFirst);
		});
		getElementById('load-first').addEventListener('click',function(){
			dispatchConstantsChanged(array2array(animate.constantsFirst,attractor.constants));
			updateContantsInputs();
		});
		getElementById('store-last').addEventListener('click',function(){
			array2array(attractor.constants,animate.constantsLast);
		});
		getElementById('load-last').addEventListener('click',function(){
			dispatchConstantsChanged(array2array(animate.constantsLast,attractor.constants));
			updateContantsInputs();
		});
		//
		getElementById('set-sines').addEventListener('click',function(){
			//animate.constantsFirst
			//animate.constantsLast
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
			//console.log('',animate.constantsLast.length); // todo: remove log
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
		//////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		var image = document.createElement('img');
		var chars = 'abcdefghijklmnopqrstuvwxyz 01234567890-,.'.split('');

		var input = document.createElement('input');
		input.setAttribute('type','file');
		elmResult.appendChild(input);

		image.addEventListener('load',onImageLoad);
		input.addEventListener('change', onFilesChange, false);

		function onFilesChange(evt) {
			var files = evt.target.files;
			for (var i = 0, f; f = files[i]; i++) {
				if (f.type.match('image.*')) {
					var reader = new FileReader();
					reader.addEventListener('load',onReaderLoad.bind(reader,f));
					reader.readAsDataURL(f);
				}
			}
		}

		function onReaderLoad(theFile,e){
			var loader = e.target;
			var loadResult = loader.result;
			image.setAttribute('src',loadResult);
		}

		function onImageLoad(e){
			var w = image.naturalWidth||image.width;
			var h = image.naturalHeight||image.height;
			canvas.width = w;
			canvas.height = h;
			context.drawImage(image,0,0);
			var imageData = context.getImageData(0,0,w,h);
			var data = imageData.data;
			var baseR = data[0];
			var baseG = data[1];
			var baseB = data[2];
			var multiplier = 4;
			var result = [];
			var fourzero = 0;
			for (var i=0,l=data.length;i<l;i+=4) {
				var r = (data[i+0]-baseR)/multiplier;
				var g = (data[i+1]-baseG)/multiplier;
				var b = (data[i+2]-baseB)/multiplier;
				var rgb = Math.round((r+g+b)/3);
				result.push(rgb);
				fourzero = rgb===0&&i>4?fourzero+1:0;
				if (fourzero===4) break;
			}
			var doubled = result.join('').match(/.{1,2}/g).map(function(s){
				var n = parseInt(s,8);
				return chars[n%chars.length];
			}).join('');
			var constants = doubled.substr(2,doubled.length-4).split(',');
			//var name = constants.shift(); // todo: name
			constants = constants.map(function(s){return parseFloat(s);});
			//console.log('attractor',name,constants.map(function(s){return parseFloat(s);}));

			//event.TYPE_CHANGED.dispatch();
			dispatchConstantsChanged(array2array(constants,attractor.constants));
		}

		//////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////
		//
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

	function onTypeChanged(index){
		var select = getElementById('type');
		select.value = index;
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
			,dispatch = isModelConstants?dispatchConstantsChanged:null
		;
		if (type==='number') {
			e.stopPropagation();
			model[index] = parseFloat(input.value);
			dispatch&&dispatch(model);
		} else if (type==='range') {
			if (event==='mousedown') {
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

	function onRandomizeClick(){
		var iterations = 20
			,p = new THREE.Vector3(Math.random(),Math.random(),Math.random())
			,pp
			,size = 1E-3
			,tries = 1E4
			,constants = attractor.constants
			,maxConstant = 2*attractor.constantSize
			,i;
		while (tries--&&(size<0.02||isNaN(size)||!isFinite(size))) {
			constants.forEach(function(val,j,a){
				getElementById('constants'+j).value = a[j] = maxConstant*(Math.random()-0.5);
			});
			i = iterations;
			while (i--) {
				attractor(p);
				if (i===1) pp = p.clone();
			}
			size = p.distanceTo(pp);
		}
		dispatchConstantsChanged(constants);
		center();
	}

	function onResetClick(){
		var constants = attractor.constants;
		constants.reset();
		updateContantsInputs();
		dispatchConstantsChanged(constants);
		center();
	}

	function onAnimateClick(){
		var anim = getAnimationFromTo()
			,from = {f:0}
			,onUpdate = function(position){
				setFrame(position.f,1,anim.start,anim.end);
				dispatchConstantsChanged(attractor.constants);
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
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		var chars = 'abcdefghijklmnopqrstuvwxyz 01234567890-,.'.split('')
			,delimiter = chars[0]+chars[0]
			,decodeList = (delimiter+decodeURIComponent(location.hash).substr(1).toLowerCase()+delimiter).split('')
			,intResult = (function(a){
				decodeList.forEach(function(char){
					a.push(chars.indexOf(char));
				});
				return a;
			})([])
			,pad2 = '00'
			,oct = intResult.map(function(i){
				var bin = i.toString(8);
				return pad2.substring(0, pad2.length - bin.length) + bin;
			}).join('').split('').map(function(s){
				return parseInt(s,10);
			})
			;

		/*console.log('intResult'
			,decodeList
			,oct//.join('').match(/.{1,12}/g).join('\n')
		);*/
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		i = pixels.length;
		while (i--) {
			var piximaxgam = Math.pow(pixels[i]/max,gammaValue)
				//
				////
				////
				////
				//
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
				//
			;

			////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////
			if (i<=oct.length) {
				var multiplier = 4
					,margin = 8*multiplier
					,subtract = 85*(colorBgR+colorBgG+colorBgB)>(255-margin)?-margin:0
					,code = multiplier*oct[i];
				r = (colorBgR*255<<0) + code + subtract;
				g = (colorBgG*255<<0) + code + subtract;
				b = (colorBgB*255<<0) + code + subtract;
			}
			////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////
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
		return elmConstants;
	}

	function getAnimationFromTo(){
		return animate.getFromTo(
			parseInt(getElementById('frames').value,10)
			,getElementById('animate-rotate').checked
		);
	}

	return init;
})());