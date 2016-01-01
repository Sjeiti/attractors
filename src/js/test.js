console.log('test');
var fs = require('fs')
    ,gm = require('gm')
	,PNG = require('pngjs2').PNG
	,random = Math.random
	,vector = require('./vector.js')
	,attractor = require('./lorenz84.js')
	,p = vector(1E9,0,0)
	//
	,imageName = 'foo.png'
	//
	,iterations = 1E7
	,w = 200
	,h = 200
	,offsetX = 50
	,offsetY = 100
	,scale = 40 + 10*Math.random()
	,maxDistance = 100
	,gammaCorrection = 0.5
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

// iterate
while (i--) {
	attractor(p);
	// project
	var px = offsetX+scale*p.x
		,py = offsetY+scale*p.y
		,floorX = px<<0
		,floorY = py<<0
		,pixelPos = floorX + floorY*w;
	if (floorX>=0&&floorX<w&&floorY>=0&&floorY<h) {
		pixels[pixelPos] += 1;
	}
	//
	p.size>maxDistance&&p.set(random(),random(),random());
}

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
				var highest = 0
					,pixel, color;
				i = pixels.length;
				while (i--) {
					pixel = pixels[i];
					if (pixel>highest) highest = pixel;
				}
				// write
				i = w*h*4;
				while (i--) {
					color = 255*Math.pow(pixels[i]/highest, gammaCorrection)<<0;
					this.data[4*i] =   color;
					this.data[4*i+1] = color;
					this.data[4*i+2] = color;
					this.data[4*i+3] = 255;
				}
				this.pack().pipe(fs.createWriteStream('foo.png'));
			});
	}
});