var DEBUG = process.env.NODE_ENV != 'production';
console.log('DEBUG:' + DEBUG)

var express = require('express')
var sessionStore = new express.session.MemoryStore()
var app = express()

var globals =
  { app: app
  , config: require('./config')(DEBUG)
  , util: require('util')
  , request: require('request')
  , oauth: require('oauth')
  }

app.configure(function(){
  app.set('views',__dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.static(__dirname + '/client'))
  app.use(express.bodyParser())
  app.use(express.cookieParser())
  app.use(express.session(
    {store: sessionStore
    ,secret: globals.config.sessionSecret
    }
  ))
  app.use(app.router)
})

// Routes
require('./boot')(globals)

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});





