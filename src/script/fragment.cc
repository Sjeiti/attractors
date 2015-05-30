
uniform float time;
uniform vec2 resolution;
uniform float size;


const int pointNum = 99;
vec3 points[pointNum];

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
	float scale = 30.0;
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
	vec2 position = - 1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	float t = size*time;
	float r = (1.0+sin( size*position.x*position.y + t/7.0 ))/2.0;
	float g = (1.0+sin( size*position.x*position.y + t/5.0 ))/2.0;
	float b = (1.0+sin( size*position.x*position.y + t/3.0 ))/2.0;

	for(int i = 0; i<pointNum; i++) {
		points[i] = lorenz84();
	}


	gl_FragColor = vec4( r, g, b, 1.0 );
}

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