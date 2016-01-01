

uniform float time;
uniform vec2 resolution;
uniform float size;

uniform vec3 camP;
uniform vec3 lookAt;

float M_PI = 3.1415926535897932384626433832795;

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////


//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
  }

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

  }

///////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
#ifdef GL_ES
precision mediump float;
#endif

const int samples = 128;
float fov = 2.;

float sinNoise3d(in vec3 p){
	float s=0.5,r=0.0;
	for(int i=0;i<3;i++){
		p+=p+sin(p.yzx*0.8+sin(p.zxy*0.9));
		s*=0.5;
		r+=sin(p.z+1.5*sin(p.y+1.3*sin(p.x)))*s;
	}
	return r;
}

float objSphere(vec3 p,vec3 pos,float radius){
	return length(p + pos) - radius;
}

float objBox(vec3 p,vec3 pos,float size){
	vec3 pp = p + pos;
	float x = abs(pp.x) - size;
	float y = abs(pp.y) - size;
	float z = abs(pp.z) - size;
	float result = max(x,y);
	return max(result,z);
}

float objAxis(vec3 p,float axisSize){
	float x = abs(p.x) - axisSize;
	float y = abs(p.y) - axisSize;
	float z = abs(p.z) - axisSize;
	float xz = max(x,z);
	float xy = max(x,y);
	float yz = max(y,z);
	return min(min(xz,xy),yz);
}


//float sdBoxes(vec3 p, vec3 b){
//    vec3 d = abs(mod(p.,b.x*4.)) - b;
//    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
//}
float sdBoxes(vec3 p, float size){
	float x = abs(mod(p.x,4.0*size)) - size;
	float y = abs(mod(p.y,4.0*size)) - size;
	float z = abs(mod(p.z,4.0*size)) - size;
	float result = max(x,y);
	return max(result,z);
}
float sdSpheres(vec3 p, float s){
//	return length(mod(p,s*4.))-s;
	float dst = 1.5;//min(1.2 + .2*length(p),3.);// - 2.7/pow(length(p.xz),1.1);
	float bolls = length(mod(p + vec3(0,0,mod( - time*.1,dst)),dst) - dst/2.0) - .2;
	return bolls;//max(p.y + .2, - bolls);
}


float objFloor(vec3 p){
//	return max(.01*snoise(vec4(4.*p,time*0.0)),sdBoxes(p,.39));
	//
	float dst = 2.;
	float balls =  length(mod(p + vec3(0,
		.25*dst*floor(mod(p.x,2.*dst) - .5)
		-.25*dst*floor(mod(p.z,2.*dst) - .5)
		-mod(time*.1,dst)
	,0),dst) - dst/2.0) - .4;
	//
//	float dst = 4.;
//	float sine1 = p.y + .5 + .25*(sin(dst*p.x - .5*M_PI) + sin(dst*p.z - .5*M_PI));
//	float ddst = 8.;
//	float sine2 = p.y + .5 + .1*(sin(ddst*p.x - .5*M_PI) + sin(ddst*p.z - .5*M_PI));
////	return min(d,dd);
//	return (d + dd)/2.;
	//
//	float dst = 2.2;//min(1.2 + .2*length(p),3.);// - 2.7/pow(length(p.xz),1.1);
//	float bolls = length(mod(p + vec3(0,0,mod( - time*.1,dst)),dst) - dst/2.0) - 1.3;
//	return max(p.y + .2, - bolls);
	//
	float dsst = min(1.2 + .2*length(p),3.);// - 2.7/pow(length(p.xz),1.1);
	float bills = length(mod(p + vec3(0,0, - time*0.2),dsst) - dsst/2.0) - 1.1;
//	return max(p.y + .2, - bills);
	//
	float tt = .8*time;
	float sphere0 =  objSphere(p,vec3(0,1.*sin(.4*time),0),.2);
	float sphere1 =  objSphere(p,vec3(1.4*cos(tt), - .05,1.4*sin(tt/2.-1.25*M_PI)),.1);
	float sphere2 =  objBox(p,vec3(0,1.4*sin(.7*time) - .5,0),.2);
//	float sphere2 =  objSphere(p,vec3(0,1.4*sin(.7*time) - .5,0),.2);
	float spheres =  (sphere0*sphere1*sphere2)/3.;
//	float spheres =  sphere1;
	//
	float plane = p.y+sinNoise3d(p);// + .1;
	//
//	float dent = (plane + .0001/pow(spheres,2.))/2.;
	float dent = (plane+spheres);
//	float dent = (plane/spheres)*2.;
//	float dent = (plane + .01/pow(balls,2.5))/2.;
	//
	return max(.01*snoise(vec4(4.*p,time*0.0)),balls);
//	return min(dent,balls);
//	return dent;
//	return min(plane,spheres);
//	return min(min(dent,spheres),objBox(p,vec3( - .6, - 1.1, - 1.2),.4));
//	return (plane*balls)/3.;
//	return min( min(dent,spheres),balls);
}

