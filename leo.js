//Load Node Modules
var archiver = require('archiver');
var request = require('request');
var uuid = require('node-uuid');
var fs = require('fs');

//Load Local Modules
config = require('./config.json')

var __dirname = config.SmartShop.imgDir;

console.log(__dirname);


module.exports = {
    updateVectorsBase :function (){                
                return updateVectorsBase();
        }
}

function updateVectorsBase(){
    /*
    This functions reads all images in a given folder, creates a zip, 
    calls SAP Leonardo Image Feature Extraction API and store the results 
    to be used later for Image Comparision
    */

    console.log ('Updating Item Image Vectors Database')
    
    var zipFile = uuid.v4()+'.zip';

    // create a file to stream archive data to. 
    var output = fs.createWriteStream(__dirname + zipFile);
    var archive = archiver('zip', {zlib: { level: 9 }}); // Sets the compression level. 

    // listen for all archive data to be written 
    output.on('close', function() {
       
        extractVectors(__dirname + zipFile, function (vectors){
            //Creates a New Zip File with the vectors of each image
    
            vectors = JSON.parse(vectors);
            if (vectors.feature_vector_list.length <= 0){
                console.error('Could not retrieve vectors from Leonard');
                console.error(vectors);
                return;
            }
    
            zipFile = config.Leonardo.VectorZip;
            output = fs.createWriteStream(__dirname + zipFile);
            archive = archiver('zip', {zlib: { level: 9 }}); // Sets the compression level. 

            // good practice to catch warnings (ie stat failures and other non-blocking errors) 
            archive.on('warning', function(err) {
                if (err.code === 'ENOENT') {
                    // log warning 
                } else {
                    // throw error 
                    throw err;
                }
            });

            // good practice to catch this error explicitly 
            archive.on('error', function(err) {
                throw err;
            });

            output.on('close', function() {
                console.log('feito');
            });

            archive.pipe(output); // pipe archive data to the file 
    
            for(var i = 0; i < vectors.feature_vector_list.length; i++ ){  
                //Change file extension 
                var fileName = vectors.feature_vector_list[i].name
                fileName = fileName.substr(0, fileName.indexOf('.'))+'.txt'
            
                //Add txt file to the Vectors Zip
                var buff =  Buffer.from(JSON.stringify(vectors.feature_vector_list[i].feature_vector), 
                                config.SmartShop.encoding);
                
                archive.append(buff,{ name: fileName });
                console.log('Appending vector of file '+ fileName);
            }                
            
            // finalize the archive (ie we are done appending files but streams have to finish yet) 
            archive.finalize();
        });    
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors) 
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning 
        } else {
            // throw error 
            throw err;
        }
    });

    // good practice to catch this error explicitly 
    archive.on('error', function(err) {
        throw err;
    });

    // pipe archive data to the file 
    archive.pipe(output);
    
    fs.readdirSync(__dirname).forEach(file => {
        // append img files from stream

        if(file.indexOf('.png') !== -1 ||file.indexOf('.jpg') !== -1 || file.indexOf('.jpeg') !== -1){
            var file1 = __dirname + '/'+file;
            archive.append(fs.createReadStream(file1), { name: file });
            console.log(file);
        }
    })
    
    // finalize the archive (ie we are done appending files but streams have to finish yet) 
    archive.finalize();

}

function extractVectors(file, callback){
    
    // More info on
    // https://help.sap.com/viewer/product/SAP_LEONARDO_MACHINE_LEARNING_FOUNDATION/1.0/en-US
    var options = {
        url: 'https://sandbox.api.sap.com/ml/featureextraction/inference_sync',
        headers: {
            'APIKey': config.Leonardo.Credentials.APIKey,
            'Accept': 'application/json'
          },
        formData :{
            files: fs.createReadStream(file)},
    }

    request.post(options, function (err, res, body) {
        if (err) {
            return console.error('extractVectors failed:', err);
            throw err;
        }
        else{
            return callback(body);

        }
      });
}
