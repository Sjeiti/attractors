// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// A list of usefull distance function to simple primitives, and an example on how to
// do some interesting boolean operations, repetition and displacement.
//
// More info here: http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm


uniform float time;
uniform vec2 resolution;
uniform float size;

uniform vec3 camP;
uniform vec3 lookAt;

float M_PI = 3.1415926535897932384626433832795;

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

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }

/*
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

  }*/

///////////////////////////////////////////////////////

float sinNoise3d(in vec3 p){
	float s=0.5,r=0.0;
	for(int i=0;i<3;i++){
		p+=p+sin(p.yzx*0.8+sin(p.zxy*0.9));
		s*=0.5;
		r+=sin(p.z+1.5*sin(p.y+1.3*sin(p.x)))*s;
	}
	return r;
}

///////////////////////////////////////////////////////

float sdPlane(vec3 p){
//	return p.y+.1*sinNoise3d(p);
	return p.y;
}

float sdSphere(vec3 p, float s){
	return length(p)-s;
}

float sdBox(vec3 p, vec3 b){
    vec3 d = abs(p) - b;
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

//float sdBoxes(vec3 p, vec3 b){
//    vec3 d = abs(mod(p.,b.x*4.)) - b;
//    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
//}
float sdBoxes(vec3 p, vec3 b){
	vec3 pp = p;
	float size = b.x;
	float x = abs(mod(pp.x,4.0*size)) - size;
	float y = abs(mod(pp.y,4.0*size)) - size;
	float z = abs(mod(pp.z,4.0*size)) - size;
	float result = max(x,y);
	return max(result,z);
}
float sdSpheres(vec3 p, float s){
//	return length(mod(p,s*4.))-s;
	float dst = 1.5;//min(1.2 + .2*length(p),3.);// - 2.7/pow(length(p.xz),1.1);
	float bolls = length(mod(p + vec3(0,0,mod( - time*.1,dst)),dst) - dst/2.0) - .2;
	return bolls;//max(p.y + .2, - bolls);
}

float udRoundBox(vec3 p, vec3 b, float r){
    return length(max(abs(p)-b,0.0))-r;
}

float sdAsdf(vec3 p, vec3 b){
//	return (.2*snoise(vec3(3.*p))+sdSphere(p,b.x*1.39))/2.;
//	return (.2*snoise(vec4(3.*p,time*0.1))+sdSphere(p,b.x*1.39))/2.;
//	return (.05*snoise(vec4(8.*p,time*0.5))+sdSphere(p,b.x*3.39))/2.;
//	return (.05*snoise(vec4(8.*p,time*0.5))+sdBox(p,b*3.39))/2.;
//	return max(.01*snoise(vec4(4.*p,time*0.0)),sdBoxes(p,b*3.39));
//	return max(.01*snoise(vec4(4.*p,time*0.0)),udRoundBox(p+vec3(0,-1,0),vec3(.3),.01));
//	return sdBoxes(p,b*3.39);
//	return max(.01*snoise(vec4(4.*p,time*0.25)),sdSpheres(p,0.5));
    //return max(sdBox(p,b),-sdSphere(p,b.x*1.39));

//	float dst = 2.;
//	float balls =  length(mod(p + vec3(0,
//		.25*dst*floor(mod(p.x,2.*dst) - .5)
//		-.25*dst*floor(mod(p.z,2.*dst) - .5)
//		-mod(time*.1,dst)
//	,0),dst) - dst/2.0) - .4;
//	return balls;
//	return (.15*snoise(vec4(4.*p,time*0.0))+balls)/1.1;
//	return (.05*snoise(vec4(3.*p,time*0.1))+sdSphere(p,1.))/1.1;

	float blobTime = 01.*time;
	float sinBlobTime = sin(blobTime);
	float piTime = floor(blobTime/M_PI);
	return (.2*sinBlobTime*snoise(3.*p+2.*piTime*vec3(0,1,0))+sdSphere(p,1.5))/1.2;

//	return max(snoise(2.*p+time)+.1,sdSphere(p,.5));
//	return max(.01*snoise(vec4(4.*p,time*0.0)),balls);

}

float sdTorus(vec3 p, vec2 t){
    return length(vec2(length(p.xz)-t.x,p.y))-t.y;
}

float sdHexPrism(vec3 p, vec2 h){
	vec3 q = abs(p);
#if 0
	return max(q.z-h.y,max((q.x*0.866025+q.y*0.5),q.y)-h.x);
#else
	float d1 = q.z-h.y;
	float d2 = max((q.x*0.866025+q.y*0.5),q.y)-h.x;
	return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);
#endif
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r){
	vec3 pa = p-a, ba = b-a;
	float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
	return length(pa - ba*h) - r;
}

