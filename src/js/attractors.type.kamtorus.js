attractors.create(
	'Kamtorus'
	,[1.1390653,2.093859,-1.0785681,-.2240113,-.83149767,1.5743972]
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
		vec.x = y*sin(c0) + (z*z-x)*cos(c3);
		vec.y = z*sin(c1) - (x*x-y)*cos(c4);
		vec.z = x*sin(c2) - (y*y-z)*cos(c5);
		return vec;
	}
);