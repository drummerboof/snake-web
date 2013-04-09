Snake.Models.Game = (function () {

    var statics = {
        STATUS_PLAYING: 'playing',
        STATUS_PAUSED: 'paused',
        STATUS_OVER: 'over'
    };

    var Game = Backbone.Model.extend({

        respawnTime: 3000,

        socketEvents: [
            'connect:success',
            'connect:error',
            'game:tick',
            'game:over',
            'game:start:success',
            'game:pause:success',
            'game:reset:success',
            'game:start:error',
            'player:respawn:success',
            'player:join:success',
            'player:leave:success',
            'player:join:error'
        ],

        directions: ['north', 'south', 'east', 'west'],

        initialize: function (attributes, options) {
            this.socket = options.socket;
            this._initializeSocket();
        },

        _initializeSocket: function () {
            _.each(this.socketEvents, function (event) {
                this.socket.on(event, _.bind(function (data) {
                    data = data || {};
                    if (event !== 'game:tick') {
                        console.log('received', event, data);
                    }
                    if (data.game) {
                        this.set(data.game);
                    }
                    if (event.indexOf(':error') > 0 && data.message) {
                        Snake.trigger('error:flash', data.message, 2000);
                    }
                    this.trigger(event, data);
                }, this));
            }, this);
        },

        respawn: function () {
            this.send('player:respawn');
        },

        play: function () {
            this.send('game:start');
        },

        pause: function () {
            this.send('game:pause');
        },

        toggleStatus: function () {
            this.isRunning() ? this.pause() : this.play();
        },

        reset: function () {
            this.send('game:reset');
        },

        join: function (name) {
            this.send('player:join', { name: name });
        },

        sendPlayerDirection: function (direction) {
            this.send('player:command', { direction: direction });
        },

        isRunning: function () {
            return this.get('status') === 'playing';
        },

        send: function (message, data) {
            this.socket.emit(message, data);
            console.log('sent', message, data);
        }
    }, statics);

    return Game;
}());