iddqd.ns('attractors.image',(function(){

  var event = attractors.event
    ,util = attractors.util
    ,wait = util.wait
    ,getMax = util.getMax
    ,getMin = util.getMin
    ,hslToRgb = util.hslToRgb
    //
    ,coloration
    ,foregroundColor
    ,backgroundColor
    ,gammaValue = 0.4
    //
    ,canvasBackground = document.createElement('canvas')
    ,contextBackground = canvasBackground.getContext('2d')
    //
    ,canvasAttractor = document.createElement('canvas')
    ,contextAttractor = canvasAttractor.getContext('2d')
    //
    ,canvasColor = document.createElement('canvas')
    ,contextColor = canvasColor.getContext('2d')
    //
    ,canvasCode = document.createElement('canvas')
    ,contextCode = canvasCode.getContext('2d')
    //
    ,canvasSurface = document.createElement('canvas')
    //,contextSurface = canvasSurface.getContext('2d')
    //
    ,chars = 'abcdefghijklmnopqrstuvwxyz 01234567890-,.'.split('')
  ;

  event.IMAGE_RESIZE.add(onImageResize);
  //
  event.COLORATION_CHANGED.add(val=>console.log('clrchanged',val));
  event.COLOR_BACKGROUND_CHANGED.add(val=>console.log('bgchanged',val));
  event.COLOR_FOREGROUND_CHANGED.add(val=>console.log('fgchanged',val));
  event.COLORATION_CHANGED.add(val=>coloration = val);
  event.COLOR_BACKGROUND_CHANGED.add(val=>foregroundColor = val);
  event.COLOR_FOREGROUND_CHANGED.add(val=>backgroundColor = val);
  //
  event.IMAGE_GAMMA_CHANGED.add(onImageGammaChanged);
  event.ANIMATION_DONE.add(onAnimationFinished);

  function onImageResize(w,h){
    canvasBackground.width = canvasAttractor.width = canvasColor.width = canvasSurface.width = w;
    canvasBackground.height = canvasAttractor.height = canvasColor.height = canvasSurface.height = h;
  }

  function onAnimationFinished(){
    var frames = attractors.animate.frames
      ,w
      ,h;
    //
    var images = (function (a) {
        frames.forEach(function (src) {
          var img = document.createElement('img');
          img.setAttribute('src',src);
          a.push(img);
          if (w===undefined) w = img.width;
          if (h===undefined) h = img.height;
        });
        return a;
      })([]);
    wait().then(function(){
      // gif
      gifshot.createGIF({
        gifWidth: w
        ,gifHeight: h
        ,images: images
        ,interval: 0.04
      },function (obj) {
        if (!obj.error) {
          var image = obj.image;
          event.ANIMATION_DRAWN.dispatch(image);
        }
      });
    });
    //
    var encoder = new Whammy.Video();//25
    frames.forEach(encoder.add.bind(encoder));
    encoder.compile(false,event.ANIMATION_DRAWN_WEBM.dispatch);
  }

  function onImageGammaChanged(f){
    gammaValue = f;
  }

  function colorHexSplit(hex){
    return [
      parseInt(hex.substr(1,2),16)/255
      ,parseInt(hex.substr(3,2),16)/255
      ,parseInt(hex.substr(5,2),16)/255
    ];
  }

  function draw(w,h,colorAt,colorBg,radial,result){
    var pixels = result[0]
      ,spaces = result[1]
      ,distances = result[2]
      ,lyapunovs = result[3]
      ,surfaces = result[4]
      ,hasSpaces = spaces!==undefined
      ,hasDistances = distances!==undefined
      ,hasLyapunovs = lyapunovs!==undefined
      ,hasSurfaces = surfaces!==undefined
      ,colorAtO = colorHexSplit(colorAt)
      ,colorBgO = colorHexSplit(colorBg)
      ,isBgLighter = colorBgO.reduce(function(a,b){return a+b;},0)>colorAtO.reduce(function(a,b){return a+b;},0)
      //
      ,imagedataAttractor = new ImageData(w,h)
      ,dataAttractor = imagedataAttractor.data
      //
      ,imagedataColor = new ImageData(w,h)
      ,dataColor = imagedataColor.data
      //
      ,imagedataSurface = new ImageData(w,h)
      ,dataSurface = imagedataSurface.data
      //
      ,max = getMax(pixels)
      ,maxS = hasSpaces&&getMax(spaces)
      ,maxD = hasDistances&&getMax(distances)
      ,minD = hasDistances&&getMin(distances)
      ,maxL = hasLyapunovs&&getMax(lyapunovs)
      ,minL = hasLyapunovs&&getMin(lyapunovs)
      ,maxC = hasSurfaces&&getMax(surfaces)
      ,minC = hasSurfaces&&getMin(surfaces)
      ,i = pixels.length
    ;
    //
    /*distances.forEach(function(val,j){
      if (val===0) distances[j] = maxD;
    });
    minD = getMin(distances);*/
    //
    onImageResize(w,h);
    //
    setBackground(w,h,colorBg,radial);
    //
    //
    while (i--) {
      //dataAttractor[4*i+3] = Math.pow(distances[i]/maxD,gammaValue)*255<<0;
      dataAttractor[4*i+3] = Math.pow(pixels[i]/max,gammaValue)*255<<0;
      //
      var rgb;
      if (hasSpaces) {
        //dataColor[4*i+0] = spaces[3*i+0]/maxS*255<<0;
        //dataColor[4*i+1] = spaces[3*i+1]/maxS*255<<0;
        //dataColor[4*i+2] = spaces[3*i+2]/maxS*255<<0;
        var gammaSpace = 0.9
          ,gt = 1.6;
        dataColor[4*i+0] = gt*Math.pow(spaces[3*i+0]/maxS,gammaSpace)*255<<0;
        dataColor[4*i+1] = gt*Math.pow(spaces[3*i+1]/maxS,gammaSpace)*255<<0;
        dataColor[4*i+2] = gt*Math.pow(spaces[3*i+2]/maxS,gammaSpace)*255<<0;
        //gammaValue
      } else if (hasDistances&&hasLyapunovs) {
        rgb = hslToRgb((distances[i]-minD)/(maxD-minD),(lyapunovs[i]-minL)/(maxL-minL),0.5);
        dataColor[4*i+0] = rgb[0];
        dataColor[4*i+1] = rgb[1];
        dataColor[4*i+2] = rgb[2];
      } else if (hasDistances) {
        rgb = hslToRgb((distances[i]-minD)/(maxD-minD),1,0.5);
        dataColor[4*i+0] = rgb[0];
        dataColor[4*i+1] = rgb[1];
        dataColor[4*i+2] = rgb[2];
      } else if (hasLyapunovs) {
        rgb = hslToRgb((lyapunovs[i]-minL)/(maxL-minL),1,0.5);
        dataColor[4*i+0] = rgb[0];
        dataColor[4*i+1] = rgb[1];
        dataColor[4*i+2] = rgb[2];
      }
      //
      //
      //
      //
      //
      /// is disabled
      if (hasSurfaces) {
        var px = i+1
          ,py = i+w
          ,clr = 0
        ;
        if (px<pixels.length&&py<pixels.length) {
          var dx = surfaces[i] - surfaces[px];
          var dy = surfaces[i] - surfaces[py];
          if (!isNaN(dx)&&!isNaN(dy)) {
            clr = Math.max(0,255-(dx*dy*50<<0));
          }
        }
        clr = 255-(surfaces[i]-minC)/(maxC-minC)*255<<0;
        if (isNaN(clr)) clr = 0;
        dataSurface[4*i+0] = clr;
        dataSurface[4*i+1] = clr;
        dataSurface[4*i+2] = clr;
        dataSurface[4*i+3] = 255;
      }
      ///
      //
      //
      //
      //
      //
      //
      //hasDistances&&(dataColor[4*i+0] = 255-(distances[i]-minD)/(maxD-minD)*255<<0);//Math.pow((distances[i]-minD)/(maxD-minD),gammaValue)*255<<0;
      //hasLyapunovs&&(dataColor[4*i+1] = (lyapunovs[i]-minL)/(maxL-minL)*255<<0);//Math.pow((lyapunovs[i]-minL)/(maxL-minL),gammaValue)*255<<0;
      //hasSurfaces&&(dataColor[4*i+2] = 255-(surfaces[i]-minC)/(maxC-minC)*255<<0);
      dataColor[4*i+3] = 255;//Math.pow((lyapunovs[i]-minL)/(maxL-minL),gammaValue)*255<<0;
      //Math.random()<.001&&console.log(pixels[i]/max,distances[i]);
    }
    contextAttractor.putImageData(imagedataAttractor,0,0);
    contextAttractor.globalCompositeOperation = 'source-in';
    contextAttractor.fillStyle = colorAt;
    contextAttractor.fillRect(0,0,w,h);
    //
    if (hasSpaces) {
      contextColor.putImageData(imagedataColor,0,0);
      contextAttractor.globalCompositeOperation = 'source-in';
      contextAttractor.drawImage(canvasColor,0,0);
    }
    //
    /*if (hasSpaces) {
      document.body.appendChild(canvasColor);
      canvasColor.style.position = 'absolute';
      canvasColor.style.top = '0';
      canvasColor.style.right = '0';
    }*/
    //
    //contextColor.putImageData(imagedataColor,0,0);
    ////contextColor.globalAlpha  = hasDistances||hasLyapunovs||hasSurfaces?0.5:1;
    ////contextColor.globalCompositeOperation = 'screen';
    ////contextColor.fillStyle = colorAt;
    ////contextColor.fillRect(0,0,w,h);
    //contextAttractor.globalCompositeOperation = 'source-in';
    //contextAttractor.drawImage(canvasColor,0,0);
    //
    //
    // draw attractor onto bg
    contextBackground.globalCompositeOperation = isBgLighter?'multiply':'screen';
    contextBackground.drawImage(canvasAttractor,0,0);
    //
    // draw code onto bg
    setCode(w,contextBackground.getImageData(0,0,1,1).data);
    contextBackground.globalCompositeOperation = 'source-over';
    contextBackground.drawImage(canvasCode,0,0);
    //
    //
    //
    ///
    /*if (hasSurfaces) {
      contextSurface.putImageData(imagedataSurface,0,0);
      contextBackground.drawImage(canvasSurface,0,0);
      document.body.appendChild(canvasSurface);
      canvasSurface.style.position = 'absolute';
      canvasSurface.style.top = '0';
      canvasSurface.style.right = '0';
    }*/
    ///
    //
    //
    //
    ///////////////////////////////////////////////////////
    // calc range
    /*i = 256;
    var red = [], green = [], blue = [];
    while (i--) red[i] = green[i] = blue[i] = 0;
    i = pixels.length;
    while (i--) {
      red[255-(distances[i]-minD)/(maxD-minD)*255<<0]++;
      green[(lyapunovs[i]-minL)/(maxL-minL)*255<<0]++;
      blue[255-(surfaces[i]-minC)/(maxC-minC)*255<<0]++;
    }
    red[0] = green[0] = blue[0] = 0;
    var redMax =Math.max.apply(Math,red), greenMax = Math.max.apply(Math,green), blueMax = Math.max.apply(Math,blue);
    //contextBackground.globalAlpha = 0.5;
    contextBackground.globalCompositeOperation = 'lighter';//'source-over';
    [{color:red,max:redMax,hex:'#FF0000'},{color:green,max:greenMax,hex:'#00FF00'},{color:blue,max:blueMax,hex:'#0000FF'}].forEach(function(o){
      i = 256;
      while (i--) {
        var hh = (o.color[i]/o.max*255)<<0;
        contextBackground.fillStyle = o.hex;
        contextBackground.fillRect(i,256-hh,1,hh);
      }
    });*/
    ///////////////////////////////////////////////////////
    //
    event.IMAGE_DRAWN.dispatch(canvasBackground);
  }

  function setBackground(w,h,colorBg,radial){
    if (radial) {
      var radius = Math.sqrt(w*w+h*h)
        ,darken = 0.1
        ,color = '#'+[
          parseInt(colorBg.substr(1,2),16)*darken<<0
          ,parseInt(colorBg.substr(3,2),16)*darken<<0
          ,parseInt(colorBg.substr(5,2),16)*darken<<0
        ].map(function(i){
            var s = i.toString(16);
          return (s.length===1?'0':'')+s;
        }).join('')
        ,gradient = contextBackground.createRadialGradient(w/2,h/2,radius,w/2,h*0.75,0);
      gradient.addColorStop(0,color);
      gradient.addColorStop(1,colorBg);
      contextBackground.fillStyle = gradient;
      contextBackground.fillRect(0,0,w,h);
    } else {
      contextBackground.fillStyle = colorBg;
      contextBackground.fillRect(0,0,w,h);
    }
  }

  function setCode(w,colorBg){
    var delimiter = chars[0]+chars[0]
      ,decodeList = (delimiter+decodeURIComponent(location.hash).substr(1).toLowerCase()+delimiter).split('')
      ,intResult = (function(a){
        decodeList.forEach(function(char){
          a.push(chars.indexOf(char));
        });
        return a;
      })([])
      ,pad2 = '00'
      ,oct = intResult.map(function(i){
        var bin = i.toString(8);
        return pad2.substring(0, pad2.length - bin.length) + bin;
      }).join('').split('').map(function(s){
        return parseInt(s,10);
      })
      ,octNum = oct.length
      ,imgH = Math.ceil(octNum/w)
      ,i = octNum
      ,imagedataCode = new ImageData(w,imgH)
      ,dataCode = imagedataCode.data
    ;
    canvasCode.width = w;
    canvasCode.height = imgH;
    //
    while (i--) {
      var multiplier = 4
        ,margin = 8*multiplier
        ,colorBgR = colorBg[0]/255
        ,colorBgG = colorBg[1]/255
        ,colorBgB = colorBg[2]/255
        ,subtract = 85*(colorBgR+colorBgG+colorBgB)>(255-margin)?-margin:0
        ,code = multiplier*oct[i]
      ;
      dataCode[4*i]   = (colorBgR*255<<0) + code + subtract;
      dataCode[4*i+1] = (colorBgG*255<<0) + code + subtract;
      dataCode[4*i+2] = (colorBgB*255<<0) + code + subtract;
      dataCode[4*i+3] = 255;
    }
    contextCode.putImageData(imagedataCode,0,0);
    return oct;
  }

  function read(image){
    var canvas = document.createElement('canvas')
      ,context = canvas.getContext('2d')
      ,w = image.naturalWidth||image.width
      ,h = image.naturalHeight||image.height
      ,imageData = (function(){
        event.IMAGE_RESIZE.dispatch(w,h);
        canvas.width = w;
        canvas.height = h;
        context.drawImage(image,0,0);
        return context.getImageData(0,0,w,h);
      })()
      ,data = imageData.data
      ,baseR = data[0]
      ,baseG = data[1]
      ,baseB = data[2]
      ,multiplier = 4
      ,result = []
      ,fourzero = 0
      //
      ,doubled
      ,constants;
    for (var i=0,l=data.length;i<l;i+=4) {
      var r = (data[i]-baseR)/multiplier
        ,g = (data[i+1]-baseG)/multiplier
        ,b = (data[i+2]-baseB)/multiplier
        ,rgb = Math.round((r+g+b)/3);
      result.push(rgb);
      fourzero = rgb===0&&i>4?fourzero+1:0;
      if (fourzero===4) break;
    }
    doubled = result.join('').match(/.{1,2}/g).map(function(s){
      var n = parseInt(s,8);
      return chars[n%chars.length];
    }).join('');
    constants = doubled.substr(2,doubled.length-4).split(',');
    return {
      name: constants.shift()
      ,constants: constants.map(function(s){return parseFloat(s);})
    };
  }

  return {
    draw: draw
    ,read: read
  };
})());