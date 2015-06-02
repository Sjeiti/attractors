

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
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
#ifdef GL_ES
precision mediump float;
#endif

const int samples = 128;
float fov = 2.;

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

float objFloor(vec3 p){
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
	float plane = p.y;// + .1;
	//
	float dent = (plane + .0001/pow(spheres,2.))/2.;
//	float dent = (plane/spheres)*2.;
//	float dent = (plane + .01/pow(balls,2.5))/2.;
	//
//	return min(dent,balls);
	return min(dent,spheres);
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

//    float grid = objBallGrid(p,2.);
//    if (grid  <result.x) result = vec2(grid,2.);
//    result = max(result.x,grid);

//    float grid = objBallGrid(p);
//    if (grid  <result.x) result = vec2(max(result.x,grid),2.);

    float axis = objAxis(p,.01);
    if (axis  <result.x) result = vec2(axis,1.);

//    float sphere = objSphere(p,vec3(1,0,1),.2);
//    if (sphere<result.x) result = vec2(sphere,4.);

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

	if(abs(dist.x)<.01){
        vec3 n = getNormal(rayP);
        vec4 b = vec4( .1,.3,.6, 1.0 );
//        vec4 b = texture2D(iChannel0,n.xy);
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
//            bool b3 = by;
            bool b3 = bx==bz;
//            bool b3 = (by?bx! = bz:bx==bz);
			fragColor = 1.*vec4((b3?c1:c2)*2./rayL,1.);
			//
//            vec3 c1 = vec3(1.,.9,.7);
//            vec3 c2 = .6*c1;
//            float vierkant = 16.;
//            bool bx = mod(rayP.x*vierkant,2.)<1.;
//            bool by = mod(rayP.y*vierkant,2.)<1.;
//            bool bz = mod(rayP.z*vierkant,2.)<1.;
//            bool b3 = (by?bx! = bz:bx==bz);//&&by! = bz&&bx! = bz;
//			fragColor = vec4((b3?c1:c2)*2./rayL,1.);
			//
//            vec3 c1 = vec3(1.,.9,.7);
//            vec3 c2 = .6*c1;
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