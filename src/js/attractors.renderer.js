iddqd.ns('attractors.renderer',(function(undefined){
	var three = attractors.three
		,iterate = three.iterate
		,point = three.point//new THREE.Vector3(0,0,0)
		//,animate = attractors.animate
		,event = attractors.event
		,random = Math.random
		//
		,cameraRender
		//
		//
		,isRendering = false
		,cancelRenderRequest = false
	;

	function render(w,h,iterations,calcDistance,calcLyapunov,calcSurface,frame,frames){
		console.log('three.render',w,h,iterations,frame,frames); // todo: remove log
		isRendering = true;
		cameraRender = three.getCameraClone();
		cameraRender.aspect = w/h;
		cameraRender.updateProjectionMatrix();
		var numPixels = w*h
			,pixels = (function(a,i){
					while (i--) a[i] = 0;
					return a;
				})([],numPixels)
			,distances = calcDistance?new Array(numPixels):undefined
			,lyapunovs = calcLyapunov?new Array(numPixels):undefined
			,surfaces = calcSurface?new Array(numPixels):undefined
			,p = new THREE.Vector3(random(),0,0)
			,pLast = new THREE.Vector3(random(),0,0)
			,pLyapunov = new THREE.Vector3(random(),0,0)
			,batch = Math.pow(2,14)
			,progressLast = 0
			,t = Date.now()
			,i = 100
		;
		while (i--) iterate(p);
		return new Promise(function(resolve,reject){
			requestAnimationFrame(renderCycle.bind(null,resolve,reject,pixels,distances,lyapunovs,surfaces,w,h,iterations,iterations,batch,p,pLast,pLyapunov,progressLast,t,t,frame,frames));
		});
	}

	function renderCycle(resolve,reject,pixels,distances,lyapunovs,surfaces,w,h,iterations,iteration,batch,p,pLast,pLyapunov,progressLast,t,start,frame,frames){
		var i = batch
			,progress
			,deltaT
			,now
			,position
			,cameraPosition = cameraRender.position
			,x
			,y
			,hasDistances = distances!==undefined
			,hasLyapunovs = lyapunovs!==undefined
			,hasSurfaces = surfaces!==undefined
		;
		if (cancelRenderRequest===true) {
			cancelRenderRequest = false;
			isRendering = false;
			event.RENDER_CANCELED.dispatch();
		} else {
			while (i--) {
				if (lyapunovs!==undefined) {
					pLyapunov.x = p.x + 0.00001;
					pLyapunov.y = p.y + 0.00001;
					pLyapunov.z = p.z + 0.00001;
					iterate(pLyapunov);
				}
				//
				iterate(p);
				position = point.project(cameraRender);
				x =  (position.x + 1)/2*w;
				y = -(position.y - 1)/2*h;
				//
				// todo: implement getColor here

				//
				distribute(pixels,x,y,w,h,1);
				//
				// iteration distance, lyapunov exponent, camera distance
				hasDistances&&distribute(distances,x,y,w,h,p.distanceTo(pLast));
				hasLyapunovs&&distribute(lyapunovs,x,y,w,h,p.distanceTo(pLyapunov));
				if (hasSurfaces) {
					var index = (x<<0) + (y<<0)*w
						,depthsNew = p.distanceTo(cameraPosition)
						,depthsOld = surfaces[index];
					(depthsOld===undefined||depthsOld>depthsNew)&&(surfaces[index]=depthsNew);
				}
				//
				pLast.x = p.x;
				pLast.y = p.y;
				pLast.z = p.z;
			}
			iteration -= batch;
			//
			progress = 100-(iteration/iterations*100<<0);
			if (progressLast!==progress) {
				event.RENDER_PROGRESS.dispatch(progress,start,frame,frames);
				progressLast = progress;
			}
			//
			now = Date.now();
			deltaT = now-t;
			t = now;
			//console.log('deltaT',deltaT,batch);
			if (deltaT<60) batch *= 2;
			else batch = Math.ceil(batch/2);
			if (iteration>0) {
				requestAnimationFrame(renderCycle.bind(null,resolve,reject,pixels,distances,lyapunovs,surfaces,w,h,iterations,iteration,batch,p,pLast,pLyapunov,progressLast,t,start,frame,frames));
			} else {
				//console.log('pixels,distances',pixels,distances); // todo: remove log
				if (hasDistances||hasLyapunovs) {
					i = w*h;
					while (i--) {
						var pixel = pixels[i];
						if (pixel!==0) {
							hasDistances&&(distances[i] /= pixel);
							hasLyapunovs&&(lyapunovs[i] /= pixel);
							//depths[i] /= pixel;
						}
					}
				}
				resolve([pixels,distances,lyapunovs,surfaces]);
				isRendering = false;
				//event.RENDER_DONE.dispatch();
			}
		}
	}

	function cancelRender(){
		console.log('three.cancelRender'); // todo: remove log
		cancelRenderRequest = true;
	}

	function distribute(a,x,y,w,h,weight){
		var floorX = x<<0
			,floorY = y<<0
			// 4x4 grid distribution
			,fx1 = x - floorX
			,fy1 = y - floorY
			,fx0 = 1 - fx1
			,fy0 = 1 - fy1
			// 4x4 grid positions
			,pos00 = floorX + floorY*w
			,pos10 = pos00 + 1
			,pos01 = pos00 + w
			,pos11 = pos01 + 1
		;
		if (floorX>=0&&floorX<(w-1)&&floorY>=0&&floorY<(h-1)) {
			a[pos00] = (a[pos00]||0) + weight*fx0*fy0;
			a[pos10] = (a[pos10]||0) + weight*fx1*fy0;
			a[pos01] = (a[pos01]||0) + weight*fx0*fy1;
			a[pos11] = (a[pos11]||0) + weight*fx1*fy1;
		}
	}

	return {
		render: render
		,cancelRender: cancelRender
		,get rendering() { return isRendering; }
	};
})());