float sdTriPrism(vec3 p, vec2 h){
	vec3 q = abs(p);
#if 0
	return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
#else
	float d1 = q.z-h.y;
	float d2 = max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5;
	return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);
#endif
}

float sdCylinder(vec3 p, vec2 h){
    vec2 d = abs(vec2(length(p.xz),p.y)) - h;
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}


float sdCone(in vec3 p, in vec3 c){
	vec2 q = vec2(length(p.xz), p.y);
#if 0
	return max(max(dot(q,c.xy), p.y), -p.y-c.z);
#else
	float d1 = -p.y-c.z;
	float d2 = max(dot(q,c.xy), p.y);
	return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);
#endif
}

float length2(vec2 p){
	return sqrt(p.x*p.x + p.y*p.y);
}

float length6(vec2 p){
	p = p*p*p; p = p*p;
	return pow(p.x + p.y, 1.0/6.0);
}

float length8(vec2 p){
	p = p*p; p = p*p; p = p*p;
	return pow(p.x + p.y, 1.0/8.0);
}

float sdTorus82(vec3 p, vec2 t){
    vec2 q = vec2(length2(p.xz)-t.x,p.y);
    return length8(q)-t.y;
}

float sdTorus88(vec3 p, vec2 t){
    vec2 q = vec2(length8(p.xz)-t.x,p.y);
    return length8(q)-t.y;
}

float sdCylinder6(vec3 p, vec2 h){
    return max(length6(p.xz)-h.x, abs(p.y)-h.y);
}

//----------------------------------------------------------------------

float opS(float d1, float d2){
	return max(-d2,d1);
}

vec2 opU(vec2 d1, vec2 d2){
	return (d1.x<d2.x) ? d1 : d2;
}

vec3 opRep(vec3 p, vec3 c){
	return mod(p,c)-0.5*c;
}

vec3 opTwist(vec3 p){
	float c = cos(10.0*p.y+10.0);
	float s = sin(10.0*p.y+10.0);
	mat2  m = mat2(c,-s,s,c);
	return vec3(m*p.xz,p.y);
}

//----------------------------------------------------------------------

