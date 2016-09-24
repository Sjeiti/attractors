attractors.create(
  'Bouali 2'
  ,[0.3,1]
  ,function(vec,a,b,c,d,e){
    var x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = x*(4-y) + a*z;
    vec.y = -y*(1-x*x);
    vec.z = -x*(1.5-b*z) - 0.05*z;
    return vec;
  }
  ,40
);