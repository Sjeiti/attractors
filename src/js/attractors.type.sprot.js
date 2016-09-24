attractors.create(
  'Sprot'
  ,[1.1390653,2.093859,-1.0785681,-0.2240113,-0.83149767,1.5743972]
  ,function(vec,a,b,c,d,e,f){
    var x = vec.x
      ,y = vec.y;
    vec.x = a + b*x + c*x*x + d*x*y + e*y + f*y*y;
    vec.y = x;
    vec.z = y;
    return vec;
  }
);