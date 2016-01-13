attractors.create(
	'Polynomial type A'
	,[1.63108,1.08454,0.118899]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2];
		vec.x = c0 + y - z*y;
		vec.y = c1 + z - x*z;
		vec.z = c2 + x - y*x;
		return vec;
	}
);