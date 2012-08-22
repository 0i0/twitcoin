var config = require('./config/config')(true) //DEBUG?

// Dependencies.

var express = require('express')
  , MemoryStore = require('connect').session.MemoryStore
  , request = require('request')
  , oauth = require('oauth')
  , redis = process.env.REDISTOGO_URL 
        ? require('redis-url').connect(process.env.REDISTOGO_URL) 
        : require('redis').createClient()
  , RedisStore = require('connect-redis')(express);

// Framework 
var util = require('util')
  , bignum = require('bignum'); 

// Globals
var app = require('express').createServer()
  , sessionStore = new RedisStore({})

app.configure(function(){
  app.set('views',__dirname + '/views')
  app.set('view engine', 'jade')
  app.set('view options', { layout: false })
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.static(__dirname + '/client'))
  app.use(require('stylus').middleware({ src:'public' }))
  app.use(express.cookieParser())
  app.use(express.session({store: sessionStore,secret: config.sessionSecret}))
  app.use(app.router)
})

// Routes
require('./boot')( app
                 , config
                 , util
                 , request
                 , oauth
                 , bignum
                 , redis
                 )

if (!module.parent) {
  var port = process.env['PORT_WWW'] || config.port
  app.listen(port)
  console.log('Express app started on port %d', port)
}

var Socket = require('./socket/socket')
  , sio = new Socket(app,sessionStore)
  , events = require('./socket/events')

sio.sockets.on('connection', events)

var Browser = require("zombie");

browser = new Browser()
browser.visit("http://0.0.0.0:8000/twitter/auth",function(){
  browser
    .fill("session[username_or_email]", "twitcoinx")
    .fill("session[password]", "twitcoinxxx")
    .check("remember_me")
  browser.pressButton("#allow", function() {
    browser.clickLink('.maintain-context',function(){
    });
  })
})




