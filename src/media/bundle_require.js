$(function () {
    /**
     * bundle本质是对require.ensure的封装，bundle会对__COMP__目录下文件进行预生成，分别产生不同的trunk，待加载
     */
    $('#load_header').on('click', function() {
        var headerPath = 'header/header';
        var waitForHeader = require('bundle!__COMP__/' + headerPath);
        waitForHeader(function (headerStr) {
            $('#header').html(headerStr);
        });
    });

    /**
     * footer与header加载的是不同的trunk，这种加载方式有一个缺点，untils被重复打包两个trunk中了
     */
    $('#load_footer').on('click', function() {
        var footerPath = 'footer/footer';
        var waitForFooter = require('bundle!__COMP__/' + footerPath);
        waitForFooter(function (footerStr) {
            $('#footer').html(footerStr);
        });
    });

    
});