$(function () {
    /**
     * require.ensure['__JS__/utils']预加载的文件在function回调中如果仅使用require方法，那么require所有的包，包括预加载文件__JS__/utils
     * 都会被打包进入同一个trunk中，此时预加载使用效果近似requre.ensure([])，等于没有预加载。
     */
    // 初始化加载顺序precache_async_require.js -> parent.trunk.js
    // load_header event -> no script loaded
    // load_footer event -> no script loaded
    // require.ensure(['__JS__/utils'], function(require) {      // parent.trunk.js
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
     * 此时预加载文件__JS__/utils(同__COMP__/header/header)会被抽取到parent.trunk.js中，在实现预加载同时对公共加载项目的进行了提取
     * children1.trunk.js与children2.trunk.js只有在执行click事件后才会进行加载
     * 首页初始化只会先加载parent.trunk.js
     * 因此建议如果在require.ensure中再次使用异步加载方法时，应优先考虑使用预加载处理
     * 其他方法如require.include('xxxx')与require.ensure(['xxxx'])实现几乎一致，具体可参考webpack官方文档
     */
    // 初始化加载precache_async_require.js -> parent.trunk.js
    // load_header event -> children1.trunk.js 加载
    // load_footer event -> children2.trunk.js 加载
    // require.ensure(['__JS__/utils', '__COMP__/header/header'], function(require) {    // parent.trunk.js
    //     $('#load_header').on('click', function() {
    //         // 或使用require.ensure([])亦可以
    //         // 外部require.ensure不预加载__COMP__/header/header才会产生children1.trunk.js，否则__COMP__/header/header会被打包进入parent.trunk.js
    //         // children1.trunk.js
    //         require(['__COMP__/header/header'], function(headerStr) {
    //             $('#header').html(headerStr);
    //         });
    //     });

    //     $('#load_footer').on('click', function() {
    //         // 或使用require.ensure([])亦可以
    //         // children2.trunk.js
    //         require(['__COMP__/footer/footer'], function(footerStr) { 
    //             $('#footer').html(footerStr);
    //         });
    //     });
    // });


    /**
     * 如果require.ensure在条件语句内，此时require.ensure所产生的trunk不会立刻加载，在条件满足时才会加载，如click事件发生时
     * 在外部没有require.ensure对__JS__/utils进行预加载的情况下，此时__JS__/utils文件会被children1.trunk.js， children2.trunk.js分别打包一次
     * 总计__JS__/utils被打包了两次,欲解决此问题，仅需要在代码执行前对__JS__/utils同步加载一次：require('__JS__/utils');
     * 对比上述例子发现，通过同步require加载文件的方法，避免了外部require.ensure的重复包裹，减少了一个trunk包（parent.trunk.js）
     * 预加载的内容从parent.trunk.js被提前到precache_async_require.js文件中
     */
    // 初始化加载precache_async_require.js
    // load_header event -> children1.trunk.js 加载
    // load_footer event -> children2.trunk.js 加载

    // 同步加载解决__JS__/utils被打包两次的问题
    require('__JS__/utils');
    $('#load_header').on('click', function() {
        require.ensure(['__JS__/utils'], function (require) {        // children1.trunk.js
            var headerStr = require('__COMP__/header/header');
            $('#header').html(headerStr);
        });
    });

    $('#load_footer').on('click', function() {
        require.ensure(['__JS__/utils'], function (require) {       // children1.trunk.js
            var footerStr = require('__COMP__/footer/footer');
            $('#footer').html(footerStr);
        });
    });
});