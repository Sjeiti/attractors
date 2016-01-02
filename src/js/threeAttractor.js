/* globals THREE, Detector, iddqd, Stats */
(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var signal = iddqd.signal
		,isFinite = Number.isFinite
		,random = Math.random
		,attractor
		//
		,container
		,ui
		, stats
		// threejs
		,camera
		,scene
		,renderer
		,cameraCenter = new THREE.Vector3(0,0,0)
		,cameraRotationX = 111
		,cameraRotationY = 111
		,cameraDistance = 2750
	;

	iddqd.network.xhttp('js/lorenz84.js',function(request){
		console.log('xhttp',arguments); // todo: remove log
		var module = {};
		eval(request.response);
		attractor = module.exports;
		init();
		console.log('module',module); // todo: remove log
	},console.warn.bind(console));

	function init() {
		initVariables();
		initThreejs();
		initStats();
		initEvents();
	}

	function initVariables(){
		container = document.getElementById('container');
		ui = document.getElementById('ui');
	}

	function initThreejs(){
		initThreejsScene();
		initThreejsCamera();
		initThreejsParticles();
		initThreejsRenderer();
	}

	function initThreejsScene(){
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
	}

	function initThreejsCamera(){
		camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
		setCamera();
	}

	function initThreejsParticles(){
		var particles = 500000
			,geometry = new THREE.BufferGeometry()
			,positions = new Float32Array( particles * 3 )
			,colors = new Float32Array( particles * 3 )
			,color = new THREE.Color()
			,n = 200
			,n2 = n / 2 // particles spread in the cube
			//
			,p = new THREE.Vector3(random(),0,0)
			,l = positions.length
		;
		for ( var i = 0; i < l; i += 3 ) {
			attractor(p);
			if (!isFinite(p.x)) p.x = random();
			if (!isFinite(p.y)) p.y = random();
			if (!isFinite(p.z)) p.z = random();
			var x = p.x*n - n2;
			var y = p.y*n - n2;
			var z = p.z*n - n2;
			// positions
			positions[ i ]     = x;
			positions[ i + 1 ] = y;
			positions[ i + 2 ] = z;
			// colors
			var vx = ( x / n ) + 0.5;
			var vy = ( y / n ) + 0.5;
			var vz = ( z / n ) + 0.5;

			color.setRGB( vx, vy, vz );

			colors[ i ]     = color.r;
			colors[ i + 1 ] = color.g;
			colors[ i + 2 ] = color.b;
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
		container.appendChild( renderer.domElement );
	}

	function initStats(){
			stats = new Stats();
			ui.appendChild( stats.domElement );
	}

	function initEvents(){
		signal.key.press.add(onKeyPress);
		signal.mouseWheel.add(onMouseWheel);
		signal.drag.add(onDrag);
		signal.animate.add(onAnimate);
		window.addEventListener( 'resize', onWindowResize, false );
		window.addEventListener( 'click', onClick, false );
	}

	function onKeyPress(keys){
		var step = 1.1E1;
		if (keys[87]) { // up
			camera.position.y += step;
			cameraCenter.y += step;
		}
		if (keys[83]) { // down
			camera.position.y -= step;
			cameraCenter.y -= step;
		}
		if (keys[65]) { // left
			camera.position.x += step;
			cameraCenter.x += step;
		}
		if (keys[68]) { // right
			camera.position.x -= step;
			cameraCenter.x -= step;
		}
	}

	function onMouseWheel(i){
		cameraDistance += i/10;
		setCamera();
	}

	function onDrag(touches){
		for (var id in touches) {
			if (/^\d+$/.test(id)) {
				var touch = touches[id]
					,last = touch.last
					,pos = touch.pos
					,offsetX = last.getX() - pos.getX()
					,offsetY = last.getY() - pos.getY();
				cameraRotationX += offsetX;
				cameraRotationY += offsetY;
				setCamera();
			}
		}
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onAnimate() {
		renderer.render( scene, camera );
		stats.update();
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

	function onClick(){
		console.log('onClick'); // todo: remove log
	}

	/*function createVector(x, y, z, camera, width, height) {
		var p = new THREE.Vector3(x, y, z);
		var vector = p.project(camera);
		vector.x = (vector.x + 1) / 2 * width;
		vector.y = -(vector.y - 1) / 2 * height;
		return vector;
	}*/

})();