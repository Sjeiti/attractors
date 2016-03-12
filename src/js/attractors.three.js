/* globals THREE, Detector, iddqd, TouchEvent */
iddqd.ns('attractors.three',(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var signal = iddqd.signal
		,event = attractors.event
		//
		,isFinite = Number.isFinite
		//
		,random = attractors.util.random
		,rndSize = 5
		//
		,abs = Math.abs
		,attractor = attractors.attractor
		,addDragEvent = attractors.util.addDragEvent
		//
		// threejs
		,camera
		,cameraFrameSize = 1
		,scene
		,renderer
		,geometry = new THREE.BufferGeometry()
		//
		,cameraCenter = new THREE.Vector3(0,0,0)
		,cameraRotationX = 111
		,cameraRotationY = 70
		,cameraDistance = 2750 // todo: change for model
		//
		,colorBg = 0x222222
		//
		,elmContainer = document.getElementById('container')
		//
		,vecX = new THREE.Vector3(1,0,0)
		,vecY = new THREE.Vector3(0,1,0)
		,vecZ = new THREE.Vector3(0,0,1)
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
		,colorFg
		,isColorStatic = false
	;

	function init() {
		initThreejs();
		initEvents();
		onTypeChanged();
		onWindowResize();
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
		camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.01, 1E4 );
		camera.up = new THREE.Vector3(0,0,1);
		//camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.01, 1E4 );
		//cameraRender = camera.clone();//new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
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
			//
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
		isMinMaxFinite()&&geometry.computeBoundingSphere();
		//
		var textureLoader = new THREE.TextureLoader()
			,material = new THREE.PointsMaterial({
				//color: 0xFFFFFF,
				size: 16,
				map: textureLoader.load('img/particle.png'),
				vertexColors: THREE.VertexColors,
				blending: THREE.AdditiveBlending,
				transparent: true
			})
		;
		//var material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors } );
		var particleSystem = new THREE.Points( geometry, material );
		particleSystem.sortParticles = true;
		scene.add( particleSystem );
		//
		event.COLOR_STATIC_CHANGED.add(function(checked){
			isColorStatic = checked;
			redraw();
		});
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
		addDragEvent(elmContainer,drag);
		signal.key.press.add(onKeyPress);
		signal.mouseWheel.add(onMouseWheel);
		signal.animate.add(onAnimate);
		window.addEventListener( 'resize', onWindowResize, false );
		event.TYPE_CHANGED.add(onTypeChanged);
		event.CONSTANTS_CHANGED.add(redraw);
		event.COLOR_BACKGROUND_CHANGED.add(onBackgroundChanged);
		event.COLOR_FOREGROUND_CHANGED.add(onForegroundChanged);
	}

	function drag(touchOrE,offsetX,offsetY){
		if (window.TouchEvent&&touchOrE.constructor===TouchEvent&&touchOrE.touches.length>1) {
			var pos = camera.position
				,vecCam = cameraCenter.clone().sub(pos)
				,sideVec = vecCam.clone().cross(vecZ)
				,stepVec
				,incr = 2;
			//
			stepVec = sideVec.clone().cross(vecCam).setLength(-incr*offsetY);
			pos.sub(stepVec);
			cameraCenter.sub(stepVec);
			//
			stepVec = sideVec.setLength(incr*offsetX);
			pos.sub(stepVec);
			cameraCenter.sub(stepVec);
			//
			axis.position.x = cameraCenter.x;
			axis.position.y = cameraCenter.y;
			axis.position.z = cameraCenter.z;
		} else {
			var oldCameraRotationY = cameraRotationY
				,cameraRotationY360;
			cameraRotationX += 0.3*offsetX;
			cameraRotationY -= 0.3*offsetY;
			cameraRotationY360 = mod360(cameraRotationY);
			if (mod360(oldCameraRotationY)<180===cameraRotationY360>180) {
				camera.up = new THREE.Vector3(0,0,cameraRotationY360>180?-1:1);
			}
			setCamera();
		}
	}

	function onKeyPress(keys){
		var step = 1.1E1
			,pos = camera.position
			,vecCam = cameraCenter.clone().sub(pos)
			,sideVec = vecCam.clone().cross(vecZ)
			,stepVec;
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
		cameraDistance = Math.max(cameraDistance - i/10,111);
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

	function redraw(){
		var positionAttr = geometry.attributes.position
			,positions = positionAttr.array
			,positionsNum = positions.length
			,colorAttr = geometry.attributes.color
			,colors = colorAttr.array
			,color
			,p = new THREE.Vector3(random(rndSize),random(rndSize),random(rndSize))
			,i = 100
			,t = Date.now();
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
			//
			if (isColorStatic) {
				var rgb = tinycolor(colorFg).toRgb();
				colors[i]   = rgb.r/255;
				colors[i+1] = rgb.g/255;
				colors[i+2] = rgb.b/255;
			} else {
				color = getColor(x,y,z);
				colors[i]   = color[0];
				colors[i+1] = color[1];
				colors[i+2] = color[2];
			}
		}
		positionAttr.needsUpdate = true;
		colorAttr.needsUpdate = true;
		console.log('redraw',Date.now()-t); // todo: remove log
	}

	function getColor(x,y,z){
		return [
			2*abs((x-xmin)/(xmax-xmin)-0.5)
			,2*abs((y-ymin)/(ymax-ymin)-0.5)
			,2*abs((z-zmin)/(zmax-zmin)-0.5)
		];
	}

	function iterate(p){
		attractor(p);
		if (!isFinite(p.x)) p.x = random(rndSize);
		if (!isFinite(p.y)) p.y = random(rndSize);
		if (!isFinite(p.z)) p.z = random(rndSize);
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
			 cameraCenter.x + cameraDistance*sinY*sinX
			,cameraCenter.y + cameraDistance*sinY*cosX
			,cameraCenter.z + cameraDistance*cosY
		);
		camera.lookAt(cameraCenter);
	}

	function onTypeChanged(){
		attractor = attractors.attractor;
		n = attractor.scale;
		n2 = n/2;
		redraw();
		center();
		isMinMaxFinite()&&geometry.computeBoundingSphere();
	}

	function onBackgroundChanged(color){
		renderer.setClearColor( color );
	}

	function onForegroundChanged(color){
		colorFg = color;
		isColorStatic&&redraw();
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

	function isMinMaxFinite(){
		return isFinite(xmin)&&isFinite(xmax)
			&&isFinite(ymin)&&isFinite(ymax)
			&&isFinite(zmin)&&isFinite(zmax);
	}

	function center(x,y,z){
		var vecOffset = cameraCenter.clone();
		if (typeof x!=='number') x = isFinite(xmin)&&isFinite(xmax)?(xmin+xmax)/2:0;
		if (typeof y!=='number') y = isFinite(ymin)&&isFinite(ymax)?(ymin+ymax)/2:0;
		if (typeof z!=='number') z = isFinite(zmin)&&isFinite(zmax)?(zmin+zmax)/2:0;
		//
		cameraCenter.x = x;
		cameraCenter.y = y;
		cameraCenter.z = z;
		//
		vecOffset.sub(cameraCenter);
		camera.position.sub(vecOffset);
		//
		axis.position.x = cameraCenter.x;
		axis.position.y = cameraCenter.y;
		axis.position.z = cameraCenter.z;
		//
		setCamera();
	}

	function getCameraClone(){
		return camera.clone();
	}

	function mod360(i) {
		return (i % 360 + 360) % 360;
	}

	return {
		init: init
		,center: center
		,getCameraClone: getCameraClone
		,iterate: iterate
		,getColor: getColor
		,setCamera: setCamera
		,get point() { return point; }
		,get cameraCenter() { return cameraCenter; }
		,get cameraDistance() { return cameraDistance; }
		,set cameraDistance(f) {
			cameraDistance = f;
			setCamera();
		}
		,get cameraRotationX() { return cameraRotationX; }
		,set cameraRotationX(f) {
			cameraRotationX = f;
			setCamera();
		}
		,get cameraRotationY() { return cameraRotationY; }
		,set cameraRotationY(f) {
			cameraRotationY = f;
			setCamera();
		}
		,get computeBoundingSphere() { return geometry.computeBoundingSphere.bind(geometry); }
	};
})());