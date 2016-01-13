attractors.create(
	'Clifford 3D'
	,[-2.7650595,-1.4949875,-1.5734646,-0.7236035,1.9719217,1.3144507]
	,function(constants,vec){
		var sin = Math.sin
			,cos = Math.cos
			,x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4]
			,c5 = constants[5];
		vec.x = sin(c0*y) + c3*cos(c0*x);
		vec.y = sin(c1*z) + c4*cos(c1*y);
		vec.z = sin(c2*x) + c5*cos(c2*z);
		return vec;
	}
);