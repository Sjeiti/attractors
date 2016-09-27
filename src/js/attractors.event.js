(function(signal){
  iddqd.ns('attractors.event',{
    //
    TYPE_CHANGED: signal()
    ,CONSTANTS_CHANGED: signal()
    //
    ,SINES_CHANGED: signal()
    //
    ,RANGE_CHANGED: signal()
    //
    ,RENDER_START: signal()
    ,RENDER_PROGRESS: signal()
    ,RENDER_CANCELED: signal()
    ,RENDER_DONE: signal()
    //
    ,ANIMATION_START: signal()
    ,ANIMATION_DONE: signal()
    ,ANIMATION_DRAWN: signal()
    ,ANIMATION_DRAWN_WEBM: signal()
    //
    ,IMAGE_RESIZE: signal()
    ,IMAGE_DRAWN: signal()
    ,IMAGE_RADIAL_CHANGED: signal()
    ,IMAGE_GAMMA_CHANGED: signal()
    ,IMAGE_SIZE_CHANGED: signal()
    //
    ,ITERATIONS_CHANGED: signal()
    //
    ,COLOR_BACKGROUND_CHANGED: signal()
    ,COLOR_FOREGROUND_CHANGED: signal()
    ,COLOR_STATIC_CHANGED: signal()
    ,COLORATION_CHANGED: new signals.Signal()//signal()
  });
})(()=>new signals.Signal());