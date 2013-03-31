Snake.Views.Players = (function () {

    var Players = Backbone.View.extend({

        el: '#players',

        events: {

        },

        initialize: function (options) {
            this.template = Handlebars.templates.player;
            this.model.on('reset', this.render, this);
        },

        render: function () {
            this.$el.empty();
            this.model.each(function (player) {
                var data = player.toJSON();
                data.status = data.alive ? 'active' : 'disabled';
                this.$el.append(this.template(player.toJSON()));
            }, this);
            return this;
        }
    });

    return Players;
}());