var fs = require('fs')
	,gm = require('gm')
;
var src = './src/img/Lorenz 84.png'
	,HTML = './src/index.html'
	,HTMLSource = fs.readFileSync(HTML).toString()
	,linkMatch = HTMLSource.match(/<link\srel="(shortcut\sicon|apple-touch-icon)".*/g)
;
console.log('saving icons:');
linkMatch.forEach(function(link){
	var matchHref = link.match(/href="([^"]+)"/)
		,href = matchHref&&matchHref.pop()
		,matchSize = href&&href.match(/-(\d+x\d+)\.\w+/)
		,sizes = matchSize&&matchSize.pop().split('x').map(function(s){return parseInt(s,10);})
	;
	href&&sizes&&gm(src)
		.resize(sizes[0], sizes[1])
		.noProfile()
		.write('./src'+href, function (err) {
			if (err) console.warn(err);
			console.log('\t','./src/'+href);
		});
});