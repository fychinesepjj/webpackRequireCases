module.exports = function (){
    require('__JS__/utils');
    require('./header.scss');
    var template = require('template');
    var source = require('./header.tpl');
    var render = template.compile(source);
    var html = render({
        'title': 'render by header'
    });
    return html;
}();