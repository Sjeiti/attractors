iddqd.ns('attractors.animate',(function() {

	var three = attractors.three
		,frames = [];

	requestAnimationFrame(animate);
	function animate(time) {
			requestAnimationFrame(animate);
			TWEEN.update(time);
	}

	function start(){
		frames.length = 0;
	}

	function setFrame(frame,frames,propstart,propend) {
		var part = frame/frames;
		for (var key in propstart) {
			var valStart = propstart[key]
				,valEnd = propend[key]
				,valCurrent = valStart + part*(valEnd-valStart);
			if (key==='cameraRotationX') three.cameraRotationX = valCurrent;
		}
	}

	function storeFrame(src){
		frames.push(src);
	}

	function end(w,h){
		/*var ag = new Animated_GIF({
			workerPath: '/vendor/Animated_GIF/dist/Animated_GIF.worker.js'
		});
		ag.setSize(w,h);
		frames.forEach(function(src){
			var img = document.createElement('img');
			img.setAttribute('src',src);
			ag.addFrame(img);
		});
		ag.getBase64GIF(function(image) {
			document.getElementById('image').querySelector('img').setAttribute('src',image);
		});*/
		/////////////////////////////////////////////
		gifshot.createGIF({
			gifWidth: w,gifHeight: h,images: (function (a) {
				frames.forEach(function (src) {
					var img = document.createElement('img');
					img.setAttribute('src',src);
					a.push(img);
				});
				return a;
			})([]),interval: 0.04
		},function (obj) {
			if (!obj.error) {
				var image = obj.image;
				document.getElementById('image').querySelector('img').setAttribute('src',image);
			}
		});
	}

	return {
		start: start
		,setFrame: setFrame
		,storeFrame: storeFrame
		,end: end
	};
})());