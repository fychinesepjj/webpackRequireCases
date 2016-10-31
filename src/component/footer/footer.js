module.exports = function (){
    require('./footer.scss');
    var template = require('template');
    var source = require('./footer.tpl');
    var render = template.compile(source);
    var html = render({
        'list': ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
    });
    return html;
}();