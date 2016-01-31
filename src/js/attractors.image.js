iddqd.ns('attractors.image',(function(){

	var event = attractors.event
		,util = attractors.util
		,wait = util.wait
		//
		,gammaValue = 0.4
		//
		,canvasBackground = document.createElement('canvas')
		,contextBackground = canvasBackground.getContext('2d')
		//
		,canvasAttractor = document.createElement('canvas')
		,contextAttractor = canvasAttractor.getContext('2d')
		//
		,canvasCode = document.createElement('canvas')
		,contextCode = canvasCode.getContext('2d')
		//
		,chars = 'abcdefghijklmnopqrstuvwxyz 01234567890-,.'.split('')
	;

	event.IMAGE_RESIZE.add(onImageResize);
	event.IMAGE_GAMMA_CHANGED.add(onImageGammaChanged);
	event.ANIMATION_DONE.add(onAnimationFinished);

	function onImageResize(w,h){
		canvasBackground.width = canvasAttractor.width = w;
		canvasBackground.height = canvasAttractor.height = h;
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
					event.ANIMATION_DRAWN.dispatch(image);
				}
			});
		});
		//
		var encoder = new Whammy.Video();//25
		frames.forEach(encoder.add.bind(encoder));
		encoder.compile(false,event.ANIMATION_DRAWN_WEBM.dispatch);
	}

	function onImageGammaChanged(f){
		gammaValue = f;
	}

	function colorHexSplit(hex){
		return [
			parseInt(hex.substr(1,2),16)/255
			,parseInt(hex.substr(3,2),16)/255
			,parseInt(hex.substr(5,2),16)/255
		];
	}

	function draw(w,h,colorAt,colorBg,pixels){
		var colorAtO = colorHexSplit(colorAt)
			//
			,imagedataAttractor = new ImageData(w,h)
			,dataAttractor = imagedataAttractor.data
			//
			,max = 0
			,i
		;
		canvasBackground.width = canvasAttractor.width = w;
		canvasBackground.height = canvasAttractor.height = h;
		//
		setBackground(w,h,colorBg);
		setCode(w,contextBackground.getImageData(0,0,1,1).data);
		//
		i = pixels.length;
		while (i--) {
			var val = pixels[i];
			if (max<val) max = val;
		}
		//
		i = pixels.length;
		while (i--) {
			var piximaxgam = Math.pow(pixels[i]/max,gammaValue)
			// screen
			//,r = (1 - (1-colorBgR)*(1-piximaxgam*colorAtR))*colorMax<<0
			//,g = (1 - (1-colorBgG)*(1-piximaxgam*colorAtG))*colorMax<<0
			//,b = (1 - (1-colorBgB)*(1-piximaxgam*colorAtB))*colorMax<<0
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
			//
			dataAttractor[4*i]   = piximaxgam*colorAtO[0]*255<<0;
			dataAttractor[4*i+1] = piximaxgam*colorAtO[1]*255<<0;
			dataAttractor[4*i+2] = piximaxgam*colorAtO[2]*255<<0;
			dataAttractor[4*i+3] = 255;
		}
		contextAttractor.putImageData(imagedataAttractor,0,0);
		contextBackground.drawImage(canvasAttractor,0,0);
		contextBackground.globalCompositeOperation = 'source-over';
		contextBackground.drawImage(canvasCode,0,0);
		event.IMAGE_DRAWN.dispatch(canvasBackground);
		//
		return canvasBackground.toDataURL('image/webp');
	}

	function setBackground(w,h,colorBg){
		var radius = Math.sqrt(w*w+h*h);
		contextBackground.fillStyle = '#000';
		contextBackground.fillRect(0,0,w,h);
		contextBackground.globalCompositeOperation = 'lighter';
		contextBackground.shadowColor = colorBg;
		contextBackground.shadowBlur = radius;
		contextBackground.fillRect(w/2-radius/2,h/2-radius/2,radius,radius);
		contextBackground.globalCompositeOperation = 'screen';
	}

	function setCode(w,colorBg){
		var delimiter = chars[0]+chars[0]
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
			,octNum = oct.length
			,imgH = Math.ceil(octNum/w)
			,i = octNum
			,imagedataCode = new ImageData(w,imgH)
			,dataCode = imagedataCode.data
		;
		canvasCode.width = w;
		canvasCode.height = imgH;
		//
		while (i--) {
			var multiplier = 4
				,margin = 8*multiplier
				,colorBgR = colorBg[0]/255
				,colorBgG = colorBg[1]/255
				,colorBgB = colorBg[2]/255
				,subtract = 85*(colorBgR+colorBgG+colorBgB)>(255-margin)?-margin:0
				,code = multiplier*oct[i]
			;
			dataCode[4*i]   = (colorBgR*255<<0) + code + subtract;
			dataCode[4*i+1] = (colorBgG*255<<0) + code + subtract;
			dataCode[4*i+2] = (colorBgB*255<<0) + code + subtract;
			dataCode[4*i+3] = 255;
		}
		contextCode.putImageData(imagedataCode,0,0);
		return oct;
	}

	function read(image){
		var canvas = document.createElement('canvas')
			,context = canvas.getContext('2d')
			,w = image.naturalWidth||image.width
			,h = image.naturalHeight||image.height
			,imageData = (function(){
				event.IMAGE_RESIZE.dispatch(w,h);
				canvas.width = w;
				canvas.height = h;
				context.drawImage(image,0,0);
				return context.getImageData(0,0,w,h);
			})()
			,data = imageData.data
			,baseR = data[0]
			,baseG = data[1]
			,baseB = data[2]
			,multiplier = 4
			,result = []
			,fourzero = 0
			//
			,doubled
			,constants;
		for (var i=0,l=data.length;i<l;i+=4) {
			var r = (data[i+0]-baseR)/multiplier
				,g = (data[i+1]-baseG)/multiplier
				,b = (data[i+2]-baseB)/multiplier
				,rgb = Math.round((r+g+b)/3);
			result.push(rgb);
			fourzero = rgb===0&&i>4?fourzero+1:0;
			if (fourzero===4) break;
		}
		doubled = result.join('').match(/.{1,2}/g).map(function(s){
			var n = parseInt(s,8);
			return chars[n%chars.length];
		}).join('');
		constants = doubled.substr(2,doubled.length-4).split(',');
		return {
			name: constants.shift()
			,constants: constants.map(function(s){return parseFloat(s);})
		};
	}

	return {
		draw: draw
		,read: read
	};
})());