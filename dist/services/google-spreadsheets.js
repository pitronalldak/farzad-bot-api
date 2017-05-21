'use strict';

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var moment = require('moment');
// test: 15xQEWvKK88W4eALxThmtHIzsdPXFqfYHir8QvjH8Jq0
// origin: 1LOUGqVKIm-crpOjIgTPUY7QlY6ubaSyclRZjqsGUx2U
// dev: 1TAidjIed5goBfdtIk81L955tSx-zyChioCHT2VzkdBg
// v2 dev: 1-ZFmyF-Iz7wyzdMLGEI9IjBbxL9l_FSFG8ogqWLVJc8
var spreadsheet = '1TAidjIed5goBfdtIk81L955tSx-zyChioCHT2VzkdBg';

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file.

exports.postSpreadSheets = function (questions, users, surveys) {
    var content = {
        installed: {
            client_id: "554247570808-07ll9564csph8445unhj7fte8robleun.apps.googleusercontent.com",
            project_id: "linen-marking-160519", "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://accounts.google.com/o/oauth2/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_secret: "SOj3OpyBghrWB1Ds-j3UCIan",
            redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"] }
    };

    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(content, listMajors(questions, users, surveys));
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Helper mapping count to letter
 * It's one-based, so 1 is A, 26 is Z, 27 is AA.
 */
function toLetters(num) {
    "use strict";

    var mod = num % 26,
        pow = num / 26 | 0,
        out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
    return pow ? toLetters(pow) + out : out;
}

/**
 * Print the data in a spreadsheet:
 */
function writeDataToSheets(auth, sheets, users, questions, survey) {
    var userList = [];
    var columns = [];
    var userQuantity = 0;
    var questionQuantity = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = users[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var user = _step.value;

            if (user.survey === survey.id) {
                userQuantity++;
                var juser = [];
                juser.push({
                    userEnteredValue: {
                        stringValue: user.telegramId
                    }
                });
                juser.push({
                    userEnteredValue: {
                        stringValue: user.date
                    }
                });
                juser.push({
                    userEnteredValue: {
                        stringValue: user.username
                    }
                });
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = user.answers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var answer = _step3.value;

                        var answ = '';
                        if (answer.answerId) {
                            answ = answer.answerId;
                        } else {
                            answ = answer.answer;
                        }
                        juser.push({
                            userEnteredValue: {
                                stringValue: answ
                            }
                        });
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                userList.push({
                    values: juser
                });
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    userList.sort(function (a, b) {
        if (moment().diff(a.values[1].userEnteredValue.stringValue) > moment().diff(b.values[1].userEnteredValue.stringValue)) {
            return -1;
        }
        if (moment().diff(a.values[1].userEnteredValue.stringValue) < moment().diff(b.values[1].userEnteredValue.stringValue)) {
            return 1;
        }
    });
    columns.push({
        userEnteredValue: {
            stringValue: 'telegramId'
        }
    }, {
        userEnteredValue: {
            stringValue: 'date'
        }
    }, {
        userEnteredValue: {
            stringValue: 'Username'
        }
    });
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = questions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var q = _step2.value;

            if (q.survey === survey.id) {
                questionQuantity++;
                columns.push({
                    userEnteredValue: {
                        stringValue: q.question
                    }
                });
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    columns.push({
        userEnteredValue: {
            stringValue: 'total number of questions - ' + questionQuantity
        }
    }, {
        userEnteredValue: {
            stringValue: 'total number of users - ' + userQuantity
        }
    });
    sheets.spreadsheets.get({
        spreadsheetId: spreadsheet,
        includeGridData: true,
        auth: auth
    }, function (err, receivedSpreadsheet) {
        if (err) {
            console.log(err);
            return;
        }
        var sheetId = receivedSpreadsheet.sheets.find(function (sheet) {
            return sheet.properties.title === survey.name;
        }).properties.sheetId;
        var values = [{
            values: columns
        }];
        userList.forEach(function (user) {
            return values.push(user);
        });
        sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheet,
            resource: {
                requests: [{
                    updateCells: {
                        fields: '*',
                        start: {
                            sheetId: sheetId,
                            rowIndex: 0,
                            columnIndex: 0
                        },
                        rows: values
                    }
                }]
            },
            auth: auth
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            console.log(response);
        });
    });
}

var listMajors = function listMajors(questions, users, surveys) {
    return function (auth) {
        var sheets = google.sheets('v4');
        sheets.spreadsheets.get({
            spreadsheetId: spreadsheet,
            includeGridData: true,
            auth: auth
        }, function (err, receivedSpreadsheet) {
            if (err) {
                console.log(err);
                return;
            }
            surveys.forEach(function (survey) {
                if (!receivedSpreadsheet.sheets.some(function (sheet) {
                    return sheet.properties.title === survey.name;
                })) {
                    sheets.spreadsheets.batchUpdate({
                        spreadsheetId: spreadsheet,
                        resource: {
                            requests: [{
                                addSheet: {
                                    properties: {
                                        title: survey.name
                                    }
                                }
                            }]
                        },
                        auth: auth
                    }, function (err, response) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        writeDataToSheets(auth, sheets, users, questions, survey);
                    });
                } else {
                    writeDataToSheets(auth, sheets, users, questions, survey);
                }
            });
        });
    };
};
//# sourceMappingURL=google-spreadsheets.js.map