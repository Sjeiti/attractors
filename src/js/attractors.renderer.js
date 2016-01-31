iddqd.ns('attractors.renderer',(function(){
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

	function render(w,h,iterations,frame,frames){
		console.log('three.render',frame,frames); // todo: remove log
		isRendering = true;
		cameraRender = three.getCameraClone();
		cameraRender.aspect = w/h;
		/*cameraRender.position.set(
			camera.position.x
			,camera.position.y
			,camera.position.z
		);
		//cameraRender.up = new THREE.Vector3(0,0,1);
		//cameraRender.lookAt(cameraCenter);
		cameraRender.rotation.set(
			camera.rotation.x
			,camera.rotation.y
			,camera.rotation.z
		);*/
		cameraRender.updateProjectionMatrix();
		var pixels = (function(a,i){
				while (i--) a[i] = 0;
				return a;
			})([],w*h)
			,p = new THREE.Vector3(random(),0,0)
			,batch = Math.pow(2,14)
			,progressLast = 0
			,t = Date.now()
			,i = 100
		;
		while (i--) iterate(p);
		return new Promise(function(resolve,reject){
			requestAnimationFrame(renderCycle.bind(null,resolve,reject,pixels,w,h,iterations,iterations,batch,p,progressLast,t,t,frame,frames));
		});
	}

	function renderCycle(resolve,reject,pixels,w,h,iterations,iteration,batch,p,progressLast,t,start,frame,frames){
		var i = batch
			,progress
			,deltaT
			,now
			,position
		;
		if (cancelRenderRequest) {
			cancelRenderRequest = false;
			isRendering = false;
			event.RENDER_CANCELED.dispatch();
		} else {
			while (i--) {
				iterate(p);
				position = point.project(cameraRender);
				// todo: implement getColor here
				distribute(
					pixels
					, (position.x + 1)/2*w
					,-(position.y - 1)/2*h
					,w
					,h
				);
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
				requestAnimationFrame(renderCycle.bind(null,resolve,reject,pixels,w,h,iterations,iteration,batch,p,progressLast,t,start,frame,frames));
			} else {
				resolve(pixels);
				isRendering = false;
				//event.RENDER_DONE.dispatch();
			}
		}
	}

	function cancelRender(){
		console.log('three.cancelRender'); // todo: remove log
		cancelRenderRequest = true;
	}

	function distribute(a,x,y,w,h){
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
		//if (floorY<h/2) {
		//	// normally
		//	if (floorX>=0 && floorX<w && floorY>=0 && floorY<h) pixels[pos00] += 1;
		//} else {
		// aliasing
		/*if (floorX>=0&&floorX<w&&floorY>=0&&floorY<h) pixels[pos00] += fx0*fy0;
		if (floorX>0&&floorX<=w&&floorY>=0&&floorY<h) pixels[pos10] += fx1*fy0;
		if (floorX>=0&&floorX<w&&floorY>0&&floorY<=h) pixels[pos01] += fx0*fy1;
		if (floorX>0&&floorX<=w&&floorY>0&&floorY<=h) pixels[pos11] += fx1*fy1;*/
		if (floorX>=0&&floorX<(w-1)&&floorY>=0&&floorY<(h-1)) {
			a[pos00] += fx0*fy0;
			a[pos10] += fx1*fy0;
			a[pos01] += fx0*fy1;
			a[pos11] += fx1*fy1;
		}
	}

	return {
		render: render
		,cancelRender: cancelRender
		,get rendering() { return isRendering; }
	};
})());