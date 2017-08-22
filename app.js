// Load Node Dependencies
var AWS = require('aws-sdk');
var express = require('express');
var bodyParser = require('body-parser');

// Load Node Modules
var path = require('path');
var fs = require('fs');
var uuid = require('node-uuid');


//Local Modules
var bucket  = require('./bucket') 
var global  = require('./global')
var ml      = require('./ml');  
var leo     = require('./leo');


var port = 8080

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


leo.updateVectorsBase();



/** Endpoints */
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});



//Called by FB Integration
// Receives a Json with user + Pictures array
app.post('/trainSystem', function(req, res){
    
    //Store the images on the S3 Bucket, then add them to the collection
    var bucketName =  global.userNs(req.body.user)+"-"+uuid.v4();
    bucket.create(s3, req.body.user, bucketName, req.body.pics, rek)

    res.send({msg:'All Good!'});
});

// Identifies the user of a given image
app.post('/searchFace', function(req, res){
  
    var output = {} 
    console.log("Call Received");

    //Store image on the defaulFacesBucket
    console.dir(req.body);
    bucket.put(s3, global.faceBucket(),'xxx', req.body.pics,null, function(ret){
        
        ml.searchFaces(rek, global.faceBucket(), ret.Key, function(err, data){
            if (err){
                output = err;
                res.send(output);
            }

            if (data.FaceMatches.length > 0){
                data = data.FaceMatches;
                var extImgId =  '';
                extImgId = data[0].Face.ExternalImageId;
                output.user = extImgId.substring(0,extImgId.indexOf('-'));
                output.Similarity = data[0].Similarity
                res.send(output);
            }else{
                output = data;  
                res.send(output);
            }
            console.log(output);
        })
    });
    //Create a collection on Rekognition for the give user
});

app.post('/initialize', function(req,res){
    //Initialize all the system
    
    if (req.body.collections){
        ml.deleteCollections(rek, function(data){
                //Create a collection on Rekognition for the give user
                ml.createCollection(rek,global.faceCollection())
        });
    }

    if(req.body.buckets){
      bucket.deleteBuckets(s3, function(){
            bucket.create(s3, null, global.faceBucket(), null, null);
      });
    }
});


var server = app.listen(port, function(){
  console.log('Server listening on port '+port);
});
