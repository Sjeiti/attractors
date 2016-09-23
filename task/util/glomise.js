var glob = require('glob');
module.exports = function glomise(globstring) {
	return new Promise(function (resolve) {//reject
		glob(globstring,function(err,result){
			resolve(result);
		});
	});
};