vec2 map(in vec3 pos){
	vec2 res = opU(vec2(sdPlane(pos), 1.0),
					vec2(sdAsdf(pos-vec3(0,1,0), vec3(0.22)), 55.0));
//					vec2(sdBox(pos-vec3(1.0,0.25, 0.0), vec3(0.25)), 46.9));
//					vec2(sdSphere(pos-vec3(0.0,0.25, 0.0), 0.25), 46.9));
//	res = opU(res, vec2(sdBox(pos-vec3(1.0,0.25, 0.0), vec3(0.25)), 3.0));
//	res = opU(res, vec2(udRoundBox(pos-vec3(1.0,0.25, 1.0), vec3(0.15), 0.1), 41.0));
//	res = opU(res, vec2(sdTorus(pos-vec3(0.0,0.25, 1.0), vec2(0.20,0.05)), 25.0));
//	res = opU(res, vec2(sdCapsule(pos,vec3(-1.3,0.20,-0.1), vec3(-1.0,0.20,0.2), 0.1), 31.9));
//	res = opU(res, vec2(sdTriPrism(pos-vec3(-1.0,0.25,-1.0), vec2(0.25,0.05)),43.5));
//	res = opU(res, vec2(sdCylinder(pos-vec3(1.0,0.30,-1.0), vec2(0.1,0.2)), 8.0));
//	res = opU(res, vec2(sdCone(pos-vec3(0.0,0.50,-1.0), vec3(0.8,0.6,0.3)), 55.0));
//	res = opU(res, vec2(sdAsdf(pos-vec3(0), vec3(0.22)), 55.0));
//	res = opU(res, vec2(sdTorus82(pos-vec3(0.0,0.25, 2.0), vec2(0.20,0.05)),50.0));
//	res = opU(res, vec2(sdTorus88(pos-vec3(-1.0,0.25, 2.0), vec2(0.20,0.05)),43.0));
//	res = opU(res, vec2(sdCylinder6(pos-vec3(1.0,0.30, 2.0), vec2(0.1,0.2)), 12.0));
//	res = opU(res, vec2(sdHexPrism(pos-vec3(-1.0,0.20, 1.0), vec2(0.25,0.05)),17.0));
//
//	res = opU(res, vec2(opS(udRoundBox(pos-vec3(-2.0,0.2, 1.0), vec3(0.15),0.05),
//					 sdSphere(pos-vec3(-2.0,0.2, 1.0), 0.25)), 13.0));
//	res = opU(res, vec2(opS(sdTorus82(pos-vec3(-2.0,0.2, 0.0), vec2(0.20,0.1)),
//					 sdCylinder(opRep(vec3(atan(pos.x+2.0,pos.z)/6.2831,
//											 pos.y,
//											 0.02+0.5*length(pos-vec3(-2.0,0.2, 0.0))),
//										 vec3(0.05,1.0,0.05)), vec2(0.02,0.6))), 51.0));
//	res = opU(res, vec2(0.7*sdSphere(pos-vec3(-2.0,0.25,-1.0), 0.2) +
//									  0.03*sin(50.0*pos.x)*sin(50.0*pos.y)*sin(50.0*pos.z),
//									  65.0));
//	res = opU(res, vec2(0.5*sdTorus(opTwist(pos-vec3(-2.0,0.25, 2.0)),vec2(0.20,0.05)), 46.7));

	return res;
}

vec2 castRay(in vec3 ro, in vec3 rd){
	float tmin = 1.0;
	float tmax = 20.0;

#if 0
	float tp1 = (0.0-ro.y)/rd.y; if(tp1>0.0) tmax = min(tmax, tp1);
	float tp2 = (1.6-ro.y)/rd.y; if(tp2>0.0) { if(ro.y>1.6) tmin = max(tmin, tp2);
												 else		  tmax = min(tmax, tp2); }
#endif

	float precis = 0.002;
	float t = tmin;
	float m = -1.0;
	for(int i=0; i<50; i++){
		vec2 res = map(ro+rd*t);
		if(res.x<precis || t>tmax) break;
		t += res.x;
		m = res.y;
	}

	if(t>tmax) m=-1.0;
	return vec2(t, m);
}


float softshadow(in vec3 ro, in vec3 rd, in float mint, in float tmax){
	float res = 1.0;
	float t = mint;
	for(int i=0; i<16; i++){
		float h = map(ro + rd*t).x;
		res = min(res, 8.0*h/t);
		t += clamp(h, 0.02, 0.10);
		if(h<0.001 || t>tmax) break;
	}
	return clamp(res, 0.0, 1.0);
}

vec3 calcNormal(in vec3 pos){
	vec3 eps = vec3(0.001, 0.0, 0.0);
	vec3 nor = vec3(map(pos+eps.xyy).x - map(pos-eps.xyy).x,
		map(pos+eps.yxy).x - map(pos-eps.yxy).x,
		map(pos+eps.yyx).x - map(pos-eps.yyx).x);
	return normalize(nor);
}