float objBallGrid(vec3 p,float dst){
	return length(mod(p + vec3(0,0,mod( - time*1.,dst)),dst) - dst/2.0) - .4;
}

vec2 distFunc(vec3 p){

	vec2 result = vec2(1);

	float ground = objFloor(p);// - objBallGrid(p);
	if (ground<result.x) result = vec2(ground,3.);

//	float grid = objBallGrid(p,2.);
//	if (grid  <result.x) result = vec2(grid,2.);
//	result = max(result.x,grid);

//	float grid = objBallGrid(p);
//	if (grid  <result.x) result = vec2(max(result.x,grid),2.);

	float axis = objAxis(p,.01);
	if (axis  <result.x) result = vec2(axis,1.);

//	float sphere = objSphere(p,vec3(1,0,1),.2);
//	if (sphere<result.x) result = vec2(sphere,4.);

	//result = min(dist,axis);
	//result = min(dist,grid);
	//result = min(dist,sphere);

	return result;
}

vec3 getNormal(vec3 p){
	float d = 0.0001;
	return normalize(vec3(
		distFunc(p + vec3(  d, 0.0, 0.0)).x - distFunc(p + vec3( -d, 0.0, 0.0)).x,
		distFunc(p + vec3(0.0,   d, 0.0)).x - distFunc(p + vec3(0.0,  -d, 0.0)).x,
		distFunc(p + vec3(0.0, 0.0,   d)).x - distFunc(p + vec3(0.0, 0.0,  -d)).x
	));
}



void main( void ) {

	vec4 fragCoord = gl_FragCoord;
	vec4 fragColor;
	vec2 iResolution = resolution;


	vec2 p = fov*(fragCoord.xy*2. - iResolution.xy)/iResolution.x;

	vec3 camC = camP + lookAt;
	vec3 camU = normalize(vec3(0,1.,0));
	vec3 camS = cross(normalize(camC - camP),camU);
	vec3 ray = normalize(camS*p.x + camU*p.y + (camC - camP));

	vec2 dist = vec2(0.);
	float color;
	float rayL = 0.;
	vec3  rayP = camP;
	for(int i = 0;i<samples;i++){
		dist = distFunc(rayP);
		color = dist.y;
		rayL += dist.x;
		rayP = camP + ray*rayL;
	}

	if(abs(dist.x)<.001){
		vec3 n = getNormal(rayP);
		vec4 b = vec4( .1,.3,.6, 1.0 );
//		vec4 b = texture2D(iChannel0,n.xy);
		float d = dot( - ray,n);
		if (color==0.) {
		} else if (color==1.) {
			fragColor = vec4(vec3(.8)/rayL,1.);
		} else if (color==2.) {
			fragColor = b*10./rayL;
		} else if (color==3.) {
//			fragColor = vec4(.8*vec3()/rayL,1.);
			//
			vec3 c1 = vec3(1.,.9,.7);
			vec3 c2 = .6*c1;
			float vierkant = 8.;
			float md = 2.;
			float hmd = md/2.;
			vec3 rm = mod(rayP*vierkant,md);// + .1*time
			bool bx = rm.x<hmd;
			bool by = rm.y<hmd;
			bool bz = rm.z<hmd;
//			bool b3 = by;
			bool b3 = bx==bz;
//			bool b3 = (by?bx! = bz:bx==bz);
			fragColor = 1.*vec4((b3?c1:c2)*2./rayL,1.);
			//
//			vec3 c1 = vec3(1.,.9,.7);
//			vec3 c2 = .6*c1;
//			float vierkant = 16.;
//			bool bx = mod(rayP.x*vierkant,2.)<1.;
//			bool by = mod(rayP.y*vierkant,2.)<1.;
//			bool bz = mod(rayP.z*vierkant,2.)<1.;
//			bool b3 = (by?bx! = bz:bx==bz);//&&by! = bz&&bx! = bz;
//			fragColor = vec4((b3?c1:c2)*2./rayL,1.);
			//
//			vec3 c1 = vec3(1.,.9,.7);
//			vec3 c2 = .6*c1;
//			float cm = 1.;
//			float t = 1.1*time;
//			vec2 cr = mod(rayP.xz,cm) - cm/2.;
//			float crl = pow(6./length(cr),.4);
//			float md = 2.;
//			bool c = mod(crl + t,md)>(md/2.);
//			bool cx = mod(rayP.x*16.,2.)>1.;
//			fragColor = .5*crl*vec4((c?c1:c2)/rayL,1.);
		} else if (color==4.) {
			fragColor = vec4(n*5./rayL,1.);
		} else {
			fragColor = vec4(vec3(d)*n*5./rayL,1.);
		}
	}else{
		fragColor = vec4(vec3(0.0), 1.0);
	}


	gl_FragColor = fragColor;//vec4( r, g, b, 1.0 );
}