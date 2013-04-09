Snake.Views.PowerUps = (function () {

    var PowerUps = Backbone.View.extend({

        el: '#powerups',

        initialize: function (options) {
            this.template = Handlebars.templates.powerup;
            this.powerUps = new Backbone.Collection();
            this.powerUps.on('reset', function () {
                this.render();
            }, this);
            this.model.on('change', this._onModelChange, this);
        },

        render: function () {
            this.$el.empty();
            this.powerUps.each(function (powerUp) {
                this.$el.append(this.template(_.extend({}, powerUp.toJSON(), {
                    remaining: Math.ceil((powerUp.get('duration') + (powerUp.get('applied') - Date.now())) / 1000)
                })));
            }, this);
            return this;
        },

        _onModelChange: function () {
            this.powerUps.reset(this.model.get('powerUps'));
        }
    });

    return PowerUps;
}());