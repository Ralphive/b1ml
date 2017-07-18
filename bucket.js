/*
    functions to manage files and bucket storages 
    on AWS S3

*/
var fs = require('fs')
var global = require('./global')
var uuid = require('node-uuid');
var request = require('request').defaults({ encoding: null });



module.exports = {
    //Creates a bucket and stores a file if its required
    create :function (s3, keyName, files){                
                
                var toBuck= [];
                var fromUrl = false;
                
                if (!files){
                    //No files sent. Read local directory
                    files = fs.readdirSync(global.newImgDir());
                    
                    for(var i in files) {
                        if(files[i].indexOf(keyName)){
                            toBuck.push(global.newImgDir()+files[i])
                        }
                    }
                }else{
                    fromUrl = true;
                    for(var i in files) {
                        toBuck.push(files[i].url);
                    }
                }

                var bucketName = global.namespace()+'-'+keyName;

                var params = {Bucket: bucketName.toLowerCase()};

                s3.headBucket(params, function(err, data) {
                    if (err){
                        //Bucket doesn't exist. So create it
                        console.log("Bucket '"+keyName +"' not found, Trying to create it");
                        
                        s3.createBucket(params, function(err, data) {
                            if (err){
                                console.log(err, err.stack); // an error occurred
                                return;
                            } 
                            console.log("Bucket '"+keyName+"' successfully created.");
                            putObjects(s3, params.Bucket, keyName, toBuck,fromUrl);

                        })  
                    }else{
                        putObjects(s3, params.Bucket, keyName, toBuck,fromUrl);
                    }
                });
            },

    //Puts file in a given bucket
    put :   function (s3,bucket, keyName, Body){ 
                putObject(s3, bucket, keyName, Body);
            }


}

function putObject(s3,bucket, keyName, body){

    var params = {Bucket: bucket, Key: keyName, Body: body};
    s3.putObject(params, function(err, data) {
        if (err)
            console.log(err)
        else
            console.log("Successfully uploaded data to " + bucket + "/" + keyName);
    });

}

function putObjects(s3, bucket, keyName, toBuck, fromURL){

    console.log("Putting files to bucket '"+keyName+"'");

    if (fromURL){
        //Upload files from a given URL array
        for(var i in toBuck) {       
            request.get(toBuck[i], function (err, res, body) {
                console.log("Content retrieved from "+ toBuck[i]);
                putObject(s3, bucket, keyName + "-" + uuid.v4(), body)
            });       
        }
    }else{
        //Upload files from a given path array
        for(var i in toBuck) {
            fs.readFile(toBuck[i], global.encoding(), function (err,data) { 
                console.log("Reading file retrieved from "+ toBuck[i]);
                putObject(s3, bucket, keyName + "-" + uuid.v4(), data)
            });  
        }
    }
}