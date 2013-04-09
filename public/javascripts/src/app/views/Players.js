Snake.Views.Players = (function () {

    var Players = Backbone.View.extend({

        el: '#players',

        initialize: function (options) {
            this.template = Handlebars.templates.player;
            this.model.on('reset', function () {
                this.render();
            }, this);
        },

        render: function () {
            this.$el.empty();
            this.model.each(function (player) {
                this.$el.append(this.template(_.extend({}, player.toJSON(), {
                    status: player.get('alive') ? 'alive' : 'dead'
                })));
            }, this);
            return this;
        }

    });

    return Players;
}());