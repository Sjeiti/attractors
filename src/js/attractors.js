iddqd.ns('attractors',(function(){
  var list = []
    ,attractor
    ,event;

  function init(){
    //
    initCurrentAttractor();
    //
    event = attractors.event;
    attractors.three.init();
    attractors.animate();
    attractors.ui();
    attractors.location();
    event.TYPE_CHANGED.add(onTypeChanged,null,1);
  }

  function initCurrentAttractor(){
    var hash = location.hash;
    if (hash!=='') {
      var hashList = decodeURIComponent(hash.substr(1)).split(/,/g)
        ,name = hashList.shift()
        ,constants = hashList.map(parseFloat);
      list.forEach(function(attr){
        if (attr.name===name) {
          attractor = attr;
          constants.forEach(function(val,i){
            attractor.constants[i] = val;
          });
        }
      });
    }
    if (attractor===undefined) attractor = list[0];
  }

  Object.defineProperty(init, 'attractor', {
    get: function () { return attractor;}
    //,set: function (fn) { attractor = fn;}
  });

  function create(name,constants,iterate,scale){
    var defaultConstants = constants.slice(0)
      ,maxConstant = (function(max){
        defaultConstants.forEach(function(i){
          var abs = Math.abs(i);
          if (abs>max) max = abs;
        });
        return max;
      })(0)
      ,creation = (function(c){
        var len = c.length
          ,fn = function(){};
        if (len===0) fn = function(v){iterate(v);};
        else if (len===1) fn = function(v){iterate(v,c[0]);};
        else if (len===2) fn = function(v){iterate(v,c[0],c[1]);};
        else if (len===3) fn = function(v){iterate(v,c[0],c[1],c[2]);};
        else if (len===4) fn = function(v){iterate(v,c[0],c[1],c[2],c[3]);};
        else if (len===5) fn = function(v){iterate(v,c[0],c[1],c[2],c[3],c[4]);};
        else if (len===6) fn = function(v){iterate(v,c[0],c[1],c[2],c[3],c[4],c[5]);};
        else if (len===7) fn = function(v){iterate(v,c[0],c[1],c[2],c[3],c[4],c[5],c[6]);};
        else if (len===8) fn = function(v){iterate(v,c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7]);};
        else if (len===9) fn = function(v){iterate(v,c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8]);};
        return fn;
      })(constants)
    ;
    scale = scale||200;
    Object.defineProperty(creation, 'name', { get: function(){return name;}});
    Object.defineProperty(creation, 'constants', { get: function(){return constants;}});
    Object.defineProperty(creation, 'scale', { get: function(){return scale;}});
    Object.defineProperty(creation, 'constantSize', { get: function(){return maxConstant;}});
    constants.reset = resetConstants;
    function resetConstants(){
      for (var i=0,l=constants.length;i<l;i++) constants[i] = defaultConstants[i];
    }
    list.push(creation);
  }

  function onTypeChanged(index){
    attractor = list[index];
  }

  return iddqd.extend(init,{
    create: create
    ,version: '1.0.29'
    ,get list() { return list; } // todo this works... but not as you'd expect (extend and getters on object literals)
    //,get attractor() { return attractor; }
  });
})());