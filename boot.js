var vm = require('vm')
  , fs = require('fs');

module.exports = function(context){
  var dir = __dirname + '/routes';
  fs.readdirSync(dir).forEach(function(file){
    var str = fs.readFileSync(dir + '/' + file, 'utf8');
    console.log('loading:' + file)
    for (var key in global) context[key] = global[key];
   	try{
   		vm.runInNewContext(str, context, file);
   	}catch(e){
   		var exception = 'faild loading:' + file
   		throw exception
   	}
  })
}