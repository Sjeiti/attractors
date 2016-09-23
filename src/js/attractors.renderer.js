iddqd.ns('attractors.renderer',(function(undefined){
  var three = attractors.three
    ,iterate = three.iterate
    ,getColor = three.getColor
    ,point = three.point//new THREE.Vector3(0,0,0)
    ,random = attractors.util.random
    ,rndSize = 5
    //,animate = attractors.animate
    ,event = attractors.event
    //
    ,cameraRender
    //
    //
    ,isRendering = false
    ,cancelRenderRequest = false
  ;

  function render(w,h,iterations,calcSpace,calcDistance,calcLyapunov,calcSurface,frame,frames,start){
    //console.log('three.render',w,h,iterations,frame,frames); // todo: remove log
    isRendering = true;
    cameraRender = three.getCameraClone();
    cameraRender.aspect = w/h;
    cameraRender.updateProjectionMatrix();
    var numPixels = w*h
      ,pixels = (function(a,i){
          while (i--) a[i] = 0;
          return a;
        })([],numPixels)
      ,spaces = calcSpace?new Array(3*numPixels):undefined
      ,distances = calcDistance?new Array(numPixels):undefined
      ,lyapunovs = calcLyapunov?new Array(numPixels):undefined
      ,surfaces = calcSurface?new Array(numPixels):undefined
          ,p = new THREE.Vector3(random(rndSize),random(rndSize),random(rndSize))
        ,pLast = new THREE.Vector3(random(rndSize),random(rndSize),random(rndSize))
      ,pLyapunov = new THREE.Vector3(random(rndSize),random(rndSize),random(rndSize))
      ,batch = Math.pow(2,14)
      ,progressLast = 0
      ,t = start||Date.now()
      ,i = 100
    ;
    while (i--) iterate(p);
    return new Promise(function(resolve,reject){
      requestAnimationFrame(renderCycle.bind(null
          ,resolve
          ,reject
          ,pixels
          ,spaces
          ,distances
          ,lyapunovs
          ,surfaces
          ,w
          ,h
          ,iterations
          ,iterations
          ,batch
          ,p
          ,pLast
          ,pLyapunov
          ,progressLast
          ,t
          ,t
          ,frame
          ,frames
      ));
    });
  }

  function renderCycle(resolve
      ,reject
      ,pixels
      ,spaces
      ,distances
      ,lyapunovs
      ,surfaces
      ,w
      ,h
      ,iterations
      ,iteration
      ,batch
      ,p
      ,pLast
      ,pLyapunov
      ,progressLast
      ,t
      ,start
      ,frame
      ,frames
  ){
    var i = batch
      ,progress
      ,deltaT
      ,now
      ,position
      ,cameraPosition = cameraRender.position
      ,x
      ,y
      ,hasSpaces = spaces!==undefined
      ,hasDistances = distances!==undefined
      ,hasLyapunovs = lyapunovs!==undefined
      ,hasSurfaces = surfaces!==undefined
      ,pointx,pointy,pointz
    ;
    if (cancelRenderRequest===true) {
      cancelRenderRequest = false;
      isRendering = false;
      event.RENDER_CANCELED.dispatch();
    } else {
      while (i--) {
        if (lyapunovs!==undefined) {
          pLyapunov.x = p.x + 0.00001;
          pLyapunov.y = p.y + 0.00001;
          pLyapunov.z = p.z + 0.00001;
          iterate(pLyapunov);
        }
        //
        iterate(p);
        if (hasSpaces) {
          pointx = point.x;
          pointy = point.y;
          pointz = point.z;
        }
        position = point.project(cameraRender);
        x =  (position.x + 1)/2*w;
        y = -(position.y - 1)/2*h;
        //
        distribute(pixels,x,y,w,h,1);
        //
        // relative space, iteration distance, lyapunov exponent, camera distance
        hasSpaces&&distribute(spaces,x,y,w,h,getColor(pointx,pointy,pointz));
        hasDistances&&distribute(distances,x,y,w,h,p.distanceTo(pLast));
        hasLyapunovs&&distribute(lyapunovs,x,y,w,h,p.distanceTo(pLyapunov));
        if (hasSurfaces) {
          var index = (x<<0) + (y<<0)*w
            ,depthsNew = p.distanceTo(cameraPosition)
            ,depthsOld = surfaces[index];
          (depthsOld===undefined||depthsOld>depthsNew)&&(surfaces[index]=depthsNew);
        }
        //
        pLast.x = p.x;
        pLast.y = p.y;
        pLast.z = p.z;
      }
      iteration -= batch;
      //
      // prevent continuous dispatching by sending updates only per centage
      progress = 1-(iteration>0&&iteration/iterations||0);
      if (progressLast!==progress*100<<0) {
        event.RENDER_PROGRESS.dispatch(progress,start,frame,frames);
        progressLast = progress*100<<0;
      }
      //
      now = Date.now();
      deltaT = now-t;
      t = now;
      if (deltaT<60) batch *= 2;
      else batch = Math.ceil(batch/2);
      if (iteration>0) {
        requestAnimationFrame(renderCycle.bind(null,resolve,reject,pixels,spaces,distances,lyapunovs,surfaces,w,h,iterations,iteration,batch,p,pLast,pLyapunov,progressLast,t,start,frame,frames));
      } else {
        if (hasSpaces||hasDistances||hasLyapunovs) {
          i = w*h;
          while (i--) {
            var pixel = pixels[i];
            if (pixel!==0) {
              if (hasSpaces) {
                spaces[3*i] /= pixel;
                spaces[3*i+1] /= pixel;
                spaces[3*i+2] /= pixel;
              }
              hasDistances&&(distances[i] /= pixel);
              hasLyapunovs&&(lyapunovs[i] /= pixel);
              //depths[i] /= pixel;
            }
          }
        }
        resolve([pixels,spaces,distances,lyapunovs,surfaces]);
        isRendering = false;
        //event.RENDER_DONE.dispatch();
      }
    }
  }

  function cancelRender(){
    console.log('three.cancelRender'); // todo: remove log
    cancelRenderRequest = true;
  }

  function distribute(a,x,y,w,h,weight){
    var floorX = x<<0
      ,floorY = y<<0
      // 4x4 grid distribution
      ,fx1 = x - floorX
      ,fy1 = y - floorY
      ,fx0 = 1 - fx1
      ,fy0 = 1 - fy1
      // 4x4 grid positions
      ,pos00 = floorX + floorY*w
      ,pos10 = pos00 + 1
      ,pos01 = pos00 + w
      ,pos11 = pos01 + 1
    ;
    //if (floorX>=0&&floorX<(w-1)&&floorY>=0&&floorY<(h-1)) {
    if (floorX>=1&&floorX<(w-2)&&floorY>=1&&floorY<(h-2)) { // 1px from egdge otherwise spaces calculation weirds up over edges
      if (typeof weight==='number') {
        a[pos00] = (a[pos00]||0) + weight*fx0*fy0;
        a[pos10] = (a[pos10]||0) + weight*fx1*fy0;
        a[pos01] = (a[pos01]||0) + weight*fx0*fy1;
        a[pos11] = (a[pos11]||0) + weight*fx1*fy1;
      } else {
        a[pos00*3] = (a[pos00*3]||0) + weight[0]*fx0*fy0;
        a[pos10*3] = (a[pos10*3]||0) + weight[0]*fx1*fy0;
        a[pos01*3] = (a[pos01*3]||0) + weight[0]*fx0*fy1;
        a[pos11*3] = (a[pos11*3]||0) + weight[0]*fx1*fy1;
        //
        a[pos00*3+1] = (a[pos00*3+1]||0) + weight[1]*fx0*fy0;
        a[pos10*3+1] = (a[pos10*3+1]||0) + weight[1]*fx1*fy0;
        a[pos01*3+1] = (a[pos01*3+1]||0) + weight[1]*fx0*fy1;
        a[pos11*3+1] = (a[pos11*3+1]||0) + weight[1]*fx1*fy1;
        //
        a[pos00*3+2] = (a[pos00*3+2]||0) + weight[2]*fx0*fy0;
        a[pos10*3+2] = (a[pos10*3+2]||0) + weight[2]*fx1*fy0;
        a[pos01*3+2] = (a[pos01*3+2]||0) + weight[2]*fx0*fy1;
        a[pos11*3+2] = (a[pos11*3+2]||0) + weight[2]*fx1*fy1;
      }
    }
  }

  return {
    render: render
    ,cancelRender: cancelRender
    ,get rendering() { return isRendering; }
  };
})());