/*global requestAnimationFrame*/

import xhttp from '../vendor/iddqd/src/io/xhttp';

var canvas
	,gl
	,buffer
	,contentVertex
	,contentFragment
	,currentProgram
	,vertex_position
	,parameters = {
		start_time: new Date().getTime(),time: 0,screenWidth: 0,screenHeight: 0
	}
	,changes = [{name:'size',values:[2]}]
;

// todo: add promise to xhttp
xhttp('script/vertex.cc',function(request){
	contentVertex = request.response;
	contentFragment&&init();
});
xhttp('script/fragment.cc',function(request){
	contentFragment = request.response;
	contentVertex&&init();
});

function init() {
	console.log('location.host.indexOf()',location.host.indexOf('localhost')); // log
	if (location.host.indexOf('localhost')!==-1) {
		document.body.classList.add('localhost');
		/*global loadScripts*/
		loadScripts('http://localhost:35729/livereload.js');
	}
	//
	//contentVertex = ccontentVertex;//document.getElementById('vs').textContent;
	//contentFragment = ccontentFragment;//document.getElementById('fs').textContent;
	canvas = document.querySelector('canvas');
	// Initialise WebGL
	try {
		gl = canvas.getContext('experimental-webgl');
	} catch (error) {}
	if (!gl) {
		throw "cannot create webgl context";
	}
	//
	// Create Vertex buffer (2 triangles)
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1.0,-1.0,1.0,-1.0,-1.0,1.0,1.0,-1.0,1.0,1.0,-1.0,1.0]),gl.STATIC_DRAW);
	//
	// Create Program
	currentProgram = createProgram(contentVertex,contentFragment);
	handleWindowResize();
	window.addEventListener('resize',handleWindowResize,false);
	//
	var elmSize = document.getElementById('size');
	elmSize.addEventListener('change',function(e){
		console.log('e.target.value',e.target.value); // log
		changes.push({name:'size',values:[e.target.value]});
	});
	//
	////////////////////////////////////////////////////
	////////////////////////////////////////////////////

	//canvas.addEventListener('mousedown',dragging,false);
	//canvas.addEventListener('mouseup',dragging,false);
	//canvas.addEventListener('drag',dragging,false);

	var mouseLast = {x:0,y:0};
	var lookAtRadius = 2;
	var lookAtRadians = {x:82,y:-219};
	var lookAtVec3 = [0,0,0];
	calcLookat();

	document.addEventListener('dragstart',function (event) {
		document.addEventListener('drag',dragging,false);
	},false);

	document.addEventListener('dragend',function (event) {
		document.removeEventListener('drag',dragging,false);
		mouseLast.x = 0;
		mouseLast.y = 0;
	},false);

	function calcLookat(){
		var radiansX = 0.01*lookAtRadians.x
			,radiansY = 0.01*lookAtRadians.y
			,sinY = Math.sin(radiansY)
		;
		lookAtVec3[0] = lookAtRadius*Math.sin(radiansX)*sinY;
		lookAtVec3[2] = lookAtRadius*Math.cos(radiansX)*sinY;
		lookAtVec3[1] = lookAtRadius*Math.cos(radiansY);
		console.log('lookAtRadians',lookAtRadians); // log
		changes.push({name:'lookAt',values:lookAtVec3});
	}

	function dragging(e){
		var dragX = e.pageX
			,dragY = e.pageY
			,lastX = mouseLast.x
			,lastY = mouseLast.y
			,isFirst = lastX===0&&lastY===0
			,isLast = dragX===0&&dragY===0
		;
		if (!isFirst&&!isLast) {
			lookAtRadians.x += dragX-lastX;
			lookAtRadians.y += dragY-lastY;
			calcLookat();
		}
		mouseLast.x = dragX;
		mouseLast.y = dragY;
	}

	////////////////////////////////////////////////////

	var campPVec3 = [1,2,1]
		,keys = (function(a,i){
			while (i--) a.push(false);
			return a;
		})([],99)
		,speed = 0.001
	;
	checkKeys();//changes.push({name:'camP',values:campPVec3});
	//changes.push({name:'motion',values:motionVec2});
	document.addEventListener('keydown',function(e){
		var keyCode = e.keyCode;
		if (!keys[keyCode]) speed = 0.01;
		keys[keyCode] = true;

		//checkKeys();
	});
	document.addEventListener('keyup',function(e){
		keys[e.keyCode] = false;
		//console.log('e.keyCode',e.keyCode); // log
		//checkKeys();
	});//udlr:87,83,65,68

	function checkKeys(){
		var fw = keys[87]?1:(keys[83]?-1:0)
			,lr = keys[65]?1:(keys[68]?-1:0);
		if (speed<1) speed *= 1.3;
		if (fw!==0) {
			campPVec3[0] += fw*speed*lookAtVec3[0];
			campPVec3[1] += fw*speed*lookAtVec3[1];
			campPVec3[2] += fw*speed*lookAtVec3[2];
			console.log('campPVec3',campPVec3); // log
		}
		if (lr!==0) {
			var up = [0,1,0]
				,cr = crossProduct(campPVec3,up);
			campPVec3[0] += lr*speed*cr[0];
			campPVec3[1] += lr*speed*cr[1];
			campPVec3[2] += lr*speed*cr[2];
		}
		changes.push({name:'camP',values:campPVec3});
		//changes.push({name:'motion',values:motionVec2});
	}
	window.checkKeys = checkKeys;

	///////////////////////////////////////////////////
	////////////////////////////////////////////////////
	//
	//
	animate();
}

