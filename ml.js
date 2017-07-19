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
    listCollection :   function (rek){ 

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
    })

 };


