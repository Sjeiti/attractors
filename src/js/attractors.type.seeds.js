attractors.create(
	'Lu Chen 1'
	,[26.258361178550825,19.84561902712913,-0.6632410100168822,1.3602018427491285,12.69421104947185,0.049852214612855945]
	,function(vec,a,c,d,e,f,g){
		var x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = x + g*(a*(y-x) + d*x*z);
		vec.y = x + g*(-x*z + f*y);
		vec.z = x + g*(-e*x*x + x*y + c*z);
		return vec;
	}
	,12
);
//http://www.internonlinearscience.org/upload/papers/20110618025420887.pdf