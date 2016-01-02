module.exports = (function(){
	var name = 'Lorenz 84'
		,defaultConstants = [
			 -1.2346115
			,0.6818416
			,-0.9457178
			,0.48372614
			,-0.355516
		]
		,constants = defaultConstants.slice(0);
	constants.reset = resetConstants;
	function iterate(vec){
		var x = vec.x
			,y = vec.y
			,z = vec.z
			,xx = x + constants[4]*( - constants[0]*x - y*y - z*z + constants[0]*constants[2])
			,yy = y + constants[4]*( - y + x*y - constants[1]*x*z + constants[3])
			,zz = z + constants[4]*( - z + constants[1]*x*y + x*z);
		vec.x = xx;
		vec.y = yy;
		vec.z = zz;
		return vec;
	}
	function resetConstants(){
		for (var i=0,l=constants.length;i<l;i++) constants[i] = defaultConstants[i];
	}
	Object.defineProperty(iterate, 'name', { get: function(){return name;}});
	Object.defineProperty(iterate, 'constants', { get: function(){return constants;}});
	return iterate;
})();
