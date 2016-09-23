attractors.create(
	'Peter de Jong'
	,[3.1,-0.1,6.1,4,4,0]
	,function(vec,a,b,c,d,e,f){
		var sin = Math.sin
			,cos = Math.cos
			,x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = sin(a*y) - cos(d*x);
		vec.y = sin(b*z) - cos(e*y);
		vec.z = sin(c*x) - cos(f*z);
		return vec;
	}
);