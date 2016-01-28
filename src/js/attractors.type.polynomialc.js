attractors.create(
	'Polynomial type C'
	,[0.9218706,-0.858799,-0.8621235,0.89861906,0.013761461,0.1665296,0.049253225,0.65695226,0.049607992,0.1527924,-0.43470955,0.25819838,0.7989209,-0.25225127,0.43356472,0.67362326,-0.6379633,-0.6840042]
	,function(constants,vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,c0 = constants[0]
			,c1 = constants[1]
			,c2 = constants[2]
			,c3 = constants[3]
			,c4 = constants[4]
			,c5 = constants[5]
			,c6 = constants[5]
			,c7 = constants[5]
			,c8 = constants[5]
			,c9 = constants[5]
			,c10 = constants[5]
			,c11 = constants[5]
			,c12 = constants[5]
			,c13 = constants[5]
			,c14 = constants[5]
			,c15 = constants[5]
			,c16 = constants[5]
			,c17 = constants[5];
		vec.x = c0 + x*(c1 + c2*x + c3*y) + y*(c4 + c5*y);
		vec.y = c6 + y*(c7 + c8*y + c9*z) + z*(c10 + c11*z);
		vec.z = c12 + z*(c13 + c14*z + c15*x) + x*(c16 + c17*x);
		return vec;
	}
);