/*package nl.ronvalstar.attractorviewer.attractor {

	import nl.ronvalstar.attractorviewer.Vector;

	public class Lorenz84 extends function {

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
}
function lorenz84(){

}*/

/*module.exports = function () {
	var vector = require('./vector.js')
		,p = vector(0,1,0);
	console.log('asdf',p);
}*/

module.exports = (function(){
	var name = 'Lorenz 84'
		,defaultConstants = [
			 -1.2346115
			,0.6818416
			,-0.9457178
			,0.48372614
			,-0.355516
		]
		,constants = defaultConstants.slice(0);
	function iterate(vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,xx = x + constants[4]*( - constants[0]*x - y*y - z*z + constants[0]*constants[2])
			,yy = y + constants[4]*( - y + x*y - constants[1]*x*z + constants[3])
			,zz = z + constants[4]*( - z + constants[1]*x*y + x*z);
		vec.x = xx;
		vec.y = yy;
		vec.z = zz;
		return vec;
	}
	Object.defineProperty(iterate, 'name', { get: function () { return name; } });
	return iterate;
})();
