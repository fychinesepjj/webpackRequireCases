$(function () {
    /**
    * require([])语法不同于require.ensure([])和require()，它支持可变参数加载
    * webpack解析时会对__COMP__目录下所有js模块进行分析，打包所有模块到一个trunk文件中，如sub.trunk.js
    * 如本例中，即使没有主动加载footer，footer模块依然会被打包进入trunk中
    * 优点与缺点都很明显，为了避免trunk过大的问题，可以使用bundle插件实现对trunk文件的分割，此时会对__COMP__模块下的所有文件
    * 分别生成一个trunk，再根据上下文进行条件加载。
    */

    // 页面初始化js加载：batch_require.js
    // 点击load_header事件，触发加载sub.trunk.js文件
    $('#load_header').on('click', function() {
        var headerPath = 'header/header';
        require(['__COMP__/' + headerPath], function (headerStr) {  
            $('#header').html(headerStr);
        });
    });

    // 被屏蔽的footer代码，footer依然会被打包进入trunk中
    // $('#load_footer').on('click', function() {
    //     var footerPath = 'footer/footer';
    //     require(['__COMP__/' + footerPath], function (footerStr) {    
    //         $('#footer').html(footerStr);
    //     });
    // });

    
});