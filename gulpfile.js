var gulp = require('gulp');
var webpack = require('webpack');

var gutil = require('gulp-util');
var webpackConf = require('./webpack.config');

var assets = process.cwd() + '/assets';

// clean assets
gulp.task('clean', [], function() {
    var clean = require('gulp-clean')
    return gulp.src(assets, {read: true}).pipe(clean())
});

// run webpack pack
gulp.task('pack', ['clean'], function(done) {
    webpack(webpackConf, (err, stats) => {
        if(err) throw new gutil.PluginError('webpack', err)
        gutil.log('[webpack]', stats.toString({colors: true}))
        done()
    });
});

// html process
gulp.task('default', ['pack'], function() {
    var htmlmin = require('gulp-htmlmin');

    return gulp
        .src(assets + '/*.html')
        // @see https://github.com/kangax/html-minifier
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(assets));
});

// deploy assets to remote server
gulp.task('deploy', function() {
    var sftp = require('gulp-sftp')

    return gulp.src(assets + '/**')
        .pipe(sftp({
            host: '[remote server ip]',
            remotePath: '/www/app/',
            user: 'foo',
            pass: 'bar'
        }));
});