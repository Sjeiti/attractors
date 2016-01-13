attractors.create(
	'Rossler'
	,[-.6691257,.8975352,-.13777809,-.068686865]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3];
		vec.x = x + c0 * (-y - z);
		vec.y = y + c0 * (x + c1 * y);
		vec.z = z + c0 * (c2 + z * (x - c3));
		return vec;
	}
);