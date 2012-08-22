require.config({
    paths: {
        jquery: '/libs/jquery/jquery-min',
        'jquery-ui': '/libs/jquery/jquery-ui',
        underscore: '/libs/underscore/underscore',
        backbone: '/libs/backbone/backbone',
        text: '/libs/require/text',
    },
    waitSeconds:15
});

require([
  'underscore',
  'backbone',
  'views/app',
  'framework/channel'
  ],
  function(_, Backbone, App, Channel){
    $(function(){
      var app = new App()
      //, channel = new Channel()
      app.session = {
        user:{
          name:'visitor'
        }
      }
      window.app = app;

      //window.channel = channel;

      //channel.start();

      $('#app-wrapper').append(app.$el)
      app.render()
    });
  }
);


