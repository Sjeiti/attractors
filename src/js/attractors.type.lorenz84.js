attractors.create(
	'Lorenz 84'
	,[-1.2346115,0.6818416,-0.9457178,0.48372614,-0.355516]
	,function(vec,a,b,c,d,e){
		var x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = x + e*( - a*x - y*y - z*z + a*c);
		vec.y = y + e*( - y + x*y - b*x*z + d);
		vec.z = z + e*( - z + b*x*y + x*z);
		return vec;
	}
);