attractors.create(
	'Chua'
	,[15.6,28,0,-1.143,-0.714]
	,function(constants,vec){
		if (this.c5===undefined) this.c5 = -0.76;
		var abs = Math.abs
			,x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4]
			,h = c4*x+0.5*(c3-c4)*(abs(x+1)-abs(x-1));
		//vec.x = c0*(y - x - this.c5);
		//vec.y = x - y + z;
		//vec.z = c1*y - c2*z;
		//this.c5 = c4*x + (c3-c4)*(abs(x+1)-abs(x-1))/2;

		vec.x = c0*(y-x-h);
		vec.y = x - y + z;
		vec.z = -c1*y;

		/*
		x = in(1);
		y = in(2);
		z = in(3);

		alpha  = 15.6;
		beta   = 28;
		m0     = -1.143;
		m1     = -0.714;

		h = m1*x+0.5*(m0-m1)*(abs(x+1)-abs(x-1));

		xdot = alpha*(y-x-h);
		ydot = x - y+ z;
		zdot  = -beta*y;

		out = [xdot ydot zdot]';
		*/
		/*
			x' = a(y - x - g)
			y' = x - y + z
			z' = by - cz

			g = ex + (d-e)[abs(x+1)-abs(x-1)]/2 ,   a = 15.6 ,   b = 28 ,   c = 0 ,   d = -1.143 ,   e = -0.714
		*/
		return vec;
	}
	,1
);