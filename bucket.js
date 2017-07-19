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
    create :function (s3, user, bucket, files, rek){                
                
                var toBuck= [];
                var fromUrl = false;
                
                if (!files){
                    //No files sent. Read local directory
                    files = fs.readdirSync(global.newImgDir());
                    
                    for(var i in files) {
                        if(files[i].indexOf(user)>=0){
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
    put :   function (s3, bucket, user, toBuck, fromURL,rek, callback){ 
                putObjects(s3, bucket, user, toBuck, fromURL,rek, callback);
            }
}


function putObjects(s3, bucket, user, toBuck, fromURL,rek,callback){


    for(var i in toBuck) {   
        getFileData(fromURL,toBuck[i],function(body){
             putObject(s3, bucket, user, body,rek, function(data){
                 if (callback){
                     return callback(data);
                 }
             })
        });
    }
}

function getFileData(fromURL,path,callback){
    if (fromURL){  
        request.get(path, function (err, res, body) {
            console.log("Content retrieved from "+ path);
            return(callback(body));
        })
    }else{
        fs.readFile(toBuck[i], global.encoding(), function (err,data) { 
            console.log("Reading file retrieved from "+ toBuck[i]);
            return(callback(data));
        });  
    }
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
                ml.indexFace(rek,user,bucket,params.Key )
            }
            params.data = data;
            
            if(callback){
                return(callback(params));
            }
        }     
    });
}
