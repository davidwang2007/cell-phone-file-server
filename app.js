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
if(~index){
	dir.path = process.argv[index+1];
	dir.name = '/'+path.basename(dir.path);
}

usage();
console.log('Now you try to serve @dir ',dir);

var dirs = [];
var upload_store_dir = dir.path;
dirs.push(dir);

app.set('views',__dirname+'/views');
app.set('view engine','jade');
app.set('port',6677);

app.use(connect.favicon());
app.use(connect.multipart({defer:true,limit:'100mb'}));
app.use(connect.errorHandler('dev'));

app.get('/',function(req,res,next){
	res.render('index',{dirs:dirs});
});
app.post('/',function(req,res,next){
	req.form.on('fileBegin',function(file,part){
		//此处直接改变part.path 比接收完重命名 高效不少
		part.path = upload_store_dir+'/'+part.name;
	});
    req.form.on('file',function(file,part){
		//console.log(part);
        //console.log('use try to upload %s %s',part.name,part.path);
		/*
		fs.rename(part.path,upload_store_dir+'/'+part.name,function(err){
			if(err) return console.error(err);
			console.log(part.name,'saved');
		});
		*/
        //part.pipe(fs.createWriteStream(upload_store_dir+'/'+part.name));
    });
	req.form.on('end',function(){
		console.log('receive end event');
		res.redirect('/');
	});
    /*
	var file = req.files.file;
	console.log(req.files,req.form);
	if(Array.isArray(file))
		file.forEach(function(f){
			storeFile(f);		
		});
	else
		storeFile(file);
	res.redirect('/');
	*/
});

/**
 * @deprecated use part.path = 'xxx' direct change
 */
function storeFile(file){
    if(os.platform() == 'linux')
        fs.rename(file.path,upload_store_dir+'/'+file.name,function(err){
            if(err) console.error('when store file '+file.name+', Error occurred!',err);
        });
    else
        fs.createReadStream(file.path).pipe(fs.createWriteStream(upload_store_dir+'/'+file.name));
};

app.use('/public',express.static(__dirname+'/public'));
app.use('/upload',connect.directory(upload_store_dir,{hidden:true,icons:true}));
app.use('/upload',express.static(upload_store_dir));
dirs.forEach(function(dir){
	app.use(dir.name,connect.directory(dir.path,{hidden:true,icons:true}));
	app.use(dir.name,express.static(dir.path));
});

app.use(function(req,res){
	res.end(req.url+' not found!');
});

app.listen(app.get('port'),function(err){
	if(err) return console.log(err);
	console.log('server start listening at port: '+app.get('port'));
});


function usage(){
	console.log('USAGE:: node app.js -root somedirectory');
}