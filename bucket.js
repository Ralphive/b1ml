/*
    functions to manage files and bucket storages 
    on AWS S3

*/

module.exports = {
    //Creates a bucket and stores a file if its required
    create :function (s3, bucketName, keyName, Body){
                s3.createBucket({Bucket: bucketName}, function(err, data) {
                    if (err){
                        console.log(err, err.stack); // an error occurred
                        return;
                    } 
                    
                    if(keyName){
                        putObject(s3,bucketName, keyName, Body)
                    }else{
                        console.log("Successfully created bucket " + bucketName);
                    }
                });
            },
    
    //Puts file in a given bucket
    put :   function (s3,bucketName, keyName, Body){ 
                putObject(s3, bucketName, keyName, Body);
            }

    //exist: function (s3, ) 

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

