//Module to retrieve user's profile picture (profile album) given User's Access Token

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

var FB = require('fb'); // Load Facebook module
// var ouserName;          // Store the facebook user name to send together with the pictures in JSON
var oaccessToken;       // User's Access Token retrieved from mobile app's call
var jObject = {};       // Send this JSON to train the ML system
var photoIDs = [];      // Array to store IDs for all photos

module.exports = {
    Connect: function (response) {
        return (Connect(response));
    },
    GetUserProfilePictures: function (accessToken, response) {
        return (GetUserProfilePictures(accessToken, response));
    },
}

function getPhotoURLBatch(photoID){
    // This function returns array of Picture URLs
    // given the Picture IDs (array of photoID) in batch mode
    var eachElement;
    var data;
    var oCompleteCall = {};
    oCompleteCall.batch = [];

    for(var i = 0; i < photoID.length ; i++){
        var oMethodAndURL = {};
        oMethodAndURL.method = 'GET';
    
        oMethodAndURL.relative_url = photoID[i];
        oCompleteCall.batch.push(oMethodAndURL);
    }
    
    FB.api('/', 'POST', {
    batch: JSON.stringify(oCompleteCall.batch),
    include_headers: false,
    access_token: oaccessToken
    }, function (response) {
        for(var i = 0; i < response.length ; i++){            
            eachElement = response[i];
            for (var property in eachElement) {
                if (eachElement.hasOwnProperty(property)) {
                    data = eachElement[property];
                }
            }
            eachElement = JSON.parse(data);
            //Builds JSON object
            //Get the source element which is the URL
            //Clean URL to avoid special char at the begining and at the end of the string
            var urlObj = {url: JSON.stringify(eachElement.source).replace(/['"]+/g, '')};
            jObject.pics.push(urlObj);
            // jObject.user = userName;
        }
    });
}

function formatPictureObject(result){
    // Function to format pictures URL
    var json;
    jObject.pics = [];
    
    for(var i = 0; i < result.data.length ; i++){
        json = result.data[i];
        var photoID = '/' + JSON.stringify(json.id)+ '?fields=source';
        photoID = photoID.replace(/['"]+/g, '');
        photoIDs.push(photoID);
    }
    
    getPhotoURLBatch(photoIDs);
}



function GetUserProfilePictures(accessToken, res){
    // ouserName = userName;
    oaccessToken = accessToken;
    var profilePicsAlbumID;

    FB.api( "/me/albums", {access_token: oaccessToken},
        function (response) {
          if (response && !response.error) {
            for(var i = 0; i < response.data.length ; i++){
                if (response.data[i].name === 'Profile Pictures'){
                    profilePicsAlbumID = response.data[i].id;
                    FB.api(
                        "/"+ profilePicsAlbumID + "/photos",
                        {access_token: oaccessToken},
                        function (response) {
                          if (response && !response.error) {
                            formatPictureObject(response);
                          }
                        }
                    );
                }
            }
          }
        }
    );
}