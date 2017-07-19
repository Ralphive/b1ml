var global = require('./global');

module.exports = {
    //Create a face collection based on a bucket nae
    createCollection :function (rek, keyName){                
                return(createCollection(rek, keyName));
            },

    indexFace :function (rek, user, bucket, image){                
                return(indexFace(rek, user, bucket, image));
            },


    //Add object from a bucket to a file
    searchFaces :   function (rek, bucket, key, callback){ 
                return searchFaces(rek, bucket, key, callback);
            }
}


//Creates a  Rekognition Collection for a given user
function createCollection(rek, user){

    //Collection = Set of faces
    var params = {CollectionId: global.userNs(user)};

    rek.createCollection(params, function(err, data) {
        if (err){
            //Normally collection already exists
            console.error("Error creating collection "+params.CollectionId)
            console.error(err);
        }else{
            console.log("Collection'"+params.CollectionId+"' created successfully!") ;
            console.log(data);           // successful response
        }
    });
}

function indexFace(rek, user, bucket, image){
    var params = {
            CollectionId: global.userNs(user), 
            DetectionAttributes: [], 
            ExternalImageId: image, 
            Image: {
                S3Object: {
                    Bucket: bucket, 
                    Name: image
                }   
            }
        }
    
    console.log("Indexing face for user '"+user+"' from image "+ image)    
    
    rek.indexFaces(params, function(err, data) {
        if (err) {
            console.error(err,err.stack);
        }
        else{
            console.log("Face user '"+user+"' from image "+ image+" indexed successfully")    
            console.log(data);           // successful response
        }   
    });
}


function searchFaces(rek, bucket, key, callback){
    
    var params = {};
    rek.listCollections(params, function(err, data) {
        if (err){
            console.log(err, err.stack); // an error occurred
            callback(err, null);
        } 
        else{
            for(var i in data.CollectionIds) {
                console.log("Checking image in collection "+data.CollectionIds[i])

                params = {  CollectionId: data.CollectionIds[i], 
                            FaceMatchThreshold: global.faceMatch(), 
                            Image: {
                                S3Object: {
                                    Bucket: bucket, 
                                    Name: key
                                }
                            }, 
                            MaxFaces: 3
                        };
            
                rek.searchFacesByImage(params, function(err, data){
                    if (err){
                        console.log(err, err.stack); // an error occurred
                        //callback(err, null);
                    }else{
                        if (data.FaceMatches.length > 0){
                            return callback(null, data.FaceMatches)
                        }
                    }
                });
            }  
        }
    }); 
 }