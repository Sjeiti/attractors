attractors.create(
	'Aizawa'
	,[0.25,0.95,0.6,3.5,0.7,0.1]
	,function(vec,a,b,c,d,e,f){
		var x = vec.x
			,y = vec.y
			,z = vec.z;
		//vec.x = x*(z-b) - d*y;
		//vec.y = d*x + y*(z-b);
		//vec.z = c + a*z - z*z*z/3 - (x*x + y*y)(1 + );
		vec.x = (z-b) * x - d*y;
		vec.y = d*x + (z-b) * y;
		vec.z = c + a*z - z*z*z/3 - x*x + f*z*x*x*x;
		return vec;
	}
);