float calcAO(in vec3 pos, in vec3 nor){
	float occ = 0.0;
	float sca = 1.0;
	for(int i=0; i<5; i++){
		float hr = 0.01 + 0.12*float(i)/4.0;
		vec3 aopos = nor * hr + pos;
		float dd = map(aopos).x;
		occ += -(dd-hr)*sca;
		sca *= 0.95;
	}
	return clamp(1.0 - 3.0*occ, 0.0, 1.0);
}

vec3 render(in vec3 ro, in vec3 rd){
	vec3 col = vec3(0.8, 0.9, 1.0);
	vec2 res = castRay(ro,rd);
	float t = res.x;
	float m = res.y;
	if(m>-0.5){
		vec3 pos = ro + t*rd;
		vec3 nor = calcNormal(pos);
		vec3 ref = reflect(rd, nor);

		// material
		col = 0.45 + 0.3*sin(vec3(0.05,0.08,0.10)*(m-1.0));

		if(m<1.5){
			float f = mod(floor(5.0*pos.z) + floor(5.0*pos.x), 2.0);
			col = 0.4 + 0.1*f*vec3(1.0);
		}

		// lighting
		float occ = calcAO(pos, nor);
		vec3 lig = normalize(vec3(-0.6, 0.7, -0.5));
		float amb = clamp(0.5+0.5*nor.y, 0.0, 1.0);
		float dif = clamp(dot(nor, lig), 0.0, 1.0);
		float bac = clamp(dot(nor, normalize(vec3(-lig.x,0.0,-lig.z))), 0.0, 1.0)*clamp(1.0-pos.y,0.0,1.0);
		float dom = smoothstep(-0.1, 0.1, ref.y);
		float fre = pow(clamp(1.0+dot(nor,rd),0.0,1.0), 2.0);
		float spe = pow(clamp(dot(ref, lig), 0.0, 1.0),16.0);

//		dif *= softshadow(pos, lig, 0.02, 2.5);
//		dom *= softshadow(pos, ref, 0.02, 2.5);

		vec3 brdf = vec3(0.0);
		brdf += 1.20*dif*vec3(1.00,0.90,0.60);
		brdf += 1.20*spe*vec3(1.00,0.90,0.60)*dif;
		brdf += 0.30*amb*vec3(0.50,0.70,1.00)*occ;
//		brdf += 0.40*dom*vec3(0.50,0.70,1.00)*occ;
//		brdf += 0.30*bac*vec3(0.25,0.25,0.25)*occ;
//		brdf += 0.40*fre*vec3(1.00,1.00,1.00)*occ;
		brdf += 0.02;
		col = col*brdf;

		col = mix(col, vec3(0.8,0.9,1.0), 1.0-exp(-0.0005*t*t));

	}

	return vec3(clamp(col,0.0,1.0));
}

mat3 setCamera(in vec3 ro, in vec3 ta, float cr){
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize(cross(cw,cp));
	vec3 cv = normalize(cross(cu,cw));
	return mat3(cu, cv, cw);
}

//void mainImage(out vec4 fragColor, in vec2 fragCoord){
void main(){
	vec4 fragCoord = gl_FragCoord;
	vec4 fragColor;
	vec2 iResolution = resolution;

	vec2 q = fragCoord.xy/iResolution.xy;
	vec2 p = -1.0+2.0*q;
	p.x *= iResolution.x/iResolution.y;
//	vec2 mo = iMouse.xy/iResolution.xy;
//	vec2 mo = vec2(0.5);

	float t = 15.0 + time;

	// camera
	vec3 ro = camP;//vec3(-0.5+3.2*cos(0.1*t + 6.0*mo.x), 1.0 + 2.0*mo.y, 0.5 + 3.2*sin(0.1*t + 6.0*mo.x));
	vec3 ta = camP+lookAt;//vec3(-0.5, -0.4, 0.5);

	// camera-to-world transformation
	mat3 ca = setCamera(ro, ta, 0.0);

	// ray direction
	vec3 rd = ca * normalize(vec3(p.xy,2.5));

	// render
	vec3 col = render(ro, rd);

	col = pow(col, vec3(0.4545));

	fragColor = vec4(col, 1.0);
	gl_FragColor = fragColor;
}