
$(function () {
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

    /** 
    * 不管require.ensure是否有预加载参数，
    * 在回调function中如果多次执行require，如对header,footer的require请求
    * 那么这些文件都会被打包到一个单独的trunk中如 [1.ef134ae.js] 文件
    */
    // require.ensure([], function(require) {
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
    * 另一种写法，效果如上所述
    */
    // require.ensure(['__COMP__/header/header', '__COMP__/footer/footer'], function(require) {
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
     * require的另一种用法与require.ensure功能类似，只是回调参数有所不同
     */
    // require(['__COMP__/header/header', '__COMP__/footer/footer'], function(headerStr, footerStr) {
    //     $('#load_header').on('click', function() {
    //         $('#header').html(headerStr);
    //     });

    //     $('#load_footer').on('click', function() {
    //         $('#footer').html(footerStr);
    //     });
    // });

    /**
     * 代码被分割成两个文件A.trunk.js, B.trunk.js
     */
    // require(['__COMP__/header/header'], function(headerStr) {
    //     $('#load_header').on('click', function() {
    //         $('#header').html(headerStr);
    //     });
    // });

    // require(['__COMP__/footer/footer'], function(footerStr) {
    //     $('#load_footer').on('click', function() {
    //         $('#footer').html(footerStr);
    //     });
    // });
});