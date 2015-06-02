

uniform float time;
uniform vec2 resolution;
uniform float size;

//uniform int pointsNum;
uniform vec3 pointss;


const int pointNum = 2;
vec3 points[pointNum];
float M_PI = 3.1415926535897932384626433832795;

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
#ifdef GL_ES
precision mediump float;
#endif

const int samples = 128;
float fov = 2.;

float objSphere(vec3 p,vec3 pos,float radius){
    return length(p+pos)-radius;
}

float objAxis(vec3 p,float axisSize){
//    float xyAxis = abs(p.x)-axisSize;
//    float xzAxis = abs(p.y)-axisSize;
//    float yzAxis = abs(p.z)-axisSize;
//    float xyAxis = abs(p.x+p.y)-axisSize;
//    float xzAxis = abs(p.x+p.z)-axisSize;
//    float yzAxis = abs(p.y+p.z)-axisSize;
    float xyAxis = length(p.xy)-axisSize;
    float xzAxis = length(p.xz)-axisSize;
    float yzAxis = length(p.yz)-axisSize;
//    float xyAxis = length(p.xy+vec2(0,0))-axisSize;
//    float xzAxis = length(p.xz+vec2(0,0))-axisSize;
//    float yzAxis = length(p.yz+vec2(0,0))-axisSize;
    float result = min(xyAxis,xzAxis);
    result = min(result,yzAxis);
//    result = min(result,max(xzAxis,yzAxis));
    return result;
}

float objFloor(vec3 p){
	//
	float dst = 2.;
	float balls =  length(mod(p+vec3(0,0,mod(-time*1.,dst)),dst)-dst/2.0)-.4;
	//
//	float dst = 4.;
//	float sine1 = p.y+.5+.25*(sin(dst*p.x-.5*M_PI)+sin(dst*p.z-.5*M_PI));
//	float ddst = 8.;
//	float sine2 = p.y+.5+.1*(sin(ddst*p.x-.5*M_PI)+sin(ddst*p.z-.5*M_PI));
////	return min(d,dd);
//	return (d+dd)/2.;
	//
//	float dst = 2.2;//min(1.2+.2*length(p),3.);//-2.7/pow(length(p.xz),1.1);
//	float bolls = length(mod(p+vec3(0,0,mod(-time*.1,dst)),dst)-dst/2.0)-1.3;
//	return max(p.y+.2,-bolls);
	//
	float dsst = min(1.2+.2*length(p),3.);//-2.7/pow(length(p.xz),1.1);
	float bills = length(mod(p+vec3(0,0,-time*0.2),dsst)-dsst/2.0)-1.1;
//	return max(p.y+.2,-bills);
	//
	float sphere0 =  length(p+vec3(0,1.*sin(.4*time),0))-.2;
	float sphere1 =  length(p+vec3(0,-.3,1.4*sin(.8*time)))-.3;
	float sphere2 =  length(p+vec3(0,1.4*sin(.7*time)-.5,0))-.2;
	float spheres =  (sphere0*sphere1*sphere2)/3.;
	//
	float plane = p.y;//+.1;
	//
	float dent = (plane+.001/pow(spheres,1.5))/2.;
	//
	return min(dent,spheres);
}

float objLorenz84(vec3 p){
	float dist = 1.;

//	for(int j = 0; j<1; j++) {
//		vec3 lorenzPoint = vec3(pointss[3*j],pointss[3*j+1],pointss[3*j+2]);
//		float point = length(p+lorenzPoint)-.1;
//		if (point<dist) dist = point;
//	}
	/*for(int i = 0; i<pointNum; i++) {
		vec3 lorenzPoint = points[i];
		float point = length(p+lorenzPoint)-.1;
		if (point<dist) dist = point;
	}*/
	return dist;//length(mod(p+vec3(0,0,mod(-time*1.,dst)),dst)-dst/2.0)-.4;
}

float objBallGrid(vec3 p,float dst){
	return length(mod(p+vec3(0,0,mod(-time*1.,dst)),dst)-dst/2.0)-.4;
}

