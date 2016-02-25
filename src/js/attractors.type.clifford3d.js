attractors.create(
	'Clifford 3D'
	,[-2.7650595,-1.4949875,-1.5734646,-0.7236035,1.9719217,1.3144507]
	,function(vec,a,b,c,d,e,f){
		var sin = Math.sin
			,cos = Math.cos
			,x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = sin(a*y) + d*cos(a*x);
		vec.y = sin(b*z) + e*cos(b*y);
		vec.z = sin(c*x) + f*cos(c*z);
		return vec;
	}
);