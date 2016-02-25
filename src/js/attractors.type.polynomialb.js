attractors.create(
	'Polynomial type B'
	,[0.69340,0.26139,0.74517,0.15297,0.90570,0.26402]
	,function(vec,a,b,c,d,e,f){
		var x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = a + y - z*(b+y);
		vec.y = c + z - x*(d+z);
		vec.z = e + x - y*(f+x);
		return vec;
	}
);