define([
    'jquery',
    'underscore',
    'backbone',
    ], function($, _, Backbone){

        var Channel = function(){
          return this;
        }
        Channel.prototype = _.extend(Backbone.Events, {
          initialize : function(){
            var geocoder = new google.maps.Geocoder();
            navigator.geolocation.getCurrentPosition(this.proxy(this.drawCenter));  
          },
          start:function(){
            
            //out going
            this.on('message.send',function(data){
              socket.emit('message.send',data);
            })


            //incomming
            socket.on('message.recieved',this.proxy(function (data) {
              this.trigger('message.recieved',data)
            }))
          }
        })            
        return Channel;
});


