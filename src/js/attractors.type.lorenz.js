attractors.create(
  'Lorenz'
  ,[4.6,18.5,0.6,0.012]
  ,function(vec,a,b,c,d){
      var x = vec.x
        ,y = vec.y
        ,z = vec.z;
      vec.x = x + d*( a*(y-x) );
      vec.y = y + d*( x*(b-z) - y );
      vec.z = z + d*( x*y - c*z );
      return vec;
  }
  ,40
);