vec2 distFunc(vec3 p){

    vec2 result = vec2(1);

    float ground = objFloor(p);//-objBallGrid(p);
    if (ground<result.x) result = vec2(ground,3.);

//    float grid = objBallGrid(p,2.);
//    if (grid  <result.x) result = vec2(grid,2.);
//    result = max(result.x,grid);

//    float grid = objBallGrid(p);
//    if (grid  <result.x) result = vec2(max(result.x,grid),2.);

    float axis = objAxis(p,.01);
    if (axis  <result.x) result = vec2(axis,1.);

    float sphere = objSphere(p,vec3(1,0,1),.2);
    if (sphere<result.x) result = vec2(sphere,4.);

    float lorenz = objLorenz84(p);
    if (lorenz<result.x) result = vec2(lorenz,4.);

    //result = min(dist,axis);
    //result = min(dist,grid);
    //result = min(dist,sphere);

    return result;
}

vec3 getNormal(vec3 p){
	float d=0.0001;
	return normalize(vec3(
		distFunc(p+vec3(  d, 0.0, 0.0)).x-distFunc(p+vec3( -d, 0.0, 0.0)).x,
		distFunc(p+vec3(0.0,   d, 0.0)).x-distFunc(p+vec3(0.0,  -d, 0.0)).x,
		distFunc(p+vec3(0.0, 0.0,   d)).x-distFunc(p+vec3(0.0, 0.0,  -d)).x
	));
}
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

//float vConstant[5];
//vConstant[0] = -1.2346115;
//const float vMul[] = {0.05, 0.1, 0.25, 0.3, 0.1, 0.3, 0.25, 0.1, 0.05};
//const float c[3] = float[3](5.0, 7.2, 1.1);
//const float d[3] = float[](5.0, 7.2, 1.1);
//float a[5] = float[5](2.0, 1.0, 2.3, 2.3, 4.3);
/*uniform float vConstant[5] = float[5](
	 -1.2346115
	,.6818416
	,-.9457178
	,.48372614
	,-.355516
);*/
float c0 = -1.2346115;
float c1 = .6818416;
float c2 = -.9457178;
float c3 = .48372614;
float c4 = -.355516;
//uniform float c0;
//uniform float c1;
//uniform float c2;
//uniform float c3;
//uniform float c4;
//c0 = -1.2346115;
//c1 = .6818416;
//c2 = -.9457178;
//c3 = .48372614;
//c4 = -.355516
vec3 lorenz84Pos = vec3(1.1,1.2,1.3);
vec3 lorenz84(){
	////////
	float scale = .30;
	float x = lorenz84Pos.x;
	float y = lorenz84Pos.y;
	float z = lorenz84Pos.z;
	float xx = x + c4*(-c0*x-pow(y,2.0)-pow(z,2.0)+c0*c2);
	float yy = y + c4*(-y+x*y-c1*x*z+c3);
	float zz = z + c4*(-z+c1*x*y+x*z);
	lorenz84Pos.x = xx;
	lorenz84Pos.y = yy;
	lorenz84Pos.z = zz;
	//checkPoint();
	return vec3(scale*lorenz84Pos.x,scale*lorenz84Pos.y,scale*lorenz84Pos.z);
	//////////
}



