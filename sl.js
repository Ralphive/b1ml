/*
    functions to manage Service Layer services 
*/

var express = require('express');
var http = require('http');

var app = express();

//SL Parameters
//var slUrl = "10.55.129.74"; //frncel1";
var slUrl = "34.202.226.125"; // AWS
var slPort = 50001; //Http
var slPath = "/b1s/v1/";

var BP = "C20000";

var connected = false;
var nodeId = "";
var sessionId = "";

var bodyStr = "";
//var response = null;
var req_options = {};
var post_data = {};
var req = null;


module.exports = {

    Connect: function (response) {
        return (Connect(response));
    },
    GetSimilarItems: function (picture, response) {
        return (GetSimilarItems(picture, response));
    },
    GetDraftOrder: function (bpCode, response) {
        return (GetDraftOrder(bpCode, response));
    },
    CreateDraftOrder: function (draft, response) {
        return (CreateDraftOrder(draft, response));
    },
    CreateOrderFromDraft: function (input, response) {
        return (CreateOrderFromDraft(input, response));
    },

}

/*module.exports = function() {
    // will be nice to setup routes as in XSAProject in frncel1, second step
    var app = express.Router();

    //Hello Router
	app.get("/", function(req, res) {
		res.type("text/html").status(200).send("B1SL Test Initialization Service");
	});

	app.get('/Connect', function(req, response) {
		connect(response);
		//response.send('SL Connection status:' + connected + " - SessionId: " + sessionId);
	});

	app.get('/Items', function(req, response) {
		getItems(response);
		//res.status(200).send ('Items GET status: ' + connected + " - SessionId: "+ sessionId);
	});
*/
function Connect(response) {
    console.log('SL Connect: ');

    post_data = JSON.stringify({
        UserName: "manager",
        Password: "1234",
        CompanyDB: "SBODEMOUS"
    });

    //Http Post options
    req_options = {
        hostname: slUrl,
        port: slPort,
        path: slPath + "Login",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Length': post_data.length
        }
    };

    //Make the request
    req = http.request(req_options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));

        var setcookie = res.headers["set-cookie"];
        if (setcookie) {
            setcookie.forEach(function (cookiestr) {
                console.log("COOKIE:" + cookiestr);
                sessionId = cookiestr;
            });
        }

        res.setEncoding('utf8');

        //Show the response on log
        res.on('data', function (chunk) {
            console.log('Response: ', chunk);
            connected = true;
            response.send('SL Connection status:' + connected + " - SessionId: " + sessionId);
        });

    });

    //Shows errors if there are any:
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(post_data);
    req.end();

}
/* TO TEST request method instead of http.request, cleaner code
function ralph() {
 
    request(url, function (error, response, body) {
            if (error){
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                console.log('error:', error); // Print the error if one occurred 
            }else{
                body = JSON.parse(body);
                
                var FiatExRate = [];
                for (var key in body.rates) {
                    FiatExRate[key] = 1/body.rates[key]             
                    
                    console.log(key +' x '+base+' exchange rate is '+FiatExRate[key]);
                 }
                 callback(FiatExRate);
            } 
     
    
}
*/

