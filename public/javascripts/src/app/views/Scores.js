Snake.Views.Scores = (function () {

    var Scores = Backbone.View.extend({

        el: '#scores',

        initialize: function (options) {
            this.template = Handlebars.templates.scores;
            this.model.on('change:score', function () {
                this.render();
            }, this);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return Scores;
}());