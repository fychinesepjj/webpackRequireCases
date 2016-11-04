$(function () {
    /**
     * require.ensure['__JS__/utils']预加载的文件在function回调中如果仅使用require方法，那么require所有的包，包括预加载文件__JS__/utils
     * 都会被打包进入同一个trunk中，此时预加载使用效果近似requre.ensure([])，等于没有预加载。
     */
    // require.ensure(['__JS__/utils'], function(require) {
    //     $('#load_header').on('click', function() {
    //         var headerStr = require('__COMP__/header/header');
    //         $('#header').html(headerStr);
    //     });

    //     $('#load_footer').on('click', function() {
    //         var footerStr = require('__COMP__/footer/footer');
    //         $('#footer').html(footerStr);
    //     });
    // });

    /**
     * 想要对代码的预加载，function回调中require方法需使用异步形式，如require.ensure 或 require([], function(){})形式
     * 对比上述例子发现，本例中把require方法改造成require([])方法，由于在__COMP__/header/header，__COMP__/footer/footer模块中分别加载了__JS__/utils文件
     * 此时预加载文件__JS__/utils会被抽取到parent.trunk.js中，在实现预加载同时对公共加载项目的进行了提取
     * children1.trunk.js与children2.trunk.js只有在执行click事件后才会进行加载
     * 首页初始化只会先加载parent.trunk.js
     * 因此建议如果在require.ensure中再次使用异步加载方法时，应优先考虑使用预加载处理
     * 其他方法如require.include('xxxx')与require.ensure(['xxxx'])实现几乎一致，具体可参考webpack官方文档
     */
    require.ensure(['__JS__/utils'], function(require) {    // parent.trunk.js
        $('#load_header').on('click', function() {
            // 或使用require.ensure([])亦可以
            require(['__COMP__/header/header'], function(headerStr) { // children1.trunk.js
                $('#header').html(headerStr);
            });
        });

        $('#load_footer').on('click', function() {
            // 或使用require.ensure([])亦可以
            require(['__COMP__/footer/footer'], function(footerStr) { // children2.trunk.js
                $('#footer').html(footerStr);
            });
        });
    });

});