function GetSimilarItems(picture, response) {
    console.log('GetSimilarItems ');

    //Http request options
    req_options = {
        hostname: slUrl,
        port: slPort,
        path: slPath + "Items?$top=3&$select=ItemCode,ItemName", //TODO: , PictureURL when UDF available
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Cookie': sessionId
        }
    };

    //Make the get
    req = http.get(req_options, function (res) {
        bodyStr = "";

        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));

        // Get cookie on each request (can change routeId)
        var setcookie = res.headers["set-cookie"];
        if (setcookie) {
            setcookie.forEach(function (cookiestr) {
                console.log("COOKIE:" + cookiestr);
                sessionId = cookiestr;
            });
        }

        res.setEncoding('utf8');

        //Get the response
        res.on('data', function (chunk) {
            bodyStr += chunk;
        });

        //Show the response on log
        res.on('end', function () {
            console.log('GET Item succeded. ' + bodyStr);

            var resItem = new Array();
            var count = 0;

            var itemList = JSON.parse(bodyStr).value;
            for (var item of itemList) {
/*
                // Get Item Price based on BP for each Item -----------------------------------------------------------------
                // TODO: Maybe build a Script to make a single call for several items
                // Need to synchronize the loop and the async calls if not using single script!!!

                var reqPrice = {
                    ItemPriceParams: {
                        CardCode: BP,
                        ItemCode: item.ItemCode
                    }
                };

                post_data = JSON.stringify(reqPrice);

                console.log('Get Item Price ' + post_data);

                //Http Post options
                req_options_item = {
                    hostname: slUrl,
                    port: slPort,
                    path: slPath + "CompanyService_GetItemPrice",
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Content-Length': post_data.length,
                        'Cookie': sessionId
                    }
                };

                //Make the request
                reqItemPrice = http.request(req_options_item, function (resItemPrice) {
                    bodyStr = "";
                    console.log('STATUS: ' + resItemPrice.statusCode);
                    console.log('HEADERS: ' + JSON.stringify(resItemPrice.headers));

                    var setcookie = resItemPrice.headers["set-cookie"];
                    if (setcookie) {
                        setcookie.forEach(function (cookiestr) {
                            console.log("COOKIE:" + cookiestr);
                            sessionId = cookiestr;
                        });
                    }

                    resItemPrice.setEncoding('utf8');

                    //Get the response
                    resItemPrice.on('data', function (chunk) {
                        bodyStr += chunk;
                        //console.log('CREATE Order data');
                    });

                    //Show the response on log
                    resItemPrice.on('end', function () {
                        console.log('CREATE Order end' + bodyStr.substring(0, 100));
                        // format return message
                        var price = JSON.parse(bodyStr);
                        var resItem = {
                            ItemCode: fullItem.ItemCode,
                            ItemName: fullItem.ItemName,
                            Price: price.Price,
                            Currency: price.Currency,
                            PictureURL: "https://i.imgur.com/evrXXzM.jpg"
                        };

                    });
                    reqItemPrice.write(post_data);
                    reqItemPrice.end();
                });

                //Shows errors if there are any:
                reqItemPrice.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });

                //------------------------------------------------------------------------------------------------------------------

                // Get Item Price based on BP -----------------------------------------------------------------
                */
                resItem[count] = {
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    Price: 11,  // Needs to be retrieved with CompanyService_GetItemPrice service
                    Currency: "$", // Needs to be retrieved with CompanyService_GetItemPrice service
                    PictureURL: "https://i.imgur.com/evrXXzM.jpg" // Need to create UDF
                };
                count++;
            }
            response.send(JSON.stringify(resItem));
        });
    });

    //Shows errors if there are any:
    req.on('error', function (e) {
        console.error('problem with get Items: ' + e.stack);
    });

    //automatically called for get
    //req.end();

}


