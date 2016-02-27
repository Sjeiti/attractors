attractors.create(
	'Dequan-Li'
	,[40,1.833,0.16,0.65,55,20,0.0001]
	,function(vec,a,b,c,d,e,f,g){
		var x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = x + g*(a*(y-x) + c*x*z);
		vec.y = y + g*(e*x + f*y - x*z);
		vec.z = z + g*(b*z + x*y - d*x*x);
		return vec;
	}
	,6
);