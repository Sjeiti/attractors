/**
 * http://www.internonlinearscience.org/upload/papers/20110618025420887.pdf
 */
attractors.create(
  'Lu Chen 2'
  ,[40,55,11/6,0.16,0.65,20,5E-5]
  ,function(vec,a,b,c,d,e,f,g){
    var x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = x + g*(a*(y-x) + d*x*z);
    vec.y = y + g*(b*x - x*z + f*y);
    vec.z = z + g*(-e*x*x + x*y + c*z);
    return vec;
  }
  ,6
);