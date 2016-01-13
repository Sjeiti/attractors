attractors.create(
	'Pickover'
	,[1.068107,-0.62762,0.64169,-1.60018]
	,function(constants,vec){
		var sin = Math.sin
			,cos = Math.cos
			,x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3];
		vec.x = sin(c0*y)-z*cos(c1*x);
		vec.y = z*sin(c2*x)-cos(c3*y);
		vec.z = sin(x);
		return vec;
	}
);