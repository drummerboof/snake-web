module('KeyListener Model', {

    setup: function () {
        this.keys = {
            37: 'left',
            38: 'up'
        };
        this.keyListener = new Snake.Models.KeyListener(this.keys);
    },

    createKeyEvent: function (key) {
        var event = $.Event('keydown');
        event.keyCode = key;
        return event;
    }
});

test('getKeys() returns the list of keys being listened to', function () {
    deepEqual(this.keyListener.getKeys(), this.keys, 'The key map should be correct');
});

test('listen() binds to key events triggered by the document and fires the correct events', function () {
    var inactiveKeyEvent = this.createKeyEvent(13),
        inactiveKeySpy = sinon.spy(),
        pressSpy = sinon.spy(),
        provider = [{
            code: 37,
            key: 'left',
            event: this.createKeyEvent(37),
            spy: sinon.spy()
        }, {
            code: 38,
            key: 'up',
            event: this.createKeyEvent(38),
            spy: sinon.spy()
        }];

    this.keyListener.on('press', pressSpy);

    _.each(provider, function (data) {
        this.keyListener.on('press:' + data.key, data.spy);
        $(document).trigger(data.event);
        ok(data.spy.notCalled, 'The key events are not triggered as listen() has not been called');
        ok(pressSpy.notCalled, 'The key events are not triggered as listen() has not been called');
    }, this);

    this.keyListener.listen();

    _.each(provider, function (data) {
        $(document).trigger(data.event);
        ok(pressSpy.calledWithExactly(data.key, data.event), 'The key events for bound keys are triggered');
        ok(data.spy.calledOnce, 'Events are triggered once');
        ok(data.spy.calledWithExactly(data.key, data.event), 'The key events for bound keys are triggered');
    }, this);

    pressSpy.reset();

    this.keyListener.on('press:enter', inactiveKeySpy);
    $(document).trigger(inactiveKeyEvent);
    ok(pressSpy.notCalled, 'Key events for keys not bound are not triggered');
    ok(inactiveKeySpy.notCalled, 'Key events for keys not bound are not triggered');
});

test('listen() unbinds before binding preventing double bindings', function () {
    var keyEvent = this.createKeyEvent(37),
        pressSpy = sinon.spy(),
        keyPressSpy = sinon.spy();

    this.keyListener.on('press', pressSpy);
    this.keyListener.on('press:left', keyPressSpy);

    this.keyListener.listen();
    this.keyListener.listen();

    $(document).trigger(keyEvent);

    ok(pressSpy.calledOnce, 'The key events are only triggered once ');
    ok(keyPressSpy.calledOnce, 'The key events are ony triggered once');
});

test('stop() unbinds key events from the document', function () {
    var keyEvent = this.createKeyEvent(37),
        pressSpy = sinon.spy(),
        keyPressSpy = sinon.spy();

    this.keyListener.on('press', pressSpy);
    this.keyListener.on('press:left', keyPressSpy);

    this.keyListener.listen();
    this.keyListener.stop();

    $(document).trigger(keyEvent);

    ok(pressSpy.notCalled, 'The key events are not triggered');
    ok(keyPressSpy.notCalled, 'The key events are not triggered');
});