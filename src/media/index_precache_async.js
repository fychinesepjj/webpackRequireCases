$(function () {
    require.ensure(['__COMP__/header/header'], function(require) {
        $('#load_header').on('click', function() {
            var headerStr = require('__COMP__/header/header');
            $('#header').html(headerStr);
        });
    });
    
    require.ensure(['__COMP__/footer/footer'], function(require) {
        $('#load_footer').on('click', function() {
            var footerStr = require('__COMP__/footer/footer');
            $('#footer').html(footerStr);
        });
    });
});