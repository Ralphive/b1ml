// Load the SDK and UUID
var AWS = require('aws-sdk');
var bucket = require('./bucket') 
var global = require('./global')

//Load Credentials and Region
AWS.config.loadFromPath('./awsConfig.json');
// Create an S3 client (for file management)
var s3 =  new AWS.S3({apiVersion: '2006-03-01'});

var bucketName = global.namespace() +'-ralph';
var keyName = 'hello_world.txt';

bucket.create(s3, bucketName, keyName, AWS.code)


