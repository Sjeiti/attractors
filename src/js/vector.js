module.exports = function(xx,yy,zz){
	var x,y,z,size
		,sqrt = Math.sqrt;
	set(xx,yy,zz);
	function set(xx,yy,zz){
		x = xx===undefined?0:xx;
		y = yy===undefined?0:yy;
		z = zz===undefined?0:zz;
		size = 0;
	}
	function toString(){
			return '[object vector('+x+','+y+','+z+')]';
	}
	return {
		get x() { return x; }
		,set x(v) { x = v; }
		,get y() { return y; }
		,set y(v) { y = v; }
		,get z() { return z; }
		,set z(v) { z = v; }
		,get size() {
			size = sqrt(x*x + y*y);
			size = z*z + size*size;
			return size;
		}
		,set: set
		,toString: toString
	}
};
