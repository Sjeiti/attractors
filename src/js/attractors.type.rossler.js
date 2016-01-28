attractors.create(
	'Rossler'
	,[0.2,0.2,5.7,0.0085]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3];
		vec.x = x + c3 * ( - y - z);
		vec.y = y + c3 * (x + c0*y);
		vec.z = z + c3 * (c1 + z*(x-c2));
		return vec;
	}
	,40
);