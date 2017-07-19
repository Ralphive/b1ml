var global = require('./global');

module.exports = {
    //Create a face collection based on a bucket nae
    createCollection :function (rek, CollectionId){                
                return(createCollection(rek, CollectionId));
            },

    indexFace :function (rek, user, bucket, image){                
                return(indexFace(rek, user, bucket, image));
            },


    //Add object from a bucket to a file
    searchFaces :   function (rek, bucket, key, callback){ 
                return searchFaces(rek, bucket, key, callback);
            },
    deleteCollections: function(rek, callback){
        return deleteCollections(rek, callback);
    }
}


//Creates a  Rekognition Collection for a given user
function createCollection(rek, CollectionId){

    //Collection = Set of faces
    var params = {CollectionId: CollectionId};

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

function indexFace(rek, bucket, image){
    var params = {
            CollectionId: global.faceCollection(), 
            DetectionAttributes: [], 
            ExternalImageId: image, 
            Image: {
                S3Object: {
                    Bucket: bucket, 
                    Name: image
                }   
            }
        }
    
    console.log("Indexing face for "+ image)    
    
    rek.indexFaces(params, function(err, data) {
        if (err) {
            console.error(err,err.stack);
        }
        else{
            console.log("Face for "+image+" indexed successfully")    
            //console.log(data);           // successful response
        }   
    });
}

function searchFaces(rek, bucket, key, callback){
    
    var params = {  CollectionId: global.faceCollection(), 
                    FaceMatchThreshold: global.faceMatch(), 
                    Image: {
                        S3Object: {
                            Bucket: bucket, 
                            Name: key
                        }
                    }, 
                    MaxFaces: 3
                };
    console.log("Searching for a face match");
    rek.searchFacesByImage(params, function(err, data){
        if (err){
            console.log(err, err.stack); // an error occurred
            callback(err, null);
        }else{
                console.log("Retrieving results for face match")
                return callback(null, data)
        }
    });
        
 }

 function deleteCollections(rek,callback){
      rek.listCollections({}, function(err, data) {
        if (err){
            console.log(err, err.stack); // an error occurred
            callback(err, null);
        } 
        else{
            for(var i in data.CollectionIds) {
                console.log("Deleting collection "+ data.CollectionIds[i])
                rek.deleteCollection({CollectionId:data.CollectionIds[i]}, function(err, data) {
                    if (err) console.log(err); // an error occurred
                    else     console.log(data);           // successful response
                });
            }
            return callback(data);
        }
    });
 }

