$(function () {
    /**
     * require([])语法不同于require.ensure([])和require()，它支持可变参数加载
     * 如此例所示，webpack解析时会对__COMP__目录下所有js模块进行分析，打包所有模块到一个trunk文件中
     * 即使此时没有点击加载footer或屏蔽footer代码，footer模块都会被打包进入trunk中
     * 优点与缺点都很明显，为了避免trunk过大的问题，可以使用bundle插件实现对trunk文件的分割，此时会对__COMP__模块下的所有文件
     * 分别生成一个trunk，根据上下文条件进行加载。
     */
    $('#load_header').on('click', function() {
        var headerPath = 'header/header';
        require(['__COMP__/' + headerPath], function (headerStr) {  
            $('#header').html(headerStr);
        });
    });

    /**
     * 即使代码被屏蔽，footer.js亦然会被打包进与header相同的trunk文件中
     */
    // $('#load_footer').on('click', function() {
    //     var footerPath = 'footer/footer';
    //     require(['__COMP__/' + footerPath], function (footerStr) {    
    //         $('#footer').html(footerStr);
    //     });
    // });

    
});