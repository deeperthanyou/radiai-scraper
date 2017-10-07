/**
 * Created by deep on 3/19/17.
 */

var models = require('./models');
var fs = require('fs');
var request = require('request');
var csvfast = require('fast-csv');
const csvtojson = require('csvtojson');

models.sequelize.sync({
    //force: true
}).then(() => { });

exports.wait = function (ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < (start + ms)) {
        end = new Date().getTime();
    }
};

exports.logError = function (zip, err) {
    fs.writeFile('./requests/errors/request-err-' + zip + '.txt', err, function (err) {
        console.log('Request error');
    });
};

exports.writeToFile = function (body) {
    fs.writeFile('./output.json', body, function (err) {
        console.log('File successfully written! - Check your project directory for the output.json file');
    });
};

exports.makeRequest = function (zip) {
    var options = {
        method: 'GET',
        url: "http://api2.yp.com/listings/v1/search",
        qs: {
            format: 'json',
            key: 'fsq48m5yx9',
            term: 'Ambulance Services',
            searchloc: zip
        },
        headers: {
            'cache-control': 'no-cache',
            'postman-token': 'cdb103d2-3c0f-e889-2d95-701a3d590a58',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
        }
    };

    console.log("requesting... ");
    request(options, (error, response, body) => {
        if (error) {
            console.log(error);
            return logError(zip);
        }

        var json = JSON.parse(body);
        //console.log(json.searchResult.searchListings.searchListing[0]);
        //var listings = json.searchResult.searchListings.searchListing;
        //console.log("response" + response);
        //console.log("body" + body);

        //fs.writeFile('requests/' + zip + '.json', body, function (err) {console.log('Request saved!');});

        try {
            var searchResult = json.searchResult;
            var searchCount = searchResult.metaProperties.listingCount;
            var listings = json.searchResult.searchListings.searchListing;

            if (searchCount == 0) {
                return console.log("no search results for " + zip);
            } else {
                console.log("" + searchCount + " results for " + zip)
            }

            for (var i = 0; i < listings.length; i++) {
                var stationInfo = listings[i];
                //console.log(keys);
                //console.log(stationInfo);

                var info = {};
                if (stationInfo.businessName) {
                    info.businessName = stationInfo.businessName.toString();
                }
                if (stationInfo.email) {
                    info.email = stationInfo.email.toString();
                }
                if (stationInfo.phone) {
                    info.phone = stationInfo.phone.toString();
                }
                if (stationInfo.state) {
                    info.state = stationInfo.state.toString();
                }
                if (stationInfo.city) {
                    info.city = stationInfo.city.toString();
                }
                if (stationInfo.street) {
                    info.street = stationInfo.street.toString();
                }
                if (stationInfo.zip) {
                    info.zip = stationInfo.zip.toString();
                }

                if (stationInfo.categories) {
                    info.categories = stationInfo.categories.toString()
                }

                console.log("Saving info... " + info);
                models.ems_provider.create(info).then((object) => {
                    return console.log("Successfully saved info!");
                }).catch((err) => {
                    if (err.name == 'SequelizeUniqueConstraintError') {
                        return console.log("Already have information for that provider");
                    } else {
                        return console.log("Error: " + err.name);
                    }
                });
            }

        } catch (err) {
            fs.writeFile('./requests/errors/parsing-err-' + zip + '.txt', err.message, function (err) {
                console.log('Error parsing response');
            });
        }


    });
};

var csvFilePath = "zipcodes/zip_code_database.csv";
var csvFileStream = fs.createReadStream(csvFilePath);

exports.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.readFromCSV = function () {
    csvtojson().fromStream(csvFileStream)
        .on('json', function (jsonObj, rowIndex) {
            // combine csv header row and csv line to a json object
            // jsonObj.a ==> 1 or 4
            //console.log("got data: " + jsonObj.zip + " " +rowIndex);

            var low = 0;
            var high = 42612; //max is 42612
            let zip = jsonObj.zip;
            if (jsonObj.state) {
            } else {
                return;
            }

            if ((high > rowIndex) && (rowIndex > low)) {
                console.log("Row:" + rowIndex + " zip:" + zip);
                //makeRequest(zip.toString());
                var cmd = "app.makeRequest(\"" + zip + "\");\n";
                if ((rowIndex % 10) == 0) {
                    //cmd += "wait(getRandomInt(1000, 3000));\n";
                }
                fs.appendFile('./gen/codegen-' + jsonObj.state + '.js', cmd, () => {});

                //wait(getRandomInt(1000, 3000));
            } else {

            }
        })
        .on('done', function (error) {
            console.log('end')
        });
};
//readFromCSV("NJ");
//this.readFromCSV();

// require('./requests/codegen-master').runAll();


