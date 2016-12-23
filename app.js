/**
 * cell phone file server
 * author: D.W.
 * 
 * usage:
 * node app.js -root /somedir
 * 
 * @modified @2016-12-23 16:59:45 改为映射目录为可从参数传递的 
 * */

'use strict';
var express = require('express'),
	connect = require('connect'),
	fs = require('fs'),
	path = require('path'),
	os = require('os');

const DEFAULT_DIR = {
	name: '/share',
	path: 'D:/share'
};

var dir = DEFAULT_DIR;

var app = express();
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var index = process.argv.indexOf('-root');
if (~index) {
	dir.path = process.argv[index + 1];
	dir.name = '/' + path.basename(dir.path);
}

usage();
console.log('Now you try to serve @dir ', dir);

var dirs = [];
var upload_store_dir = dir.path;
dirs.push(dir);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('port', 6677);

app.use(connect.favicon());
app.use(connect.multipart({ defer: true, limit: '100mb' }));
app.use(connect.errorHandler('dev'));

app.get('/', function (req, res, next) {
	res.render('index', { dirs: dirs });
});
app.post('/', function (req, res, next) {
	req.form.on('end', function () {
		//判断是不是多个文件
		var files = [];
		if (req.files.file.slice)
			files = req.files.file;
		else
			files.push(req.files.file);
        files.forEach(function(file){

		});
		res.redirect('/');
	});
});

app.use('/public', express.static(__dirname + '/public'));
app.use('/upload', connect.directory(upload_store_dir, { hidden: true, icons: true }));
app.use('/upload', express.static(upload_store_dir));
dirs.forEach(function (dir) {
	app.use(dir.name, connect.directory(dir.path, { hidden: true, icons: true }));
	app.use(dir.name, express.static(dir.path));
});

app.use(function (req, res) {
	res.end(req.url + ' not found!');
});

app.listen(app.get('port'), function (err) {
	if (err) return console.log(err);
	console.log('server start listening at port: ' + app.get('port'));
});

/**
 * 上传完成后回调，不论是发重定向到主界面 还是转向到rename.jade界面
 * @author davidwang
 */
function uploadDone(req,fileNum){

}

/**
 * 判断文件是不是已经存在，如果不存在，就mv一下
 * 如果已经存在cb(false) 如果成功上传就cb(true) 
 * @author davidwang
 * @date 2016-12-23 17:54:02
 */
function storeFile(part,cb){
	var newPath = upload_store_dir+"/"+part.name;
	fs.stat(newPath,function(err,stats){
		if(err){
			fs.rename(part.path,newPath)
			cb(true);
		}else{
			cb(false);
		}
	});
}

function usage() {
	console.log('USAGE:: node app.js -root somedirectory');
}