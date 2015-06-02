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
	changes.push({name:'pointss',values:getPoints(lorenz84,99)});
	//changes.push({name:'pointsNum',values:[9]});
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

var lorenz84Pos = {x:1.1,y:1.2,z:1.3};
var c0 = -1.2346115;
var c1 = 0.6818416;
var c2 = -0.9457178;
var c3 = 0.48372614;
var c4 = -0.355516;
function lorenz84(){
	var scale = 0.30;
	var x = lorenz84Pos.x;
	var y = lorenz84Pos.y;
	var z = lorenz84Pos.z;
	var xx = x + c4*(-c0*x-Math.pow(y,2.0)-Math.pow(z,2.0)+c0*c2);
	var yy = y + c4*(-y+x*y-c1*x*z+c3);
	var zz = z + c4*(-z+c1*x*y+x*z);
	lorenz84Pos.x = xx;
	lorenz84Pos.y = yy;
	lorenz84Pos.z = zz;
	//checkPoint();
	return [scale*lorenz84Pos.x,scale*lorenz84Pos.y,scale*lorenz84Pos.z];
	//////////
}
function getPoints(fnc,num){
	var points = [];
	while (num--){
		Array.prototype.push.apply(points,fnc());
	}
	console.log('getPoints',num,points); // log
	return points;
}