attractors.create(
	'Lu Chen 1'
	,[40,5/6,0.5,0.65,20,0.001]
	,function(vec,a,c,d,e,f,g){
		var x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = x + g*(a*(y-x) + d*x*z);
		vec.y = y + g*(-x*z + f*y);
		vec.z = z + g*(-e*x*x + x*y + c*z);
		return vec;
	}
	,12
);
//http://www.internonlinearscience.org/upload/papers/20110618025420887.pdf