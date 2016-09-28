/**
 * http://www.algosome.com/articles/aizawa-attractor-chaos.html
 */
attractors.create(
  'Aizawa'
  ,[0.25,0.95,0.6,3.5,0.1,0.14]
  ,function(vec,a,b,c,d,e,f){
    var x = vec.x
        ,y = vec.y
        ,z = vec.z;
    vec.x = x + f*( (z-b) * x - d*y );
    vec.y = y + f*( d*x + (z-b) * y );
    vec.z = z + f*( c + a*z - z*z*z/3 - x*x + e*z*x*x*x );
    return vec;
  }
);