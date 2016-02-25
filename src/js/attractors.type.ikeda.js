attractors.create(
	'Ikeda'
	//,[1,0.9,0.4,6]
	,[0.18,0.78,0.4,6,1E-3]
	,function(vec,a,b,c,d,e){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,coxz = Math.cos(z)
			,sinz = Math.sin(z);
		vec.x = x + e*(a + b*(x*coxz - y*sinz ));
		vec.y = y + e*(b*(x*sinz + y*coxz) );
		vec.z = z + e*(c - d / (1 + x*2 + y*2));

/*

x' = a + b(xcosz - ysinz )
y' = b (xsinz + ycosz)
z' = c - d / (1+x2 + y2)

a = 1 ,   b = 0.9 ,   c = 0.4 ,   d = 6
*/

		return vec;
	}
	,6
);