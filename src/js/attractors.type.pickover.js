attractors.create(
  'Pickover'
  ,[1.068107,-0.62762,0.64169,-1.60018]
  ,function(vec,a,b,c,d){
    var sin = Math.sin
      ,cos = Math.cos
      ,x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = sin(a*y)-z*cos(b*x);
    vec.y = z*sin(c*x)-cos(d*y);
    vec.z = sin(x);
    return vec;
  }
  ,400
);