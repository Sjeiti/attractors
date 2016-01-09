attractors.create(
	'Lorenz 84'
	,[-1.2346115,0.6818416,-0.9457178,0.48372614,-0.355516]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4];
		vec.x = x + c4*( - c0*x - y*y - z*z + c0*c2);
		vec.y = y + c4*( - y + x*y - c1*x*z + c3);
		vec.z = z + c4*( - z + c1*x*y + x*z);
		return vec;
	}
);