void main( void ) {

	vec4 fragCoord = gl_FragCoord;
	vec4 fragColor;
	vec2 iResolution = resolution;

	/*vec2 position = - 1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	float t = size*time;
	float r = (1.0+sin( size*position.x*position.y + t/7.0 ))/2.0;
	float g = (1.0+sin( size*position.x*position.y + t/5.0 ))/2.0;
	float b = (1.0+sin( size*position.x*position.y + t/3.0 ))/2.0;*/

//	vec2 pos = fragCoord.xy;
//	if (pos.x==0.&&pos.y==0.)
//	}

	for(int i = 0; i<pointNum; i++) {
		points[i] = lorenz84();
	}

	vec2 p = fov*(fragCoord.xy*2.-iResolution.xy)/iResolution.x;
	//vec3 camP=vec3(.5,.25,2.);
	//vec3 camP=vec3(.5,2.25+2.*sin(time*1.1),2.25+2.*cos(time*1.1));
    float radians = time*.15;
    float radius = 2.;
	vec3 camP=vec3(radius*sin(radians),1.5,radius*cos(radians));
	//vec3 camC=vec3(sin(time*.7)*.3,0.,0.);
	//vec3 camC=vec3(3.*sin(time*.1),0.,0.);
	vec3 camC=vec3(0,0,0);
	//vec3 camU=normalize(vec3(sin(time)*.1,1.,0.));
	vec3 camU=normalize(vec3(0,1.,0));
	vec3 camS=cross(normalize(camC-camP),camU);
	vec3 ray=normalize(camS*p.x+camU*p.y+(camC-camP));

	vec2 dist=vec2(0.);
	float color;
	float rayL=0.;
	vec3  rayP=camP;
	for(int i=0;i<samples;i++){
		dist=distFunc(rayP);
        color = dist.y;
		rayL+=dist.x;
		rayP=camP+ray*rayL;
	}

	if(abs(dist.x)<.01){
        vec3 n = getNormal(rayP);
        vec4 b = vec4( .1,.3,.6, 1.0 );
//        vec4 b = texture2D(iChannel0,n.xy);
        float d = dot(-ray,n);
        if (color==0.) {
        } else if (color==1.) {
			fragColor=vec4(vec3(.8)/rayL,1.);
        } else if (color==2.) {
			fragColor = b*10./rayL;
        } else if (color==3.) {
//			fragColor=vec4(.8*vec3()/rayL,1.);
			//
            vec3 c1 = vec3(1.,.9,.7);
            vec3 c2 = .6*c1;
            float vierkant = 8.;
            float md = 2.;
            float hmd = md/2.;
            vec3 rm = mod(rayP*vierkant,md);//+.1*time
            bool bx = rm.x<hmd;
            bool by = rm.y<hmd;
            bool bz = rm.z<hmd;
//            bool b3 = by;
            bool b3 = bx==bz;
//            bool b3 = (by?bx!=bz:bx==bz);
			fragColor = 1.*vec4((b3?c1:c2)*2./rayL,1.);
			//
//            vec3 c1 = vec3(1.,.9,.7);
//            vec3 c2 = .6*c1;
//            float vierkant = 16.;
//            bool bx = mod(rayP.x*vierkant,2.)<1.;
//            bool by = mod(rayP.y*vierkant,2.)<1.;
//            bool bz = mod(rayP.z*vierkant,2.)<1.;
//            bool b3 = (by?bx!=bz:bx==bz);//&&by!=bz&&bx!=bz;
//			fragColor = vec4((b3?c1:c2)*2./rayL,1.);
			//
//            vec3 c1 = vec3(1.,.9,.7);
//            vec3 c2 = .6*c1;
//			float cm = 1.;
//			float t = 1.1*time;
//			vec2 cr = mod(rayP.xz,cm)-cm/2.;
//			float crl = pow(6./length(cr),.4);
//			float md = 2.;
//			bool c = mod(crl+t,md)>(md/2.);
//			bool cx = mod(rayP.x*16.,2.)>1.;
//			fragColor = .5*crl*vec4((c?c1:c2)/rayL,1.);
        } else if (color==4.) {
			fragColor=vec4(n*5./rayL,1.);
        } else {
			fragColor=vec4(vec3(d)*n*5./rayL,1.);
        }
	}else{
		fragColor=vec4(vec3(0.0), 1.0);
	}


	gl_FragColor = fragColor;//vec4( r, g, b, 1.0 );
}

