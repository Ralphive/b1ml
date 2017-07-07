/*
    functions to manage files and bucket storages 
    on AWS S3

*/
var fs = require('fs')
var global = require('./global')


module.exports = {
    //Creates a bucket and stores a file if its required
    create :function (s3, keyName){                
                var files = fs.readdirSync(global.newImgDir());
                var toBuck= [];

                for(var i in files) {
                   // if(files[i].indexOf(keyName)){
                        toBuck.push(files[i])
                  //  }
                }

                var bucketName = global.namespace()+'-'+keyName;

                var params = {Bucket: bucketName.toLowerCase()};

                s3.headBucket(params, function(err, data) {
                    if (err){
                        //Bucket doesn't exist. So create it
                        console.log("Bucket "+keyName + "Not found, Trying to create it");
                        
                        s3.createBucket(params, function(err, data) {
                            if (err){
                                console.log(err, err.stack); // an error occurred
                                return;
                            } 
                            console.log("Bucket "+keyName+"keyName + Successfully created bucket ");
                            putObjects(s3, params, toBuck);
                        })  
                    }else{
                        putObjects(s3, params, toBuck);
                    }
                });
            },
    
    //Puts file in a given bucket
    put :   function (s3,bucketName, keyName, Body){ 
                putObject(s3, bucketName, keyName, Body);
            }


}

function putObject(s3,bucketName, keyName, Body){
    var params = {Bucket: bucketName, Key: keyName, Body: 'Hello World!'};
        s3.putObject(params, function(err, data) {
            if (err)
            console.log(err)
            else
            console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
        });

}

function putObjects(s3, params, toBuck){
    
    for(var i in toBuck) {
        params.Key = toBuck[i];
        params.Body = 'Content of the file' + toBuck[i];
        s3.putObject(params, function(err, data) {
            if (err)
                console.log(err)
            else
                console.log("Successfully uploaded data to " + params.Bucket + "/" + params.Key);
        });
    }
}
