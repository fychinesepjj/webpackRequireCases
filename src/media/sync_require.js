/**
 * require是同步加载，在webpack解析代码同时，已经确定要加载的header与footer文件会被打包进入sync_require.js
 */
$(function () {
    var headerStr = require('__COMP__/header/header');
    $('#header').html(headerStr);
    var footerStr = require('__COMP__/footer/footer');
    $('#footer').html(footerStr);
});