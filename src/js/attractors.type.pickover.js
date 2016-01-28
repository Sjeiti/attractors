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
		//vec.x = sin(c0*x)-z*cos(c1*y);
		//vec.y = z*sin(c2*x)-cos(c3*y);
		//vec.z = c4/sin(x);
		vec.x = sin(c0*y)-z*cos(c1*x);
		vec.y = z*sin(c2*x)-cos(c3*y);
		vec.z = sin(x);
		/*
			x' = sin(ax) - zcos(by)
			y' = zsin(cx) - cos(dy)
			z' = e / sin(x)

			a = 2.24 ,   b = 0.43 ,  c = - 0.65 ,  d = - 2.43 ,  e = 1

			x0, y0, z0 = 0 ,     - 2 ≤ x, y ≤ 2
		*/
		return vec;
	}
	,400
);