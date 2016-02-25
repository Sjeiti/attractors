attractors.create(
	'Polynomial type A'
	,[1.63108,1.08454,0.118899]
	,function(vec,a,b,c){
		var x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = a + y - z*y;
		vec.y = b + z - x*z;
		vec.z = c + x - y*x;
		return vec;
	}
);