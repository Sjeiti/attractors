attractors.create(
  'Lorenz'
  ,[4.6,18.5,0.6,0.003,4]
  ,function(vec,a,b,c,d,e){
    var x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = x + e*( -a*x*d + a*y*d );
    vec.y = y + e*( b*x*d - y*d - z*x*d );
    vec.z = z + e*( -c*z*d + x*y*d );
    return vec;
  }
  ,40
);