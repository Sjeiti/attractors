attractors.create(
	'Tamari'
	,[1.013,-0.011,0.02,0.96,0,0.01,1,0.05,0.05]
	,function(constants,vec){
		if (this.c5===undefined) this.c5 = -0.76;
		var sin = Math.sin
			,cos = Math.cos
			,atan = Math.atan
			,x = vec.x
			,y = vec.y
			,z = vec.z
			,a = constants[0]
			,b = constants[1]
			,c = constants[2]
			,d = constants[3]
			,e = constants[4]
			,f = constants[5]
			,g = constants[6]
			,u = constants[7]
			,i = constants[8];
		vec.x = (x - a*y)*cos(z) - b*y*sin(z)  ;
		vec.y = (x + c*y)*sin(z) + d*y*cos(z)  ;
		vec.z = e + f*z + g*atan( ((1 - u) / (1 - i)) *x*y );
		/*
			x' = (x - ay)cos(z) - bysin(z)                       "x" output
			y' = (x + cy)sin(z) + dycos(z)                      "y" money
			z' = e + fz + gatan{ [(1 - u)y] / [(1 - i)x] }   "z" pricing - spiral version
			z' = e + fz + gatan{ (1 - u) / (1 - i) xy }       "z" wealth - attractor version

			a ≡ Inertia = 1.013
			b ≡ Productivity = - 0.011
			c ≡ Printing = 0.02
			d ≡ Adaptation= 0.96
			e ≡ Exchange = 0
			f ≡ Indexation = 0.01
			g ≡ Elasticity/Expectations= 1
			u ≡ Unemployment = 0.05
			i ≡ Interest= 0.05
		*/
		return vec;
	}
	,200
);