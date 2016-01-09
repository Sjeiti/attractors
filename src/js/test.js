console.log('test');
var fs = require('fs')
    ,gm = require('gm')
	,PNG = require('pngjs2').PNG
	,random = Math.random
	,pow = Math.pow
	,vector = require('./vector.js')
	,attractor = require('./attractors.type.lorenz84.js')
	,p = vector(1E9,0,0)
	//
	,imageName = 'foo.png'
	//
	,iterations = 1E6
	,w = 200
	,h = 200
	,offsetX = 50
	,offsetY = 100
	,scale = 45
	,maxDistance = 100
	,gammaCorrection = 0.3
	//
	,pixels = (function(a,i){
			while (i--) a.push(0);
			return a;
		})([],w*h)
	//
	,i = iterations
;

console.log(
	'\t',p.toString()
	,'\t',attractor.name
);

//distribute(pixels,10,10);
//distribute(pixels,20.5,20.5);
//distribute(pixels,30.2,30.2);
//distribute(pixels,20.5,10.2);
//distribute(pixels,10.6,20.2);

// iterate
var t = Date.now();
while (i--) {
	attractor(p);
	distribute(
		pixels
		,offsetX+scale*p.x
		,offsetY+scale*p.y
	);
	p.size>maxDistance&&p.set(random(),random(),random());
}
console.log('redraw',Date.now()-t); // todo: remove log

// write
gm(w,h,'#000000').write(imageName,function(err){
	if (!err) {
		fs.createReadStream(imageName)
			.pipe(new PNG({
				filterType: 4
				,width: w
				,height: h
			}))
			.on('parsed', function() {
				// highest
				var data = this.data
					,highest = 0
					,pixel, color;
				i = pixels.length;
				while (i--) {
					pixel = pixels[i];
					if (pixel>highest) highest = pixel;
				}
				// write
				i = w*h*4;
				while (i--) {
					color = 255*pow(pixels[i]/highest, gammaCorrection)<<0;
					data[4*i] =   color;
					data[4*i+1] = color;
					data[4*i+2] = color;
					data[4*i+3] = 255;
				}
				this.pack().pipe(fs.createWriteStream(imageName));
			});
	} else {
		console.warn(err);
	}
});

function distribute(a,x,y){
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
	//if (floorY<h/2) {
	//	// normally
	//	if (floorX>=0 && floorX<w && floorY>=0 && floorY<h) pixels[pos00] += 1;
	//} else {
	// aliasing
	/*if (floorX>=0&&floorX<w&&floorY>=0&&floorY<h) pixels[pos00] += fx0*fy0;
	if (floorX>0&&floorX<=w&&floorY>=0&&floorY<h) pixels[pos10] += fx1*fy0;
	if (floorX>=0&&floorX<w&&floorY>0&&floorY<=h) pixels[pos01] += fx0*fy1;
	if (floorX>0&&floorX<=w&&floorY>0&&floorY<=h) pixels[pos11] += fx1*fy1;*/
	if (floorX>=0&&floorX<(w-1)&&floorY>=0&&floorY<(h-1)) {
		a[pos00] += fx0*fy0;
		a[pos10] += fx1*fy0;
		a[pos01] += fx0*fy1;
		a[pos11] += fx1*fy1;
	}
}