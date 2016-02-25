attractors.create(
	'Thomas'
	,[0.19,-1.9]
	,function(vec,a,b){
		var sin = Math.sin
			,x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = x + b*(a*x+sin(y));
		vec.y = y + b*(a*y+sin(z));
		vec.z = z + b*(a*z+sin(x));
		return vec;
	}
);