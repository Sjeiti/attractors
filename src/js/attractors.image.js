iddqd.ns('attractors.image',(function(){

	var event = attractors.event
		,util = attractors.util
		,wait = util.wait
		,getMax = util.getMax
		,getMin = util.getMin
		//
		,gammaValue = 0.4
		//
		,canvasBackground = document.createElement('canvas')
		,contextBackground = canvasBackground.getContext('2d')
		//
		,canvasAttractor = document.createElement('canvas')
		,contextAttractor = canvasAttractor.getContext('2d')
		//
		,canvasColor = document.createElement('canvas')
		,contextColor = canvasColor.getContext('2d')
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
		canvasBackground.width = canvasAttractor.width = canvasColor.width = w;
		canvasBackground.height = canvasAttractor.height = canvasColor.height = h;
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

	function draw(w,h,colorAt,colorBg,radial,result){
		var pixels = result[0]
			,distances = result[1]
			,lyapunovs = result[2]
			,surfaces = result[3]
			,hasDistances = distances!==undefined
			,hasLyapunovs = lyapunovs!==undefined
			,hasSurfaces = surfaces!==undefined
			,colorAtO = colorHexSplit(colorAt)
			,colorBgO = colorHexSplit(colorBg)
			,isBgLighter = colorBgO.reduce(function(a,b){return a+b;},0)>colorAtO.reduce(function(a,b){return a+b;},0)
			//
			,imagedataAttractor = new ImageData(w,h)
			,dataAttractor = imagedataAttractor.data
			//
			,imagedataColor = new ImageData(w,h)
			,dataColor = imagedataColor.data
			//
			,max = getMax(pixels)
			,maxD = hasDistances&&getMax(distances)
			,minD = hasDistances&&getMin(distances)
			,maxL = hasLyapunovs&&getMax(lyapunovs)
			,minL = hasLyapunovs&&getMin(lyapunovs)
			,maxC = hasSurfaces&&getMax(surfaces)
			,minC = hasSurfaces&&getMin(surfaces)
			,i = pixels.length
		;
		//
		//console.log('distances',distances); // todo: remove log
		/*distances.forEach(function(val,j){
			if (val===0) distances[j] = maxD;
		});
		minD = getMin(distances);*/
		//
		onImageResize(w,h);
		//
		setBackground(w,h,colorBg,radial);
		//
		//console.log('minmaxD',minD,maxD); // todo: remove log
		//console.log('minmaxL',minL,maxL); // todo: remove log
		//console.log('minmaxC',minC,maxC); // todo: remove log
		//
		while (i--) {
			//dataAttractor[4*i+3] = Math.pow(distances[i]/maxD,gammaValue)*255<<0;
			dataAttractor[4*i+3] = Math.pow(pixels[i]/max,gammaValue)*255<<0;
			//
			if (hasDistances&&hasLyapunovs) {
				var rgb = hslToRgb((distances[i]-minD)/(maxD-minD),(lyapunovs[i]-minL)/(maxL-minL),.5);
				dataColor[4*i+0] = rgb[0];
				dataColor[4*i+1] = rgb[1];
				dataColor[4*i+2] = rgb[2];
			} else if (hasDistances) {
				var rgb = hslToRgb((distances[i]-minD)/(maxD-minD),1,.5);
				dataColor[4*i+0] = rgb[0];
				dataColor[4*i+1] = rgb[1];
				dataColor[4*i+2] = rgb[2];
			} else if (hasLyapunovs) {
				var rgb = hslToRgb((lyapunovs[i]-minL)/(maxL-minL),1,.5);
				dataColor[4*i+0] = rgb[0];
				dataColor[4*i+1] = rgb[1];
				dataColor[4*i+2] = rgb[2];
			}
			//
			//hasDistances&&(dataColor[4*i+0] = 255-(distances[i]-minD)/(maxD-minD)*255<<0);//Math.pow((distances[i]-minD)/(maxD-minD),gammaValue)*255<<0;
			//hasLyapunovs&&(dataColor[4*i+1] = (lyapunovs[i]-minL)/(maxL-minL)*255<<0);//Math.pow((lyapunovs[i]-minL)/(maxL-minL),gammaValue)*255<<0;
			//hasSurfaces&&(dataColor[4*i+2] = 255-(surfaces[i]-minC)/(maxC-minC)*255<<0);
			dataColor[4*i+3] = 255;//Math.pow((lyapunovs[i]-minL)/(maxL-minL),gammaValue)*255<<0;
			//Math.random()<.001&&console.log(pixels[i]/max,distances[i]);
		}
		contextAttractor.putImageData(imagedataAttractor,0,0);
		contextAttractor.globalCompositeOperation = 'source-in';
		contextAttractor.fillStyle = colorAt;
		contextAttractor.fillRect(0,0,w,h);
		//
		//contextColor.putImageData(imagedataColor,0,0);
		////contextColor.globalAlpha  = hasDistances||hasLyapunovs||hasSurfaces?0.5:1;
		////contextColor.globalCompositeOperation = 'screen';
		////contextColor.fillStyle = colorAt;
		////contextColor.fillRect(0,0,w,h);
		//contextAttractor.globalCompositeOperation = 'source-in';
		//contextAttractor.drawImage(canvasColor,0,0);
		//
		//
		// draw attractor onto bg
		contextBackground.globalCompositeOperation = isBgLighter?'multiply':'screen';
		contextBackground.drawImage(canvasAttractor,0,0);
		//
		// draw code onto bg
		setCode(w,contextBackground.getImageData(0,0,1,1).data);
		contextBackground.globalCompositeOperation = 'source-over';
		contextBackground.drawImage(canvasCode,0,0);
		//
		///////////////////////////////////////////////////////
		// calc range
		/*i = 256;
		var red = [], green = [], blue = [];
		while (i--) red[i] = green[i] = blue[i] = 0;
		i = pixels.length;
		while (i--) {
			red[255-(distances[i]-minD)/(maxD-minD)*255<<0]++;
			green[(lyapunovs[i]-minL)/(maxL-minL)*255<<0]++;
			blue[255-(surfaces[i]-minC)/(maxC-minC)*255<<0]++;
		}
		red[0] = green[0] = blue[0] = 0;
		var redMax =Math.max.apply(Math,red), greenMax = Math.max.apply(Math,green), blueMax = Math.max.apply(Math,blue);
		//contextBackground.globalAlpha = 0.5;
		contextBackground.globalCompositeOperation = 'lighter';//'source-over';
		[{color:red,max:redMax,hex:'#FF0000'},{color:green,max:greenMax,hex:'#00FF00'},{color:blue,max:blueMax,hex:'#0000FF'}].forEach(function(o){
			i = 256;
			while (i--) {
				var hh = (o.color[i]/o.max*255)<<0;
				contextBackground.fillStyle = o.hex;
				contextBackground.fillRect(i,256-hh,1,hh);
				//console.log('h',red[i],redMax,hh); // todo: remove log
			}
		});*/
		//console.log('rgb',red.length,green.length,blue.length); // todo: remove log
		//console.log('rgb',redMax,greenMax,blueMax); // todo: remove log
		//console.log('rgb',red,green,blue); // todo: remove log
		///////////////////////////////////////////////////////
		//
		event.IMAGE_DRAWN.dispatch(canvasBackground);
		//
		return canvasBackground.toDataURL('image/webp');
	}

	function setBackground(w,h,colorBg,radial){
		if (radial) {
			var radius = Math.sqrt(w*w+h*h)
				,darken = 0.1
				,color = '#'+[
					parseInt(colorBg.substr(1,2),16)*darken<<0
					,parseInt(colorBg.substr(3,2),16)*darken<<0
					,parseInt(colorBg.substr(5,2),16)*darken<<0
				].map(function(i){
						var s = i.toString(16);
					return (s.length===1?'0':'')+s;
				}).join('')
				,gradient = contextBackground.createRadialGradient(w/2,h/2,radius,w/2,h*0.75,0);
			gradient.addColorStop(0,color);
			gradient.addColorStop(1,colorBg);
			contextBackground.fillStyle = gradient;
			contextBackground.fillRect(0,0,w,h);
		} else {
			contextBackground.fillStyle = colorBg;
			contextBackground.fillRect(0,0,w,h);
		}
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
			var r = (data[i]-baseR)/multiplier
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

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}