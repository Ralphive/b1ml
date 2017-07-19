var namespace = 'b1ml'
var newImgDir = './uploads/new/'
var awsImgDir = './uploads/aws/'
var encoding = 'utf8'
var faceBucket ='auth-faces'
var faceColl   = 'face-collection'
var faceMatch = 80 //%s Threshold


module.exports = {
    //Puts file in a given bucket
    namespace : function (){
                    return namespace;
                },
            
    newImgDir:  function(){
                    return newImgDir;
                },
    
    awsImgDir: function(){
                    return awsImgDir;
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
                }
}

function addNS(name){
    return namespace+'-'+name;
}