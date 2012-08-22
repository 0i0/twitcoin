define([
    'jquery',
    'jquery-ui',
    'underscore',
    'backbone',

    'text!views/app.html',
    ],
    function($,QUI, _, Backbone
            , AppMarkup){

        var App = Backbone.View.extend({
            alter:1,
            appTemplate : _.template(AppMarkup),
            initialize : function(){
            },

            render : function(){
                window.counter = 0
                this.$el.html(this.appTemplate({}));
            },

            bindUI : function(){
                this.elements = {
                    header     : this.$('#w-header'),
                    editor     : this.$('#w-editor'),
                    stream     : this.$('#w-stream'),
                    filter     : this.$('#w-filter'),
                    powerdby     : this.$('#w-powerdby'),
                };
            },

            bindActions : function(){
                this.on('compile.error',this.sendMessage,this);
                // this.elements.sendBtn.on('click', this.proxy(function(e) {
                //     this.trigger('send.click')
                // }));
            }
        });

        return App;
    }
);
