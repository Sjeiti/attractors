attractors.create(
	'Polynomial type C'
	,[0.9218706,-0.858799,-0.8621235,0.89861906,0.013761461,0.1665296,0.049253225,0.65695226,0.049607992,0.1527924,-0.43470955,0.25819838,0.7989209,-0.25225127,0.43356472,0.67362326,-0.6379633,-0.6840042]
	,function(vec,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){
		var x = vec.x
			,y = vec.y
			,z = vec.z;
		vec.x = a + x*(b + c*x + d*y) + y*(e + f*y);
		vec.y = g + y*(h + i*y + j*z) + z*(k + l*z);
		vec.z = m + z*(n + o*z + p*x) + x*(q + r*x);
		return vec;
	}
);