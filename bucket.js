/*
    functions to manage files and bucket storages 
    on AWS S3

*/
var fs = require('fs')
var global = require('./global')
var ml = require('./ml')
var uuid = require('node-uuid');
var request = require('request').defaults({ encoding: null });
var user = '';



module.exports = {
    //Creates a bucket and stores a file if its required
    //It also sned the files to a Rekognition Collection
    create :function (s3, user, files, rek){                
                
                var toBuck= [];
                var fromUrl = false;
                
                if (!files){
                    //No files sent. Read local directory
                    files = fs.readdirSync(global.newImgDir());
                    
                    for(var i in files) {
                        if(files[i].indexOf(user)){
                            toBuck.push(global.newImgDir()+files[i])
                        }
                    }
                }else{
                    fromUrl = true;
                    for(var i in files) {
                        toBuck.push(files[i].url);
                    }
                }

                //Bucket example b1ml-C99998-12dj91dj-192jd129dj1-2d1jd
                var bucket =  global.userNs(user)+"-"+uuid.v4();
                bucket = bucket.toLowerCase();

                var params = {Bucket: bucket};

                s3.createBucket(params, function(err, data) {
                    if (err){
                        console.log(err, err.stack); // an error occurred
                        return;
                    } 
                    console.log("Bucket '"+bucket+"' successfully created.");
                    putObjects(s3, params.Bucket, user, toBuck,fromUrl,rek)
                            
                });
        },

    //Puts file in a given bucket
    put :   function (s3,bucket, user, Body){ 
                putObject(s3, bucket, user, Body);
            }
}

function putObject(s3,bucket, user, body,rek){
    //Upload an object to a given bucket 
    //Add the object to a Rekognition collection

    var params = {Bucket: bucket, Key: user+"-"+uuid.v4(), Body: body};
    s3.putObject(params, function(err, data) {
        if (err)
            console.log(err)
        else
            console.log("Successfully uploaded data to " + bucket + "/" + user);
            ml.indexFace(rek,user,bucket,params.Key )
    });

}

function putObjects(s3, bucket, user, toBuck, fromURL,rek){

    console.log("Putting files to bucket '"+user+"'");

    if (fromURL){
        //Upload files from a given URL array
        for(var i in toBuck) {       
            request.get(toBuck[i], function (err, res, body) {
                console.log("Content retrieved from "+ toBuck[i]);
                putObject(s3, bucket, user, body,rek)
            });       
        }
    }else{
        //Upload files from a given path array
        for(var i in toBuck) {
            fs.readFile(toBuck[i], global.encoding(), function (err,data) { 
                console.log("Reading file retrieved from "+ toBuck[i]);
                putObject(s3, bucket, user, data,rek)
            });  
        }
    }
    return bucket;
}