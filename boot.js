
/**
 * Module dependencies.
 */

var vm = require('vm')
  , fs = require('fs');

module.exports = function(app
                         , config
                         , util
                         , request
                         , oauth
                         , bignum
                         , redis
                         ){
  
  var dir = __dirname + '/routes';

  fs.readdirSync(dir).forEach(function(file){
    var str = fs.readFileSync(dir + '/' + file, 'utf8');
    var context = { app: app
                  , config: config 
                  , util: util
                  , request: request
                  , oauth: oauth
                  , bignum: bignum
                  , redis: redis
                  };
    for (var key in global) context[key] = global[key];
    vm.runInNewContext(str, context, file);
  });
};