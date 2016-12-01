$(function () {
    /**
    * require.ensure['__JS__/utils']预加载的文件在function回调中如果仅使用require方法，
    * 那么被require的所有文件包括预加载文件__JS__/utils都会被打包进入同一个trunk中，如sub.trunk.js
    * 此时预加载使用效果近似requre.ensure([])，预加载效果不明显。
    */

    // 初始化js加载： preload_async_require.js --> sub.trunk.js
    // load_header，load_footer点击事件不会触发异步请求
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
    * 实现代码预加载，function回调中需要有异步加载代码，如require.ensure 或 require([], function(){})
    * 对比上述例子发现，本例回调中的require方法被改造成require([])形式，由于在__COMP__/header/header，__COMP__/footer/footer模块中
    * 分别加载了__JS__/utils文件，此时对其进行预加载，__JS__/utils与__COMP__/header/header会被一同抽取到parent.trunk.js中，在预加载同时对公共加载项进行了提取。
    * 因此建议，如果在require.ensure回调中再次使用异步加载方法时，应优先考虑使用预加载提取公共文件。
    * 其他如require.include('xxxx')与require.ensure(['xxxx'])方法使用效果一致，具体可参考webpack官方文档
    */

    // 页面初始化js加载:preload_async_require.js --> parent.trunk.js
    // load_header点击事件没有触发js文件加载，因为__COMP__/header/header已经提前被打包进入parent.trunk.js文件，并加载。
    // load_footer点击事件 --> children2.trunk.js 加载
    // require.ensure(['__JS__/utils', '__COMP__/header/header'], function(require) {    // parent.trunk.js
    //     $('#load_header').on('click', function() {

    //         // [children1.trunk.js]只有在__COMP__/header/header文件不被预加载情况下才会被生成
    //         require(['__COMP__/header/header'], function(headerStr) {
    //             $('#header').html(headerStr);
    //         });
    //     });

    //     $('#load_footer').on('click', function() {
    //         require(['__COMP__/footer/footer'], function(footerStr) {  // children2.trunk.js
    //             $('#footer').html(footerStr);
    //         });
    //     });
    // });


    /**
    * 如果require.ensure方法在条件语句内使用，此时require.ensure所产生的trunk不会立刻加载，在条件满足时才会加载，如click事件发生时
    * 本例中，在外部没有包裹require.ensure对__JS__/utils进行预加载的情况下，此时__JS__/utils文件会被打包两次，
    * 分别生成children1.trunk.js， children2.trunk.js两个文件，欲解决此问题，
    * 需要在代码执行前对__JS__/utils同步加载：require('__JS__/utils')
    * 此时__JS__/utils文件会打包在preload_async_require.js文件中，实现了对__JS__/utils文件的预加载。（即提取公共文件）
    * 对比上述例子发现，通过require同步加载方法，避免了外部require.ensure的重复包裹，减少了一个trunk包（parent.trunk.js）
    * 预加载文件__JS__/utils从parent.trunk.js被提到了preload_async_require.js文件中
    */

    // 页面初始化js加载：preload_async_require.js
    // load_header 点击事件 -> children1.trunk.js 加载
    // load_footer 点击事件 -> children2.trunk.js 加载

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