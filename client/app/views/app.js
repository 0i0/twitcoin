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
                this.$el.html(this.appTemplate({}));
                this.bindUI();
                this.bindActions();
            },

            bindUI : function(){
                this.elements = {
                    all: this.$('#all_my_twits')
                    ,send: this.$('#send')
                    ,to:    this.$('input[name="to"]')
                    ,amount:    this.$('input[name="amount"]')
                };
            },

            bindActions : function(){
                this.elements.all.on('click', this.proxy(function(e) {
                    location.replace('/twitter/balance/'+session.username)
                    return false;
                }));
                this.elements.send.on('click', this.proxy(function(e) {
                    $.ajax({
                        url:'/twitter/send/'+this.elements.to.val()+'/'+this.elements.amount.val()
                        ,success:function(data){console.log(data)}
                        ,error:function(data){console.log(data)}
                    })
                }));
            }
        });

        return App;
    }
);
