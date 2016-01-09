attractors.create(
	'Lorenz'
	,[4.6,18.5,.6,.003,4]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4];
		vec.x = x + c4*( (-c0*x*c3) + (c0*y*c3) );
		vec.y = y + c4*( (c1*x*c3) - (y*c3) - (z*x*c3) );
		vec.z = z + c4*( (-c2*z*c3) + (x*y*c3) );
		return vec;
	}
	,50
);