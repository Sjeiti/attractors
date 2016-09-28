iddqd.ns('attractors',(function(){
  var list = []
    ,attractor;

  /**
   * Init all the things
   */
  function init(){
    initCurrentAttractor();
    attractors.three.init();
    attractors.animate();
    attractors.ui();
    attractors.location();
    attractors.event.TYPE_CHANGED.add(index=>attractor=list[index],null,1);
  }

  /**
   * Initialises the first attractor.
   * Looks at location.hash or simply takes the first from the array.
   */
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

  /**
   * Attractor initialisation method
   * @param {String} name
   * @param {Number[]} constants
   * @param {Function} iterate
   * @param {Number} scale
   */
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
          if (len===0)       fn = v=>iterate(v);
          else if (len===1)  fn = v=>iterate(v,c[0]);
          else if (len===2)  fn = v=>iterate(v,c[0],c[1]);
          else if (len===3)  fn = v=>iterate(v,c[0],c[1],c[2]);
          else if (len===4)  fn = v=>iterate(v,c[0],c[1],c[2],c[3]);
          else if (len===5)  fn = v=>iterate(v,c[0],c[1],c[2],c[3],c[4]);
          else if (len===6)  fn = v=>iterate(v,c[0],c[1],c[2],c[3],c[4],c[5]);
          else if (len===7)  fn = v=>iterate(v,c[0],c[1],c[2],c[3],c[4],c[5],c[6]);
          else if (len===8)  fn = v=>iterate(v,c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7]);
          else if (len===9)  fn = v=>iterate(v,c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8]);
          else if (len===10) fn = v=>iterate(v,c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8],c[9]);
          return fn;
        })(constants)
    ;
    scale = scale||200;
    Object.defineProperty(creation, 'name',         { get: ()=>name });
    Object.defineProperty(creation, 'constants',    { get: ()=>constants });
    Object.defineProperty(creation, 'scale',        { get: ()=>scale });
    Object.defineProperty(creation, 'constantSize', { get: ()=>maxConstant });
    constants.reset = resetConstants;
    function resetConstants(){
      for (var i=0,l=constants.length;i<l;i++) constants[i] = defaultConstants[i];
    }
    list.push(creation);
  }

  Object.defineProperty(init, 'attractor', {
    get: ()=>attractor
  });
  Object.defineProperty(init, 'list', {
    get: ()=>list
  });

  return iddqd.extend(init,{
    create: create
    ,version: '1.0.36-beta'
  });
})());