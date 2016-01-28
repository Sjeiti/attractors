attractors.create(
	'Ikeda'
	//,[1,0.9,0.4,6]
	,[0.18,0.78,0.4,6]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,coxz = Math.cos(z)
			,sinz = Math.sin(z);
		vec.x = c0 + c1*(x*coxz - y*sinz );
		vec.y = c1*(x*sinz + y*coxz) ;
		vec.z = c2 - c3 / (1 + x*2 + y*2);

/*

x' = a + b(xcosz - ysinz )
y' = b (xsinz + ycosz)
z' = c - d / (1+x2 + y2)

a = 1 ,   b = 0.9 ,   c = 0.4 ,   d = 6
*/

		return vec;
	}
	,100
);