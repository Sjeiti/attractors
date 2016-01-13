attractors.create(
	'Sprot'
	,[1.1390653,2.093859,-1.0785681,-0.2240113,-0.83149767,1.5743972]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4]
			,c5 = constants[5];
		vec.x = c0 + c1*x + c2*x*x + c3*x*y + c4*y + c5*y*y;
		vec.y = x;
		vec.z = y;
		return vec;
	}
);