function crossProduct(a,b){
	return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
}

function createProgram(vertex,fragment) {
	var program = gl.createProgram();
	var vs = initShader(vertex,gl.VERTEX_SHADER);
	var fs = initShader('#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment,gl.FRAGMENT_SHADER);
	if (vs===null || fs===null) return null;
	gl.attachShader(program,vs);
	gl.attachShader(program,fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {
		console.warn("ERROR:\n" + "VALIDATE_STATUS: " + gl.getProgramParameter(program,gl.VALIDATE_STATUS) + "\n" + "ERROR: " + gl.getError() + "\n\n" + "- Vertex Shader -\n" + vertex + "\n\n" + "- Fragment Shader -\n" + fragment);
		return null;
	}
	return program;

}

function initShader(src,type) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader,src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
		console.warn(( type===gl.VERTEX_SHADER?"VERTEX":"FRAGMENT" ) + " SHADER:\n" + gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

function handleWindowResize(event) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	parameters.screenWidth = canvas.width;
	parameters.screenHeight = canvas.height;
	gl.viewport(0,0,canvas.width,canvas.height);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	if (!currentProgram) return;
	//
	parameters.time = Date.now() - parameters.start_time;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// Load program into GPU
	gl.useProgram(currentProgram);
	// Set values to program variables
	gl.uniform1f(gl.getUniformLocation(currentProgram,'time'),parameters.time / 1000);
	gl.uniform2f(gl.getUniformLocation(currentProgram,'resolution'),parameters.screenWidth,parameters.screenHeight);
	//
	//
	//////
	window.checkKeys();
	//////
	//
	//
	var numChanges = changes.length;
	while (numChanges--) {
		var change = changes[numChanges]
				,uniformLocation = gl.getUniformLocation(currentProgram,change.name)
				,values = change.values.slice(0)
				,params = values.length;
		values.unshift(uniformLocation);
		if (params===1)			gl.uniform1f.apply(gl,values);
		else if (params===2)	gl.uniform2f.apply(gl,values);
		else if (params===3)	gl.uniform3f.apply(gl,values);
		else					gl.uniform3f.apply(gl,values);

	}
	changes.length = 0;
	//
	// Render geometry
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.vertexAttribPointer(vertex_position,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(vertex_position);
	gl.drawArrays(gl.TRIANGLES,0,6);
	gl.disableVertexAttribArray(vertex_position);
}