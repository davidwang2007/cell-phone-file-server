/**
 * cell phone file server
 * author: D.W.
 * */

'use strict';
var express = require('express'),
	connect = require('connect'),
	fs = require('fs'),
    os = require('os');

var app = express();
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
var dirs = [];
var upload_store_dir = 'G:/temp';
// ele -> {name: 'xxx',path:'/a/b'}
dirs.push({
	name: '/home',
	path: 'G:/share50'
});

app.set('views',__dirname+'/views');
app.set('view engine','jade');
app.set('port',6677);

app.use(connect.favicon());
app.use(connect.multipart({defer:true,limit:'10mb'}));
app.use(connect.errorHandler('dev'));

app.get('/',function(req,res,next){
	res.render('index',{dirs:dirs});
});
app.post('/',function(req,res,next){
    req.form.on('part',function(part){
        console.log('use try to upload %s %s',part.name,part.filename);
        part.pipe(fs.createWriteStream(upload_store_dir+'/'+part.filename));
    });
    res.redirect('/');
    /*
	var file = req.files.file;
	if(Array.isArray(file))
		file.forEach(function(f){
			storeFile(f);		
		});
	else
		storeFile(file);
	res.redirect('/');
	*/
});

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
