iddqd.ns('attractors.image',(function(){

	var events = attractors.event
		//

	function onRendered(w,h,pixels){
		var resultWrapper = getElementById('tabs-result')
			//
			,colorMax = 255
			,colorBg = getElementById('background-color').value
			,colorBgR = parseInt(colorBg.substr(1,2),16)/colorMax
			,colorBgG = parseInt(colorBg.substr(3,2),16)/colorMax
			,colorBgB = parseInt(colorBg.substr(5,2),16)/colorMax
			//
			,colorAt = getElementById('attractor-color').value
			,colorAtR = parseInt(colorAt.substr(1,2),16)/colorMax
			,colorAtG = parseInt(colorAt.substr(3,2),16)/colorMax
			,colorAtB = parseInt(colorAt.substr(5,2),16)/colorMax
			//
			,imagedataAttractor = new ImageData(w,h)
			,dataAttractor = imagedataAttractor.data
			//
			,max = 0
			,i
		;
		//
		canvasBackground.width = canvasAttractor.width = w;
		canvasBackground.height = canvasAttractor.height = h;
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
				//,r = (1 - (1-colorBgR)*(1-piximaxgam*colorAtR))*colorMax<<0
				//,g = (1 - (1-colorBgG)*(1-piximaxgam*colorAtG))*colorMax<<0
				//,b = (1 - (1-colorBgB)*(1-piximaxgam*colorAtB))*colorMax<<0
				//
				,r = piximaxgam*colorAtR*colorMax<<0
				,g = piximaxgam*colorAtG*colorMax<<0
				,b = piximaxgam*colorAtB*colorMax<<0
				//
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
			//
			dataAttractor[4*i] = r;
			dataAttractor[4*i+1] = g;
			dataAttractor[4*i+2] = b;
			dataAttractor[4*i+3] = 255;
			//
		}
		//
		////
		contextAttractor.putImageData(imagedataAttractor,0,0);
		////
		//var point = {x:100,y:100,size:50};
		var radius = Math.sqrt(w*w+h*h);
		contextBackground.fillStyle = '#000';
		contextBackground.fillRect(0,0,w,h);
		contextBackground.globalCompositeOperation = 'lighter';
		//contextBackground.fillStyle = '#800';//'rgba(0,0,0,0)';//
		contextBackground.shadowColor = colorBg;//'#00FF00';//point.color.hex;
		contextBackground.shadowBlur = radius;
		contextBackground.fillRect(w/2-radius/2,h/2-radius/2,radius,radius);
		//
		contextBackground.globalCompositeOperation = 'screen';
		contextBackground.drawImage(canvasAttractor,0,0);
		//contextBackground.fillRect(w/2-i/2,h/2-i/2,i,i);
		////
		//
		elmImage.setAttribute('src',canvasBackground.toDataURL('image/png'));
		//
		////////////////////////////////////////////////////////////////////////////////////////////////
		//elmImage.parentNode.appendChild(canvasBackground);
		//elmImage.parentNode.appendChild(canvasAttractor);
		////////////////////////////////////////////////////////////////////////////////////////////////
		return canvasBackground.toDataURL('image/webp');
	}

})());