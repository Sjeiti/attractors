attractors.create(
	'Peter de Jong'
	,[3.1,-.1,6.1,4,4,0]
	,function(constants,vec){
		var sin = Math.sin
			,cos = Math.cos
			,x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4]
			,c5 = constants[5];
		vec.x = sin(c0*y) - cos(c3*x);
		vec.y = sin(c1*z) - cos(c4*y);
		vec.z = sin(c2*x) - cos(c5*z);
		return vec;
	}
);