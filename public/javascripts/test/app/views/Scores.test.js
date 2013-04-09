module('Scores View', {

    setup: function () {
        this.model = new Backbone.Model();
        this.scores = new Snake.Views.Scores({
            el: '#qunit-test',
            model: this.model
        });
    },

    teardown: function () {
        $('#qunit-test').empty();
    }
});

test('when the score attribute of the model changes render() is called', function () {
    sinon.stub(this.scores, 'render');
    this.model.trigger('change:score');
    ok(this.scores.render.calledOnce, 'render() was called once');
});

test('the score is displayed when the view is rendered', function () {
    this.model.set({ score: 10 });
    equal(this.scores.$el.find('.value').html(), '10', 'The correct score is rendered');
});