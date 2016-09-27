attractors.create(
  'Bouali 2'
  ,[0.3,1,0.012]
  ,function(vec,a,b,c,d,e){
    var x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = x + d*( x*(4-y) + a*z );
    vec.y = y + d*( -y*(1-x*x) );
    vec.z = z + d*( -x*(1.5-b*z) - 0.05*z );
    return vec;
  }
  ,40
);