module('Messages View', {

    setup: function () {
        this.messages = new Snake.Views.Messages({
            el: '#qunit-test'
        });
    },

    teardown: function () {
        $('#qunit-test').empty();
    }
});

test('render() displays the message correctly', function () {
    sinon.spy(this.messages,'clear');
    this.messages.render('Hi there', 'type');
    ok(this.messages.clear.calledOnce, 'The element content is cleared');
    ok(this.messages.$el.hasClass('visible'), 'The visible class is added');
    ok(this.messages.$el.hasClass('type'), 'The type class is added');
    equal($.trim(this.messages.$el.find('#message-inner').text()), 'Hi there', 'the message is displayed');
});

test('render() defaults to the class message when no type is given', function () {
    this.messages.render('Hi there');
    ok(this.messages.$el.hasClass('message'), 'The message class is added');
});

test('clear() empties out the el and removes all classes', function () {
    this.messages.render('Hi there');
    this.messages.clear();
    equal(this.messages.$el.attr('class'), '', 'The classes are removed');
    equal($.trim(this.messages.$el.html()), '', 'The element is emptied');
});

test('renderTemplate() renders a message based on a template', function () {
    this.messages.renderTemplate(function (data) {
        return 'Hi ' + data.name;
    }, { name: 'Bob' }, 'test');
    ok(this.messages.$el.hasClass('test'), 'The type class is added');
    equal($.trim(this.messages.$el.find('#message-inner').text()), 'Hi Bob', 'the template message is displayed');
});

test('flash() renders a message and then clears the content after the time specified', function () {
    var clock = sinon.useFakeTimers();
    sinon.spy(this.messages, 'render');

    this.messages.flash('Hi there', 2000, 'test');
    ok(this.messages.render.calledWithExactly('Hi there', 'test'), 'render() is called with the correct arguments');

    sinon.spy(this.messages, 'clear');
    clock.tick(2000);
    ok(this.messages.clear.calledOnce, 'clear() is called after the given time has elapsed');
});

test('flash() defaults to 3000 as the duration', function () {
    var clock = sinon.useFakeTimers();
    sinon.spy(this.messages, 'render');

    this.messages.flash('Hi there');

    sinon.spy(this.messages, 'clear');
    clock.tick(2900);
    ok(this.messages.clear.notCalled);
    clock.tick(3000);
    ok(this.messages.clear.calledOnce, 'clear() is called after the given time has elapsed');
});