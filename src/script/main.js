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
	animate();
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
	parameters.time = new Date().getTime() - parameters.start_time;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// Load program into GPU
	gl.useProgram(currentProgram);
	// Set values to program variables
	gl.uniform1f(gl.getUniformLocation(currentProgram,'time'),parameters.time / 1000);
	gl.uniform2f(gl.getUniformLocation(currentProgram,'resolution'),parameters.screenWidth,parameters.screenHeight);
	//
	var numChanges = changes.length;
	while (numChanges--) {
		var change = changes[numChanges]
				,uniformLocation = gl.getUniformLocation(currentProgram,change.name)
				,values = change.values
				,params = values.length;
		values.unshift(uniformLocation);
		if (params===1) gl.uniform1f.apply(gl,values);
		if (params===2) gl.uniform2f.apply(gl,values);
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