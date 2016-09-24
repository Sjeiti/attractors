attractors.create(
  'Rossler'
  ,[0.2,0.2,5.7,0.0085]
  ,function(vec,a,b,c,d){
    var x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = x + d * ( - y - z);
    vec.y = y + d * (x + a*y);
    vec.z = z + d * (b + z*(x-c));
    return vec;
  }
  ,40
);