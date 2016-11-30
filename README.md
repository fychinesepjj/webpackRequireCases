# Webpack require cases
## 文件结构
* `src/sync_require.html`
* `src/async_require.html`
* `src/precache_async_require.html`
* `src/batch_require.html`
* `src/bundle_require.html`

分别对应`src/media/`目录下同名js文件，webpack在打包html时自动引用同名js文件，这些文件是对require不同使用方法的分析，总结。

## 具体说明
### `sync_require.js` 关于require同步加载的分析
```javascript
/**
* require同步加载: 
* 在webpack分析代码时，对已经确认要加载的header与footer文件一同打包进入sync_require.js
*/
$(function () {
    var headerStr = require('__COMP__/header/header');
    $('#header').html(headerStr);
    var footerStr = require('__COMP__/footer/footer');
    $('#footer').html(footerStr);
});
```

### `async_require.js` 关于require.ensure, require(['a'],function(a){})等异步方法的分析

*Example 1:*

```javascript
/** 
* require.ensure每次调用会产生一次分割，
* 此例中由于有两次调用require.ensure，因此会产生两个trunk: A.trunk.js , B.trunk.js
*/

// 分割成A.trunk.js
$('#init_header').on('click', function() {
    require.ensure([], function(require) {
        $('#load_header').on('click', function() {
            var headerStr = require('__COMP__/header/header');
            $('#header').html(headerStr);
        });
        $('#info').append('header trunk loaded！');
    });
});

// 分割成B.trunk.js
$('#init_footer').on('click', function() {
    require.ensure([], function(require) {
        $('#load_footer').on('click', function() {
            var footerStr = require('__COMP__/footer/footer');
            $('#footer').html(footerStr);
        });
        $('#info').append('footer trunk loaded！');
    });
});
```

*Example 2:*

```javascript
/** 
* 不管require.ensure是否有预加载参数，
* 在回调function中如果多次执行require，如对header,footer的require请求
* 那么这些文件都会被打包到一个单独的trunk中如 [1.ef134ae.js] 文件
*/
require.ensure([], function(require) {
    $('#load_header').on('click', function() {
        var headerStr = require('__COMP__/header/header');
        $('#header').html(headerStr);
    });

    $('#load_footer').on('click', function() {
        var footerStr = require('__COMP__/footer/footer');
        $('#footer').html(footerStr);
    });
});

/**
* 另一种写法，ensure多了预加载参数，效果如上所述（预加载参数在此种情况下没有起到作用，具体看后续分析）
*/
require.ensure(['__COMP__/header/header', '__COMP__/footer/footer'], function(require) {
    $('#load_header').on('click', function() {
        var headerStr = require('__COMP__/header/header');
        $('#header').html(headerStr);
    });

    $('#load_footer').on('click', function() {
        var footerStr = require('__COMP__/footer/footer');
        $('#footer').html(footerStr);
    });
});

```
需要说明的是，在webpack中除了`require.ensure`方法可以对代码进行分割，并异步加载外，`require(['a.js'], function(a){})`方法同样可以实现此类功能，
除了用法不同，它还更强大一些，实现了对变量拼接的支持，后续会有更多讲解。
`Example 1`代码用另一种写法：

```javascript
/**
*  代码被分割成A.trunk.js, B.trunk.js两个文件
*/
require(['__COMP__/header/header'], function(headerStr) {
    $('#load_header').on('click', function() {
        $('#header').html(headerStr);
    });
});

require(['__COMP__/footer/footer'], function(footerStr) {
    $('#load_footer').on('click', function() {
        $('#footer').html(footerStr);
    });
});
```