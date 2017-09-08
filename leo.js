//Load Node Modules
var archiver = require('archiver');
var request = require('request');
var uuid = require('node-uuid');
var fs = require('fs');

//Load Local Modules
global = require('./global')

console.log(global.newImgDir());

var __dirname = global.imgDir();

module.exports = {
    updateVectorsBase :function (){                
                return extractImgs();
        }
}

function updateVectorsBase(){
    /*
    This functions reads all images in a given folder, creates a zip, 
    calls SAP Leonardo Image Feature Extraction API and store the results 
    to be used later for Image Comparision
    */
    
    var zipFile = uuid.v4()+'.zip';

    // create a file to stream archive data to. 
    var output = fs.createWriteStream(__dirname + zipFile);
    var archive = archiver('zip', {zlib: { level: 9 }}); // Sets the compression level. 

    // listen for all archive data to be written 
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        extractVectors(__dirname + zipFile)
        
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

function extractVectors(file){
    // To implement image extraction 
    
}
