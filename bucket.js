/*
    functions to manage files and bucket storages 
    on AWS S3

*/
var fs = require('fs')
var ml = require('./ml')
var uuid = require('node-uuid');
var request = require('request').defaults({ encoding: null });
var user = '';

var config  = require('./config.json');



module.exports = {
    //Creates a bucket and stores a file if its required
    //It also sned the files to a Rekognition Collection
    create :function (s3, user, bucket, files, rek){                
                return createBucket(s3, user, bucket, files, rek);
        },

    //Puts file in a given bucket
    put :   function (s3, bucket, user, files,rek, callback){ 
                putObjects(s3, bucket, user, files,rek, callback);
            }
}


function createBucket(s3, user, bucket, files, rek){                
                
    //Bucket example b1ml-C99998-12dj91dj-192jd129dj1-2d1jd
    bucket = bucket.toLowerCase();

    var params = {Bucket: bucket};

    s3.createBucket(params, function(err, data) {
        if (err){
            console.log(err, err.stack); // an error occurred
            return;
        } 
        console.log("Bucket '"+bucket+"' successfully created.");
        if (files){
            putObjects(s3, params.Bucket, user, files,rek)
        }       
    });
}

function putObjects(s3, bucket, user, files,rek,callback){

    for(var i in files ) {   
        if (files[i].url!=""){
            getFileData(files[i].url,function(body){
             putObject(s3, bucket, user, body,rek, function(data){
                 if (callback){
                     return callback(data);
                 }
             })
        });
        }
    }
}

function getFileData(path,callback){
    request.get(path, function (err, res, body) {
        console.log("Content retrieved from "+ path);
        return(callback(body));
    })    
}

function putObject(s3,bucket, user, body,rek,callback){
    //Upload an object to a given S3 bucket 
    //Add the object to a Rekognition collection if required
    //Callback recommended for a single file only (to retrieve fileID)

    var params = {Bucket: bucket, Key: user+"-"+uuid.v4(), Body: body};
    
    console.log("Putting file "+params.Key+" to bucket "+bucket);
    
    s3.putObject(params, function(err, data) {
        if (err){ 
            console.log(err)
            return(callback(err))
        }else{
            console.log("Successfully uploaded files to " + bucket + "/" + params.Key);
            if(rek){
                ml.indexFace(rek,bucket,params.Key )
            }
            params.data = data;
            
            if(callback){
                return(callback(params));
            }
        }     
    });
}
