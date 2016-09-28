/**
 * http://www.internonlinearscience.org/upload/papers/20110618025420887.pdf
 */
attractors.create(
  'Three-Scroll Unified Chaotic System'
  ,[40, 1.833, 55, 0.16, 0.65, 20, 0.00002]
  ,function(vec,a,b,c,d,e,f,g){
    var x = vec.x
        ,y = vec.y
        ,z = vec.z;
		vec.x = x + g*( a*(y-x) + d*x*z );
		vec.y = y + g*( c*x - x*z + f*y );
		vec.z = z + g*( b*z + x*y - e*x*x );
    return vec;
  }
  ,4
);