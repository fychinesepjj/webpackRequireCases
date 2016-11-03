$(function () {
    require.ensure([], function(require) {
        $('#load_header').on('click', function() {
            var headerStr = require('__COMP__/header/header');
            $('#header').html(headerStr);
            $('#load_footer').on('click', function() {
                var footerStr = require('__COMP__/footer/footer');
                $('#footer').html(footerStr);
            });
        });
    });

});