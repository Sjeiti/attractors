iddqd.ns('attractors.event',{
	//
	//
	TYPE_CHANGED: new signals.Signal()
	,CONSTANTS_CHANGED: new signals.Signal()
	//
	,SINES_CHANGED: new signals.Signal()
	//
	,RANGE_CHANGED: new signals.Signal()
	//
	,RENDER_PROGRESS: new signals.Signal()
	,RENDER_CANCELED: new signals.Signal()
	,RENDER_DONE: new signals.Signal()
	//
	,ANIMATION_START: new signals.Signal()
	,ANIMATION_FRAME: new signals.Signal()
	,ANIMATION_DONE: new signals.Signal()
	,ANIMATION_DRAWN: new signals.Signal()
	,ANIMATION_DRAWN_WEBM: new signals.Signal()
	//
	,IMAGE_RESIZE: new signals.Signal()
	,IMAGE_DRAWN: new signals.Signal()
	,IMAGE_GAMMA_CHANGED: new signals.Signal()
	//
	,COLOR_BACKGROUND_CHANGED: new signals.Signal()
	,COLOR_FOREGROUND_CHANGED: new signals.Signal()
	,COLOR_STATIC_CHANGED: new signals.Signal()
});