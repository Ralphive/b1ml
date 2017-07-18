// Load Node Dependencies
var AWS = require('aws-sdk');
var express = require('express');
var formidable = require('formidable');
var app = express();

// Load Node Modules
var path = require('path');
var fs = require('fs');

//Local Modules
var bucket = require('./bucket') 
var global = require('./global')

//Load Credentials and Region
AWS.config.loadFromPath('./awsConfig.json');

// Create an S3 client (for file management)
var s3 =  new AWS.S3({apiVersion: '2006-03-01'});
var rek = new AWS.Rekognition({apiVersion: '2016-06-27'})


var bucketName = global.namespace() +'-ralph';
var keyName = 'hello_world.txt';


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

    //Called from HTML uploader 
    var UserName;

    // create an incoming form object
    var form = new formidable.IncomingForm();
    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;    
  
    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, global.newImgDir());

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, UserName+"_"+file.name));
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, Send them to AWS
    form.on('end', function() {
        bucket.create(s3, UserName)
        res.end('success');
    });
    
    form.on('field', function(name, value) {
        if(name='UserName'){
            UserName = value
        }
    });

    // parse the incoming request containing the form data
    form.parse(req, function(err, fields, files){
        //console.log(files)  
    });

});

app.post('/uploadURL', function(req, res){
    //Called by FB Integration
    // Receives a Json with UserName + Pictures array
    var jsonInput = {
                    UserName: 'TestUser',
                    pics : [
                        {url : 'https://unsplash.it/1000?random'},
                        {url : 'https://unsplash.it/1000?random'},
                        {url : 'https://unsplash.it/1000?random'}
                    ]    
                }

    bucket.create(s3, jsonInput.UserName, jsonInput.pics, function(){
        
        //Call the ML library here
    });

});


var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
