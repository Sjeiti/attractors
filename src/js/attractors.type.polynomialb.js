attractors.create(
	'Polynomial type B'
	,[0.69340,0.26139,0.74517,0.15297,0.90570,0.26402]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4]
			,c5 = constants[5];
		vec.x = c0 + y - z*(c1+y);
		vec.y = c2 + z - x*(c3+z);
		vec.z = c4 + x - y*(c5+x);
		return vec;
	}
);