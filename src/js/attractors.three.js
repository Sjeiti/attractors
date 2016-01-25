/* globals THREE, Detector, iddqd */
iddqd.ns('attractors.three',(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var signal = iddqd.signal
		,event = attractors.event
		,isFinite = Number.isFinite
		,random = Math.random
		,abs = Math.abs
		,attractor = attractors.attractor
		// threejs
		,camera
		,cameraFrameSize = 1
		,cameraRender
		,scene
		,renderer
		,geometry = new THREE.BufferGeometry()
		,cameraCenter = new THREE.Vector3(0,0,0)
		,cameraRotationX = 111
		,cameraRotationY = 111
		,cameraDistance = 2750
		,colorBg = 0x222222
		//
		,elmContainer = document.getElementById('container')
		//
		,vecX = new THREE.Vector3(1,0,0)
		,vecY = new THREE.Vector3(0,1,0)
		,vecZ = new THREE.Vector3(0,0,1)
		//
		,vecMouse = new THREE.Vector3(0,0,0)
		//
		,axis
		//
		,point = new THREE.Vector3(0,0,0)
		,n = 200
		,n2 = n / 2
		//
		,particles = 1E5
		//
		,xmin = Infinity
		,xmax = -Infinity
		,ymin = Infinity
		,ymax = -Infinity
		,zmin = Infinity
		,zmax = -Infinity
		//
		,isRendering = false
		,cancelRenderRequest = false
	;

	function init() {
		initThreejs();
		initEvents();
		resetAttractor();
	}

	function initThreejs(){
		initThreejsScene();
		initThreejsCameras();
		initThreejsAxis();
		initThreejsParticles();
		initThreejsRenderer();
		//
		requestAnimationFrame(center);
		requestAnimationFrame(setCamera);
	}

	function initThreejsScene(){
		scene = new THREE.Scene();
		//scene.fog = new THREE.Fog( colorBg, 2000, 3500 );
	}

	function initThreejsCameras(){
		camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.01, 1E4 );
		cameraRender = camera.clone();//new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
		setCamera();
	}

	function initThreejsAxis(){
		var lineSize = 1E4
			,lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.3})
			,cubeSize = 50
			,cubeGeometry = new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize)
			,cubeFaces = cubeGeometry.faces
			,cubeColors = [0x666666,0x666666,0xAAAAAA,0xAAAAAA,0xFFFFFF,0xFFFFFF]
			,cubeMaterial
			,cube
		;
		axis = new THREE.Group();
		[vecX,vecY,vecZ].forEach(function(v){
			var geometry = new THREE.Geometry()
				,vertices = geometry.vertices
				,vec1 = v.clone().setLength(lineSize)
				,vec2 = v.clone().setLength(-lineSize)
				,line;
			vertices.push(vec1);
			vertices.push(vec2);
			line = new THREE.Line(geometry, lineMaterial);
			axis.add(line);
		});
		//
		cubeColors.forEach(function(color,i){
			cubeFaces[2*i+0].color.setHex(color);
			cubeFaces[2*i+1].color.setHex(color);
		});
		cubeMaterial = new THREE.MeshBasicMaterial({
			transparent: true
			,opacity: 0.3
			,vertexColors: THREE.FaceColors
		});
		cube = new THREE.Mesh(cubeGeometry,cubeMaterial);
		axis.add(cube);
		//
		scene.add(axis);
	}

	function initThreejsParticles(){
		var len = 3*particles
			,positions = new Float32Array(len)
			,colors = new Float32Array(len)
			,i = len
		;
		while (i--) positions[i] = 0;
		//
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		geometry.computeBoundingSphere();
		//
		var material = new THREE.ParticleBasicMaterial({
			//color: 0xFFFFFF,
			size: 16,
			map: THREE.ImageUtils.loadTexture('img/particle.png'),
			vertexColors: THREE.VertexColors,
			blending: THREE.AdditiveBlending,
			transparent: true
		});
		//var material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors } );
		var particleSystem = new THREE.Points( geometry, material );
		particleSystem.sortParticles = true;
		scene.add( particleSystem );
	}

	function initThreejsRenderer(){
		renderer = new THREE.WebGLRenderer({
			antialias: false
			//,alpha: true
		});
		renderer.setClearColor( colorBg );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		elmContainer.appendChild( renderer.domElement );
	}

	function initEvents(){
		elmContainer.addEventListener('mousedown',onMouseDown);
		document.addEventListener('mouseup',onMouseUp);

		signal.key.press.add(onKeyPress);
		signal.mouseWheel.add(onMouseWheel);
		signal.animate.add(onAnimate);
		window.addEventListener( 'resize', onWindowResize, false );
		event.TYPE_CHANGED.add(onTypeChanged);
		event.CONSTANTS_CHANGED.add(redraw);
	}

	function onMouseDown(e){
		document.removeEventListener('mousemove',onMouseMove);
		document.addEventListener('mousemove',onMouseMove);
		onMouseMove(e);
	}

	function onMouseUp(){
		document.removeEventListener('mousemove',onMouseMove);
		vecMouse.z = 0;
	}

	function onMouseMove(e){
		var x = e.pageX
			,y = e.pageY
			,offsetX = x - vecMouse.x
			,offsetY = y - vecMouse.y;
		vecMouse.x = x;
		vecMouse.y = y;
		if (vecMouse.z===0) {
			vecMouse.z = 1;
		} else {
			cameraRotationX += 0.3*offsetX;
			cameraRotationY -= 0.3*offsetY;
			setCamera();
		}
	}

	function onKeyPress(keys){
		var step = 1.1E1
			,pos = camera.position
			,vecCam = cameraCenter.clone().sub(pos)
			,sideVec = vecCam.clone().cross(vecZ)
			,stepVec;
		//console.log('keys',keys); // todo: remove log
		if (keys[87]) stepVec = sideVec.cross(vecCam).setLength(-step); // up
		if (keys[83]) stepVec = sideVec.cross(vecCam).setLength(step); // down
		if (keys[65]) stepVec = sideVec.setLength(step); // left
		if (keys[68]) stepVec = sideVec.setLength(-step); // right
		if (keys[81]) stepVec = vecCam.setLength(step); // forward
		if (keys[69]) stepVec = vecCam.setLength(-step); // backward
		if (keys[90]) camera.setLens(22,cameraFrameSize+=0.1); // forward
		if (keys[67]) camera.setLens(22,cameraFrameSize-=0.1); // backward
		if (stepVec) {
			pos.sub(stepVec);
			cameraCenter.sub(stepVec);
			axis.position.x = cameraCenter.x;
			axis.position.y = cameraCenter.y;
			axis.position.z = cameraCenter.z;
		}
	}

	function onMouseWheel(i){
		cameraDistance -= i/10;
		setCamera();
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onAnimate() {
		renderer.render( scene, camera );
	}

	function resetAttractor(){
		attractor = attractors.attractor;
		redraw();
	}

	function redraw(){
		var positionAttr = geometry.attributes.position
			,positions = positionAttr.array
			,positionsNum = positions.length
			,colorAttr = geometry.attributes.color
			,colors = colorAttr.array
			,p = new THREE.Vector3(random(),0,0)
			,i = 100;
		// dry run
		while (i--) iterate(p);
		// wet run
		resetMinMax();
		i = positionsNum;
		while (i-=3) {
			iterate(p);
			var x = point.x
				,y = point.y
				,z = point.z;
			//if (i>positionsNum-200) findMinMax(x,y,z);
			findMinMax(x,y,z);
			positions[i]   = x;
			positions[i+1] = y;
			positions[i+2] = z;
			//colors[i]   = 1;
			//colors[i+1] = 1;
			//colors[i+2] = 1;
			colors[i]   = 2*abs((x-xmin)/(xmax-xmin)-0.5);
			colors[i+1] = 2*abs((y-ymin)/(ymax-ymin)-0.5);
			colors[i+2] = 2*abs((z-zmin)/(zmax-zmin)-0.5);
			//colors[i]   = (x-xmin)/(xmax-xmin);
			//colors[i+1] = (y-ymin)/(ymax-ymin);
			//colors[i+2] = (z-zmin)/(zmax-zmin);
		}
		positionAttr.needsUpdate = true;
		colorAttr.needsUpdate = true;
	}

	function iterate(p){
		attractor(p);
		if (!isFinite(p.x)) p.x = random();
		if (!isFinite(p.y)) p.y = random();
		if (!isFinite(p.z)) p.z = random();
		point.x = p.x*n - n2;
		point.y = p.y*n - n2;
		point.z = p.z*n - n2;
		return point;
	}

	function setCamera(){
		var radiansX = Math.PI*cameraRotationX/180
			,radiansY = Math.PI*cameraRotationY/180
			,sinX = Math.sin(radiansX)
			,cosX = Math.cos(radiansX)
			,sinY = Math.sin(radiansY)
			,cosY = Math.cos(radiansY);
		camera.position.set(
			cameraDistance*sinY*sinX
			,cameraDistance*sinY*cosX
			,cameraDistance*cosY
		);
		camera.up = new THREE.Vector3(0,0,1);
		camera.lookAt(cameraCenter);
	}

	function onTypeChanged(){
		attractor = attractors.attractor;
		n = attractor.scale;
		n2 = n/2;
		redraw();
	}

	function render(w,h,iterations,frame,frames){
		console.log('three.render',frame,frames); // todo: remove log
		isRendering = true;
		cameraRender = camera.clone();
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

	function resetMinMax(){
		xmin = Infinity;
		xmax = -Infinity;
		ymin = Infinity;
		ymax = -Infinity;
		zmin = Infinity;
		zmax = -Infinity;
	}

	function findMinMax(x,y,z){
		if (x<xmin) xmin = x;
		if (x>xmax) xmax = x;
		if (y<ymin) ymin = y;
		if (y>ymax) ymax = y;
		if (z<zmin) zmin = z;
		if (z>zmax) zmax = z;
	}

	function center(){
		var vecOffset = cameraCenter.clone();
		//
		cameraCenter.x = (xmin+xmax)/2;
		cameraCenter.y = (ymin+ymax)/2;
		cameraCenter.z = (zmin+zmax)/2;
		//
		vecOffset.sub(cameraCenter);
		camera.position.sub(vecOffset);
		//
		axis.position.x = cameraCenter.x;
		axis.position.y = cameraCenter.y;
		axis.position.z = cameraCenter.z;
	}

	return {
		init: init
		,render: render
		,cancelRender: cancelRender
		//,redraw: redraw
		,center: center
		,get rendering() { return isRendering; }
		,get cameraRotationX() { return cameraRotationX; }
		,set cameraRotationX(f) {
			cameraRotationX = f;
			setCamera();
		}
		,get computeBoundingSphere() { return geometry.computeBoundingSphere.bind(geometry); }
	};
})());