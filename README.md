# Webpack require cases
## 文件结构
* `src/sync_require.html`
* `src/async_require.html`
* `src/preload_async_require.html`
* `src/batch_require.html`
* `src/bundle_require.html`

分别对应`src/media/`目录下同名js文件，webpack在打包html时自动引用同名js文件，这些文件是对require不同使用方法的分析，总结。

## 具体说明
### `sync_require.js` 关于require同步加载的分析
**Example 1:**

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

**Example 2:**

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

**Example 3:**

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
```

需要说明的是，在webpack中除了`require.ensure`方法可以对代码进行分割，并异步加载外，`require(['a.js'], function(a){})`方法同样可以实现此类功能，除了用法不同，它还更强大一些，实现了对变量拼接的支持，后续会有更多讲解。
*Example 3* 代码用另一种写法：

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

### `preload_async_require.js` 关于require.ensure异步预加载功能的分析
**Example 4:**

```javascript
/**
* require.ensure['__JS__/utils']预加载的文件在function回调中如果仅使用require方法，
* 那么被require的所有文件包括预加载文件__JS__/utils都会被打包进入同一个trunk中，如sub.trunk.js
* 此时预加载使用效果近似requre.ensure([])，预加载效果不明显。
*/

// 页面初始化js加载： preload_async_require.js --> sub.trunk.js
// load_header，load_footer点击事件不会触发异步请求
require.ensure(['__JS__/utils'], function(require) { 
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

**Example 5:**

```javascript

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
require.ensure(['__JS__/utils', '__COMP__/header/header'], function(require) {    // parent.trunk.js
    $('#load_header').on('click', function() {

        // [children1.trunk.js]只有在__COMP__/header/header文件不被预加载情况下才会被生成
        require(['__COMP__/header/header'], function(headerStr) {
            $('#header').html(headerStr);
        });
    });

    $('#load_footer').on('click', function() {

        require(['__COMP__/footer/footer'], function(footerStr) {    // children2.trunk.js
            $('#footer').html(footerStr);
        });
    });
});
```

**Example 6:**

```javascript
/**
* 如果require.ensure方法在条件语句内使用，此时require.ensure所产生的trunk不会立刻加载，在条件满足时才会加载，如click事件发生时
* 本例中，在外部没有require.ensure对__JS__/utils进行预加载的情况下，此时__JS__/utils文件会被分别打包一次，生成children1.trunk.js， children2.trunk.js两个文件
* __JS__/utils总计被打包了两次,欲解决此问题，需要在代码执行前对__JS__/utils同步加载：require('__JS__/utils')
* 此时__JS__/utils文件会打包在preload_async_require.js文件中，实现了对__JS__/utils文件的预加载。（即，提取公共文件）
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
```

### `batch_require.js` 关于require动态加载文件的分析
本例主要关于`require(['a.js'], function(a){})`的使用说明

**Example 7:**

```javascript
/**
* require([])语法不同于require.ensure([])和require()，它支持可变参数加载
* webpack解析时会对__COMP__目录下所有js模块进行分析，打包所有模块到一个trunk文件中
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
```

### `bundle_require.js` 关于require动态加载文件的分析
**Example 8:**

```javascript
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

// 提前加载
require('__JS__/utils');

```

## 其他
* 运行示例需要全局安装webpack-dev-server，`npm install webpack-dev-server -g`，安装完毕后运行`webpack-dev-server`即可
* 直接执行`gulp`命令会在执行目录生成assets文件夹，此文件夹内容是webpack编译后文件
* 运行`bundle_require.html`前需要安装`bundle-loader`插件到本地，`npm install bundle-loader --save-dev`