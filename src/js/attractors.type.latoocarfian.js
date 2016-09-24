attractors.create(
  'Latoocarfian'
  ,[1.2544194,1.1821778,1.0815392,1.3997533,-1.6979753,-2.0924227]
  ,function(vec,a,b,c,d,e,f){
    var sin = Math.sin
      ,x = vec.x
      ,y = vec.y
      ,z = vec.z;
    vec.x = sin(y*a) + d*sin(x*a);
    vec.y = sin(z*b) + e*sin(y*b);
    vec.z = sin(x*c) + f*sin(z*c);
    return vec;
  }
);