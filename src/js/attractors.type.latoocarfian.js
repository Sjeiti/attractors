attractors.create(
	'Latoocarfian'
	,[1.2544194,1.1821778,1.0815392,1.3997533,-1.6979753,-2.0924227]
	,function(constants,vec){
		var sin = Math.sin
			,x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4]
			,c5 = constants[5];
		vec.x = sin(y*c0) + c3*sin(x*c0);
		vec.y = sin(z*c1) + c4*sin(y*c1);
		vec.z = sin(x*c2) + c5*sin(z*c2);
		return vec;
	}
);