/*
#ifdef GL_ES
precision mediump float;
#endif

const int samples = 64;
float fov = 2.;
float time=iGlobalTime;
float dst=2.;

float objSphere(vec3 p,vec3 pos,float radius){
    return length(p+pos)-radius;
}

float objAxis(vec3 p,float axisSize){
    float xyAxis = length(p.xy+vec2(0,0))-axisSize;
    float xzAxis = length(p.xz+vec2(0,0))-axisSize;
    float yzAxis = length(p.yz+vec2(0,0))-axisSize;
    float result = min(xyAxis,xzAxis);
    result = min(result,yzAxis);
    return result;
}

float objBallGrid(vec3 p){
	return length(mod(
        p+vec3(0,0,mod(-time*1.,dst)),dst)-dst/2.0)-.4;
}

float objFloor(vec3 p){
	return p.y+1.;//+.2*sin(p.x*2.+p.z)+.2*sin(p.z*2.);
}

vec2 distFunc(vec3 p){

    vec2 result = vec2(1);

    float axis = objAxis(p,.01);
    if (axis  <result.x) result = vec2(axis,1.);

    //float grid = objBallGrid(p);
    //if (grid  <result.x) result = vec2(grid,2.);

    float ground = objFloor(p);
    if (ground<result.x) result = vec2(ground,3.);

    float sphere = objSphere(p,vec3(1,0,1),.2);
    if (sphere<result.x) result = vec2(sphere,4.);

    //result = min(dist,axis);
    //result = min(dist,grid);
    //result = min(dist,ground);
    //result = min(dist,sphere);

    return result;
}

vec3 getNormal(vec3 p){
	float d=0.0001;
	return normalize(vec3(
		distFunc(p+vec3(  d, 0.0, 0.0)).x-distFunc(p+vec3( -d, 0.0, 0.0)).x,
		distFunc(p+vec3(0.0,   d, 0.0)).x-distFunc(p+vec3(0.0,  -d, 0.0)).x,
		distFunc(p+vec3(0.0, 0.0,   d)).x-distFunc(p+vec3(0.0, 0.0,  -d)).x
	));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
	vec2 p=fov*(fragCoord.xy*2.-iResolution.xy)/iResolution.x;
	//vec3 camP=vec3(.5,.25,2.);
	//vec3 camP=vec3(.5,2.25+2.*sin(time*1.1),2.25+2.*cos(time*1.1));
    float radians = time*.15;
	vec3 camP=vec3(2.*sin(radians),.25,2.*cos(radians));
	//vec3 camC=vec3(sin(time*.7)*.3,0.,0.);
	//vec3 camC=vec3(3.*sin(time*.1),0.,0.);
	vec3 camC=vec3(0.,.5*sin(time*.5),0.);
	//vec3 camU=normalize(vec3(sin(time)*.1,1.,0.));
	vec3 camU=normalize(vec3(0,1.,0.));
	vec3 camS=cross(normalize(camC-camP),camU);
	vec3 ray=normalize(camS*p.x+camU*p.y+(camC-camP));

	vec2 dist=vec2(0.);
	float color;
	float rayL=0.;
	vec3  rayP=camP;
	for(int i=0;i<samples;i++){
		dist=distFunc(rayP);
        color = dist.y;
		rayL+=dist.x;
		rayP=camP+ray*rayL;
	}

	if(abs(dist.x)<.01){
        vec3 n = getNormal(rayP);
        vec4 b = texture2D(iChannel0,n.xy);
        float d = dot(-ray,n);
        if (color==0.) {
        } else if (color==1.) {
			fragColor=vec4(vec3(.8)/rayL,1.);
        } else if (color==2.) {
			fragColor = b*10./rayL;
        } else if (color==3.) {
			//fragColor=vec4(.8*vec3()/rayL,1.);
            vec3 c1 = vec3(1.,.9,.7);
            vec3 c2 = .8*c1;
            bool b1 = mod(rayP.x*2.,2.)<1.;
            bool b2 = mod(rayP.z*2.,2.)<1.;
            bool b3 = b1!=b2;
			fragColor=vec4((b3?c1:c2)*2./rayL,1.);
        } else if (color==4.) {
			fragColor=vec4(n*5./rayL,1.);
        } else {
			fragColor=vec4(vec3(d)*n*5./rayL,1.);
        }
	}else{
		fragColor=vec4(vec3(0.0), 1.0);
	}
}
*/



/*package nl.ronvalstar.attractorviewer.attractor {

import nl.ronvalstar.attractorviewer.Vector;

public class Lorenz84 extends AbstractAttractor {

	public function Lorenz84() {
		super();
		sName = "Lorenz 84";
		vDefault = new Vector(
			 -1.2346115
			,.6818416
			,-.9457178
			,.48372614
			,-.355516
		);
		vConstant = vDefault.duplicate();
		iScale = 30;
	}
	override public function iterate():Vector {
		var v:Array = vConstant;
		var x:Number = vPosition.x;
		var y:Number = vPosition.y;
		var z:Number = vPosition.z;
		var xx:Number = x + v[4]*(-v[0]*x-Math.pow(y,2)-Math.pow(z,2)+v[0]*v[2]);
		var yy:Number = y + v[4]*(-y+x*y-v[1]*x*z+v[3]);
		var zz:Number = z + v[4]*(-z+v[1]*x*y+x*z);
		vPosition.x = xx;
		vPosition.y = yy;
		vPosition.z = zz;
		checkPoint();
		return new Vector(iScale*vPosition.x,iScale*vPosition.y,iScale*vPosition.z);
	}
}
}*/