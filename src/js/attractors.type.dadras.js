attractors.create(
  'Dadras'
  ,[3,2.7,1.7,2,9,0.001]
  ,function(vec,a,b,c,d,e,f){
    var x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = x + f*(y - a*x + b*y*z);
    vec.y = y + f*(c*y - x*z + z);
    vec.z = z + f*(d*x*y - e*z);
    return vec;
  }
  ,40
);