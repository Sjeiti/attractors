attractors.create(
  'Kamtorus'
  ,[1.1390653,2.093859,-1.0785681,-0.2240113,-0.83149767,1.5743972]
  ,function(vec,a,b,c,d,e,f){
    var sin = Math.sin
      ,cos = Math.cos
      ,x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = y*sin(a) + (z*z-x)*cos(d);
    vec.y = z*sin(b) - (x*x-y)*cos(e);
    vec.z = x*sin(c) - (y*y-z)*cos(f);
    return vec;
  }
);