$(function () {
    // require('__JS__/utils');

    /**
    * bundle本质是对require.ensure的封装，bundle会对__COMP__目录下文件进行预处理，
    * 编译时产生大量的trunk文件用于异步加载，对比 Example 7，它最大的优点是不会把文件都打包到一个trunk中。
    */

    // 页面初始化js加载：bundle_require.js
    // 点击load_header事件，触发加载header.trunk.js文件
    // 点击load_footer事件，触发加载footer.trunk.js文件
    $('#load_header').on('click', function() {
        var headerPath = 'header/header';
        var waitForHeader = require('bundle!__COMP__/' + headerPath);
        waitForHeader(function (headerStr) {
            $('#header').html(headerStr);
        });
    });

    /**
    * 当header与footer同时引用__JS__/utils文件时，由于是提前拆分trunk文件，此时__JS__/utils被打包两次
    * 问题同 Example 6 非常相像，解决办法也相同：在bundle_require.js文件中执行require('__JS__/utils')加载
    * __JS__/utils会被打包进入bundle_require.js，在header与footer文件中就不会生成重复文件
    */
    $('#load_footer').on('click', function() {
        var footerPath = 'footer/footer';
        var waitForFooter = require('bundle!__COMP__/' + footerPath);
        waitForFooter(function (footerStr) {
            $('#footer').html(footerStr);
        });
    });

});