module.exports = function (){
    require('./header.scss');
    var template = require('template');
    var source = require('./header.tpl');
    var render = template.compile(source);
    var html = render({
        'title': 'render from header'
    });
    return html;
}();