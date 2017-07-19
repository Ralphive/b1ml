// Load Node Dependencies
var AWS = require('aws-sdk');
var express = require('express');
var formidable = require('formidable');
var bodyParser = require('body-parser');

// Load Node Modules
var path = require('path');
var fs = require('fs');
var uuid = require('node-uuid');


//Local Modules
var bucket  = require('./bucket') 
var global  = require('./global')
var ml      = require('./ml');  


//Initialization
//Load Credentials and Region
AWS.config.loadFromPath('./awsConfig.json');

// Create an S3 client (for file management)
var s3 =  new AWS.S3({apiVersion: '2006-03-01'});

// Create an Rekognition client (Image classification)
var rek = new AWS.Rekognition({apiVersion: '2016-06-27'})

//Configure Express 
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));



app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

    //Called from HTML uploader 
    var user;

    // create an incoming form object
    var form = new formidable.IncomingForm();
    
    // specify that we want to allow the user to 
    //upload multiple files in a single request
    form.multiples = true;    
  
    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, global.newImgDir());

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, user+"_"+file.name));
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, Send them to AWS
    form.on('end', function() {
        bucket.create(s3, user)
        res.end('success');
    });
    
    form.on('field', function(name, value) {
        if(name='user'){
            user = value
        }
    });

    // parse the incoming request containing the form data
    form.parse(req, function(err, fields, files){
        //console.log(files)  
    });

});

//Called by FB Integration
// Receives a Json with user + Pictures array
app.post('/uploadURL', function(req, res){
    
    //Create a collection on Rekognition for the give user
    ml.createCollection(rek,req.body.user)

    //Store the images on the S3 Bucket, then add them to the collection
    var bucketName =  global.userNs(req.body.user)+"-"+uuid.v4();
    bucket.create(s3, req.body.user, bucketName, req.body.pics, rek)

    res.send('All Good!');
});

// Identifies the user of a given image
app.post('/searchFace', function(req, res){
  
    var output = {} 

    //Store image on the defaulFacesBucket
    bucket.put(s3, global.faceBucket(),'xxx', req.body.pics[0],true,null, function(ret){
        
        ml.searchFaces(rek, global.faceBucket(), ret.Key, function(err, data){
            
            var extImgId =  '';
            extImgId = data[0].Face.ExternalImageId;
            output.user = extImgId.substring(0,extImgId.indexOf('-'));
            res.send(output);
        })
        
    
    });
    //Create a collection on Rekognition for the give user
    
});

app.post('/initialize', function(req,res){
    //Initialize all the system
    
    if (req.body.collections){
        //Clean existing collections
    }

    if(req.body.buckets){
        //clean existing buckets
    }


    //Creates Default Face Bucket
     //Store the images on the S3 Bucket, then add them to the collection
    bucket.create(s3, null, global.faceBucket(), null, null);
});




function callML(bucket, user){
    console.log("Starting Rekognition for User: "+
                                    user+" on Bucket "+bucket);                     
}


var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