// Get Last Draft Order created by this customer
/* Required fields
{
   CardCode: "C20000",
   CardeName: "Yatsea",
   DocEntry: 100,
   DocCurrency: "USD",
   DocumentLines: [
     {
       LineNum: 0,
       ItemCode: "A00001",
       ItemDescription: "IBM Printer",
       Quantity: "2",
       UnitPrice: "100",
       LineTotal: "215",
       ImageUrl: "http://..." //I need the image url to display, you may need work it out with multiple call.
     },
      {
       LineNum: 0,
       ItemCode: "A00001",
       ItemDescription: "IBM Printer",
       Quantity: "2",
       UnitPrice: "100",
       LineTotal: "215",
       ImageUrl: "http://..."
     }
   ]
}
*/
function GetDraftOrder(bpCode, response) {

    // Default BP value predefined!
    if (!bpCode)
        bpCode = BP;

    console.log('GetDraftOrder ' + bpCode);

    //Http GET options
    // TODO: Set B1SESSION in cookie
    req_options = {
        hostname: slUrl,
        port: slPort,
        path: slPath + "Drafts?$filter=CardCode%20eq%20'" + bpCode + "'&$orderby=DocEntry%20desc&$top=1&$select=DocEntry,CardCode,CardName,DocCurrency,DocDate,DocumentLines",
        //method  : 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Cookie': sessionId
        }
    };

    //Make the get
    req = http.get(req_options, function (res) {
        bodyStr = "";

        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));

        // Get cookie on each request (can change routeId)
        var setcookie = res.headers["set-cookie"];
        if (setcookie) {
            setcookie.forEach(function (cookiestr) {
                console.log("COOKIE:" + cookiestr);
                sessionId = cookiestr;
            });
        }

        res.setEncoding('utf8');

        //Get the response
        res.on('data', function (chunk) {
            bodyStr += chunk;
        });

        //Show the response on log
        res.on('end', function () {
            console.log('GET Draft succeded. ' + bodyStr);

            // Not required after PL08 as possible to filter DocumentLines
            var fullDraft = JSON.parse(bodyStr).value[0];

            var resDraft = {
                DocEntry: fullDraft.DocEntry,
                CardCode: fullDraft.CardCode,
                CardName: fullDraft.CardName,
                DocCurrency: fullDraft.DocCurrency
            };
            var count = 0;
            resDraft.DocumentLines = new Array();

            //TODO: Get URLs from B1 CDS system when ready
            for (var draftLine of fullDraft.DocumentLines) {
                resDraft.DocumentLines[count] = {
                    LineNum: draftLine.LineNum,
                    ItemCode: draftLine.ItemCode,
                    ItemDescription: draftLine.ItemDescription,
                    Quantity: draftLine.Quantity,
                    UnitPrice: draftLine.UnitPrice,
                    LineTotal: draftLine.LineTotal,
                    PictureURL: "https://i.imgur.com/evrXXzM.jpg"
                };
                count++;
                continue;
            }

            response.send(JSON.stringify(resDraft));
        });
    });

    //Shows errors if there are any:
    req.on('error', function (e) {
        console.error('problem with get Orders: ' + e.stack);
    });

    //automatically called for get
    //req.end();

}

// {
// 	"User": "FacebookID",
// 	"DocumentLines": [
//         {
//             "ItemCode": "A00002",
//             "Quantity": 1,
//             "Price":100
//         },
//         {
//             "ItemCode": "A00003",
//             "Quantity": 2,
//             "Price":50
//         }]
// });
function CreateDraftOrder(inDraft, response) {
    console.log('CreateDraftOrder ' + inDraft);

    var objInDraft = JSON.parse(inDraft);

    var objDraft = {
        CardCode: BP,
        Comments: objInDraft.User,
        DocObjectCode: 17
    };
    var count = 0;
    objDraft.DocumentLines = new Array();

    for (var draftLine of objInDraft.DocumentLines) {
        objDraft.DocumentLines[count] = {
            ItemCode: draftLine.ItemCode,
            Quantity: draftLine.Quantity,
            Price: draftLine.Price
        };
        //console.log("New order line " + orderLine.LineNum);
        count++;
        continue;
    }

    post_data = JSON.stringify(objDraft);

    //Http Post options
    req_options = {
        hostname: slUrl,
        port: slPort,
        path: slPath + "Drafts",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Length': post_data.length,
            'Cookie': sessionId
        }
    };

    //Make the request
    req = http.request(req_options, function (res) {
        bodyStr = "";
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));

        var setcookie = res.headers["set-cookie"];
        if (setcookie) {
            setcookie.forEach(function (cookiestr) {
                console.log("COOKIE:" + cookiestr);
                sessionId = cookiestr;
            });
        }

        res.setEncoding('utf8');

        //Get the response
        res.on('data', function (chunk) {
            bodyStr += chunk;
        });

        //Show the response on log
        res.on('end', function () {
            console.log('CREATE Draft succeded. ' + bodyStr);

            // format return message
            var newDraft = JSON.parse(bodyStr);
            var resDraftr = {
                DocNum: newDraft.DocNum,
                DocTotal: newDraft.DocTotal
            }
            response.send(JSON.stringify(resDraftr));
        });
    });

    //Shows errors if there are any:
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(post_data);
    req.end();
}

