/* globals THREE, Detector, iddqd */
iddqd.ns('attractors.three',(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var signal = iddqd.signal
		,event = attractors.event
		,isFinite = Number.isFinite
		,random = Math.random
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
		,particles = 1E5//500000
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
	}

	function initThreejsScene(){
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0x222222, 2000, 3500 );
	}

	function initThreejsCameras(){
		camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.01, 3500 );
		cameraRender = camera.clone();//new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
		setCamera();
	}

	function initThreejsAxis(){
		var size = 1E4;
		axis = new THREE.Group();
		[vecX,vecY,vecZ].forEach(function(v){
			var material = new THREE.LineBasicMaterial({color: 0xffffff})
				,geometry = new THREE.Geometry()
				,vertices = geometry.vertices
				,vec1 = v.clone().setLength(size)
				,vec2 = v.clone().setLength(-size)
				,line;
			vertices.push(vec1);
			vertices.push(vec2);
			line = new THREE.Line(geometry, material);
			axis.add(line);
		});
		scene.add(axis);
	}

	function initThreejsParticles(){
		var len = 3*particles
			,positions = new Float32Array(len)
			,colors = new Float32Array(len)
			,i = len
		;
		while (i-=3) {
			positions[i]   = colors[i]   = 0;
			positions[i+1] = colors[i+1] = 0;
			positions[i+2] = colors[i+2] = 0;
		}
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		geometry.computeBoundingSphere();
		//
		var material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors } );
		var particleSystem = new THREE.Points( geometry, material );
		scene.add( particleSystem );
	}

	function initThreejsRenderer(){
		renderer = new THREE.WebGLRenderer( { antialias: false } );
		renderer.setClearColor( scene.fog.color );
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
		event.REDRAW.add(redraw);
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
			,colorAttr = geometry.attributes.color
			,colors = colorAttr.array
			,color = new THREE.Color()
			,p = new THREE.Vector3(random(),0,0)
			,i = positions.length
			,t = Date.now();
		while (i-=3) {
			iterate(p);
			positions[i]   = point.x;
			positions[i+1] = point.y;
			positions[i+2] = point.z;
			color.setRGB(
				 point.x/n + 0.5
				,point.y/n + 0.5
				,point.z/n + 0.5
			);
			colors[i]   = color.r;
			colors[i+1] = color.g;
			colors[i+2] = color.b;
		}
		console.log('redraw',Date.now()-t); // todo: remove log
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

	/*function onClick(){
		var p = new THREE.Vector3(0,0,0);
		var vector = p.project(camera);
		vector.x = (vector.x + 1) / 2 * window.innerWidth;
		vector.y = -(vector.y - 1) / 2 * window.innerHeight;
		console.log('onClick',vector.x,vector.y); // todo: remove log
	}*/

	function onTypeChanged(){
		attractor = attractors.attractor;
		n = attractor.scale;
		n2 = n/2;
		redraw();
	}

	function render(w,h,iterations){
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
		;
		return new Promise(function(resolve,reject){
			requestAnimationFrame(renderCycle.bind(null,resolve,reject,pixels,w,h,iterations,iterations,batch,p,progressLast,t));
		});
	}

	function renderCycle(resolve,reject,pixels,w,h,iterations,iteration,batch,p,progressLast,t){
		var i = batch
			,progress
			,deltaT
			,now
			,position
		;
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
		progress = iteration/iterations*100<<0;
		if (progressLast!==progress) {
			event.RENDER_PROGRESS.dispatch(progress);
			progressLast = progress;
		}
		//
		now = Date.now();
		deltaT = now-t;
		t = now;
		//console.log('deltaT',deltaT,batch);
		if (deltaT<60) batch *= 2;
		else batch = Math.ceil(batch/2);
		//
		if (iteration>0) requestAnimationFrame(renderCycle.bind(null,resolve,reject,pixels,w,h,iterations,iteration,batch,p,progressLast,t));
		else resolve(pixels);
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

	function center(){
		var positionAttr = geometry.attributes.position
			,positions = positionAttr.array
			,i = Math.min(positions.length,100)
			, xmin = Infinity
			,xmax = -Infinity
			,ymin = Infinity
			,ymax = -Infinity
			,zmin = Infinity
			,zmax = -Infinity
			,vecOffset;
		while (i--) {
			var x = 3*i
				,y = 3*i+1
				,z = 3*i+2;
			if (x<xmin) xmin = x;
			if (x>xmax) xmax = x;
			if (y<ymin) ymin = y;
			if (y>ymax) ymax = y;
			if (z<zmin) zmin = z;
			if (z>zmax) zmax = z;
		}
		vecOffset = cameraCenter.clone();
		cameraCenter.x = -(xmin+xmax)/2;
		cameraCenter.y = -(ymin+ymax)/2;
		cameraCenter.z = -(zmin+zmax)/2;
		//
		vecOffset.sub(cameraCenter);
		camera.position.sub(vecOffset);
		//
		axis.position.x = cameraCenter.x;
		axis.position.y = cameraCenter.y;
		axis.position.z = cameraCenter.z;
	}

	/*function createVector(x, y, z, camera, width, height) {
		var p = new THREE.Vector3(x, y, z);
		var vector = p.project(camera);
		vector.x = (vector.x + 1) / 2 * width;
		vector.y = -(vector.y - 1) / 2 * height;
		return vector;
	}*/

	return {
		init: init
		,render: render
		,redraw: redraw
		,center: center
		,get cameraRotationX() { return cameraRotationX; }
		,set cameraRotationX(f) {
			cameraRotationX = f;
			setCamera();
		}
		//,get instance() { return attractor; }
		//,get constants() { return attractor.constants; }
	};
})());