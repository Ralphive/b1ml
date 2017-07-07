var namespace = 'b1ml'
var newImgDir = './uploads/new'
var awsImgDir = './uploads/aws'

module.exports = {
    //Puts file in a given bucket
    namespace : function (){
                return namespace;
            },
            
    newImgDir: function(){
        return newImgDir;
    },
    
    awsImgDir: function(){
        return awsImgDir;
    },
}