// Should be implemented in SL Script Engine, just here provisory while finding out how to do with B1CDS///////////////////////////
/* Body
{
    DraftEntry: 100,
    DocumentLines: [{
        LineNum: 0
      },
      {
        LineNum: 1
      }
    ]
  };
 */
// Should be a single SL request, to be implemented in Script Engine
// Workaround!
function CreateOrderFromDraft(inOrder, response) {
    console.log('CreateOrderFromDraft ' + inOrder);

    var objInOrder = JSON.parse(inOrder);

    // Get Draft Details
    var docEntry = objInOrder.DraftEntry;
    console.log('GetDraftOrder ' + docEntry);

    //Http GET options
    // TODO: Set B1SESSION in cookie
    req_options = {
        hostname: slUrl,
        port: slPort,
        path: slPath + "Drafts?$filter=DocEntry%20eq%20" + docEntry + "&$select=DocEntry,CardCode,DocumentLines",
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Cookie': sessionId
        }
    };

    //Make the get
    req = http.get(req_options, function (res) {
        //req = http.request(req_options, function (res) {
        bodyStr = "";

        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));

        // Get cookie on each request (can change routeId)
        var setcookie = res.headers["set-cookie"];
        if (setcookie) {
            setcookie.forEach(function (cookiestr) {
                console.log("COOKIE:" + cookiestr);
                sessionId = cookiestr;
            });
        }

        res.setEncoding('utf8');

        //Get the response
        res.on('data', function (chunk) {
            bodyStr += chunk;
            //console.log('GET Draft res.on(\'data\'');
        });

        //Show the response on log
        res.on('end', function () {
            console.log('GET Draft res.on(\'end\' ' + bodyStr.substring(0, 100));

            // Create Order----------------------------------------------------------------------------------------------------

            var draft = JSON.parse(bodyStr).value[0];

            var order = {
                CardCode: draft.CardCode,
                DocDueDate: new Date().toISOString().slice(0, 10)
            };
            var count = 0;
            order.DocumentLines = new Array();

            for (var orderLine of objInOrder.DocumentLines) {

                for (var draftLine of draft.DocumentLines) {
                    if (draftLine.LineNum == orderLine.LineNum) {
                        order.DocumentLines[count] = {
                            ItemCode: draftLine.ItemCode,
                            Quantity: draftLine.Quantity,
                            Price: draftLine.Price
                        };
                        //console.log("New order line " + orderLine.LineNum);
                        count++;
                        continue;
                    }
                }
            }

            post_data = JSON.stringify(order);

            console.log('CREATE Order ' + post_data);

            //Http Post options
            req_options_order = {
                hostname: slUrl,
                port: slPort,
                path: slPath + "Orders",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Content-Length': post_data.length,
                    'Cookie': sessionId
                }
            };

            //Make the request
            reqOrder = http.request(req_options_order, function (resOrder) {
                bodyStr = "";
                console.log('STATUS: ' + resOrder.statusCode);
                console.log('HEADERS: ' + JSON.stringify(resOrder.headers));

                var setcookie = resOrder.headers["set-cookie"];
                if (setcookie) {
                    setcookie.forEach(function (cookiestr) {
                        console.log("COOKIE:" + cookiestr);
                        sessionId = cookiestr;
                    });
                }

                resOrder.setEncoding('utf8');

                //Get the response
                resOrder.on('data', function (chunk) {
                    bodyStr += chunk;
                    //console.log('CREATE Order data');
                });

                //Show the response on log
                resOrder.on('end', function () {
                    console.log('CREATE Order end' + bodyStr.substring(0, 100));
                    // format return message
                    var newOrder = JSON.parse(bodyStr);
                    var resOrder = {
                        DocNum: newOrder.DocNum,
                        DocTotal: newOrder.DocTotal
                    }
                    response.send(JSON.stringify(resOrder));
                });
            });

            //Shows errors if there are any:
            reqOrder.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });

            reqOrder.write(post_data);
            reqOrder.end();
            //------------------------------------------------------------------------------------------------------------------
        });
    });

    //Shows errors if there are any:
    req.on('error', function (e) {
        console.error('problem with get Orders: ' + e.stack);
    });

    req.end();
}

