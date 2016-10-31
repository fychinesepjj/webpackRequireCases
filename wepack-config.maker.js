var path = require('path');
var webpack = require('webpack');
var glob = require('glob');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var srcDir = path.resolve(__dirname, 'src');
var mediaDir = path.resolve(srcDir, 'media');

var nodeModPath = path.resolve(__dirname, './node_modules');
var assets = './assets/';
var outputDir = 'js/';
var pathMap = require(path.resolve(srcDir, 'pathmap.json'));

var makeEntries = function (extra){
    var entryFiles = glob.sync(mediaDir + '/*.js');
    var map = {};
    if(extra){
        Object.assign(map, extra);
    }
    
    entryFiles.forEach(function(filePath) {
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        map[filename] = filePath;
    })

    return map;
};

var entries = makeEntries({'vendor': ['template']});


module.exports = function(options) {
    options = options || {};

    var debug = options.debug !== undefined ? options.debug : true;
    var publicPath = '';
    var cssLoader;
    var scssLoader;

    // generate entry html files
    // 自动生成入口文件，入口js名必须和入口文件名相同
    // 例如，a页的入口文件是a.html，那么在js目录下必须有一个a.js作为入口文件
    var plugins = function () {
        var entryHtml = glob.sync(srcDir + '/*.html');
        var r = [];

        entryHtml.forEach(function (filePath) {
            var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
            var conf = {
                template: 'html!' + filePath,
                filename: filename + '.html'
            }

            if(filename in entries) {
                conf.inject = 'body';
                conf.chunks = ['vendor', filename];
            }

            r.push(new HtmlWebpackPlugin(conf))
        });

        return r
    }();

    if(debug) {
        // 开发阶段，css直接内嵌
        cssLoader = 'style-loader!css-loader';
        scssLoader = 'style-loader!css-loader!sass-loader';
    } else {
        // 编译阶段，css分离出来单独引入
        // publicPath 解决css中图片字体相对路径问题
        cssLoader = ExtractTextPlugin.extract('style', 'css?minimize', {publicPath: "../"}); // enable minimize
        scssLoader = ExtractTextPlugin.extract('style', 'css?minimize!sass', {publicPath: "../"});

        plugins.push(
            new ExtractTextPlugin('css/[name].[contenthash:8].min.css', {
                // 当allChunks指定为false时，css loader必须指定怎么处理
                // additional chunk所依赖的css，即指定`ExtractTextPlugin.extract()`
                // 第一个参数`notExtractLoader`，一般是使用style-loader
                // @see https://github.com/webpack/extract-text-webpack-plugin
                allChunks: false
            })
        )

        plugins.push(new UglifyJsPlugin({
            mangle: {
                except: ['$', 'exports', 'require', 'jQuery', 'Promise']
            },
            compress: { 
                //warnings: false
            },
            output: {
                comments: false
            }
            //sourceMap: false  //false：关闭生成sourceMap功能
        }));
    }
    
    // 让$, jQuery关键字可以在各个模块中直接使用
    plugins.push(new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
    }));

    var config = {
        entry: entries,

        output: {
            path: path.resolve(assets),
            filename: debug ? '[name].js' : outputDir + '[name].[chunkhash:8].min.js',
            chunkFilename: debug ? '[name].[chunkhash:8].chunk.js' :  outputDir + '[name].[chunkhash:8].chunk.min.js',
            hotUpdateChunkFilename: debug ? '[id].js' :  outputDir + '[id].[hash:8].min.js',
            publicPath: publicPath
        },

        resolve: {
            root: [srcDir, nodeModPath],
            alias: pathMap,
            extensions: ['', '.js']
        },
        resolveLoader: {
            root: nodeModPath
        },
        module: {
            loaders: [
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    loaders: [
                        'image?{bypassOnDebug: true, progressive:true, \
                            optimizationLevel: 3, pngquant:{quality: "65-80", speed: 4}}',
                        // url-loader更好用，小于10KB的图片会自动转成dataUrl，
                        // 否则则调用file-loader，参数直接传入
                        'url?limit=10000&name=[path][hash:8].[name].[ext]&context=media',
                    ]
                },
                {
                    test: /\.(woff|eot|ttf)$/i,
                    loader: 'url?limit=10000&name=[path][hash:8].[name].[ext]&context=media'
                },
                //{test: /\.(tpl|ejs)$/, loader: 'ejs'},
                {test: /\.tpl/, loader: 'html'},
                //{test: /\.json/, loader: 'json'},
                {test: /\.css$/, loader: cssLoader},
                {test: /\.scss$/, loader: scssLoader}
                //require后才能暴露到全局
                //{test: /jquery\.min\.js$/, loader: 'expose?jQuery'}
            ]
        },
        sassLoader: {
            // @import 查找路径
            includePaths: [path.resolve(mediaDir, "sass")]
        },
        externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
            "jquery": "jQuery"
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoErrorsPlugin(),
            new CommonsChunkPlugin('vendor', debug ? 'vendor.js' :  outputDir + "vendor.[hash:8].min.js")
        ].concat(plugins),

        devServer: {
            contentBase: '/assets',
            hot: false,
            noInfo: false,
            inline: true,
            publicPath: publicPath,
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            },
            headers: { "X-Custom-Header": "yes" },
            stats: {
                cached: false,
                colors: true
            },
            proxy: {
              //拦截api到本地请求代理地址
              '/api/*': {
                    target: {
                        "host": "study.dev",
                        "protocol": 'http:',
                        "port": 80,
                        "path": '/webpack/'
                    },
                    //ignorePath: true,
                    changeOrigin: true,
                    secure: false
              }
            }
        }
    };
    if(!debug){
        config.devtool = '#eval-source-map';
    }
    
    return config;
}