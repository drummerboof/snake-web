module('PowerUps View', {

    setup: function () {
        this.model = new Backbone.Model();
        this.powerUps = new Snake.Views.PowerUps({
            el: '#qunit-test',
            model: this.model
        });
    },

    teardown: function () {
        $('#qunit-test').empty();
    }
});

test('when the change event of the model is fired render() is called', function () {
    sinon.stub(this.powerUps, 'render');
    this.model.trigger('change');
    ok(this.powerUps.render.calledOnce, 'render() was called once');
});

test('the power-ups are rendered with correctly', function () {
    var clock = sinon.useFakeTimers(4000),
        powerUps = [{
            id: 'powerup1',
            duration: 10000,
            applied: 3000
        }, {
            id: 'powerup2',
            duration: 5000,
            applied: 2000
        }],
        expectedRemaining = [9, 3];

    this.model.set({ powerUps: powerUps });

    equal(this.powerUps.$el.children('.player-powerup').length, 2, 'All power-ups are rendered');

    _.each(powerUps, function (data, index) {
        var powerUpEl = this.powerUps.$el.children('.' + data.id);
        equal(powerUpEl.find('.player-powerup-icon').length, 1, 'The icon should be rendered');
        equal(powerUpEl.find('.player-powerup-time').text(), expectedRemaining[index], 'The icon should be rendered');
    }, this);

    clock.restore();
});