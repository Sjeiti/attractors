attractors.create(
  'Hadley'
  ,[0.2,4,8,1,0.001]
  ,function(vec,a,b,c,d,e){
    var x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = x + e*(-y*y - z*z + a*c);
    vec.y = y + e*(x*y - b*x*z - y + d);
    vec.z = z + e*(b*x*y + x*z - z);
    return vec;
  }
);