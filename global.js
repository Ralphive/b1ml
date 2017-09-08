var namespace = 'b1ml'              //Namesspace for every artefact created
var imgDir = './files/imgs/'        //Dir hosting images to be used for comparison
var encoding = 'utf8'               //Default Enconding
var faceBucket ='auth-faces'        //AWS S3 Bucket name
var faceColl   = 'face-collection'  //AWS Rekognition Face Collection Name
var faceMatch = 80                  //%s Threshold for face matching
var serverPort = 8080               // NodeServer Port


module.exports = {
    //Puts file in a given bucket
    namespace : function (){
                    return namespace;
                },
            
    imgDir: function(){
                    return imgDir;
                },
    
    encoding: function (){
                    return encoding;
                },

    userNs: function(user){
                    return addNS(user);
                },
    faceBucket: function(){
                    return addNS(faceBucket);
                },
    faceCollection: function(){
                    return addNS(faceColl);            
                },
    faceMatch: function(){
                    return faceMatch;            
                },
    serverPort: function(){
                    return serverPort;
                }
}

function addNS(name){
    return namespace+'-'+name;
}