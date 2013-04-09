window.Snake = _.extend({}, Backbone.Events);
window.Snake.Views = {};
window.Snake.Models = {};
window.Snake.Collections = {};

$(document).ready(function () {

    window.app = new Snake.Views.Game({
        io: io
    });
});