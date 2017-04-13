const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const _ = require('lodash');

const secrets = JSON.parse(fs.readFileSync('./secrets.json'));

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = '.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// This makes sure that it doesn't evaluate HYPERLINK to just a name
google.options({params: {valueRenderOption: 'FORMULA'}}); 

/*
 * Gets an array of places to eat in format of
 * {
 *  "name": 'pizza place',
 *  "url": 'http://bestpizzaever.com',
 *  }
 *  */
const getFoodWithHyperlink = (foodCallback) => {
    getFoodMatrix( (food) => {
        // This is a matrix mapped to the NY food spreadsheet
        // The very first row returned is the list of food choices
        const foodListFormulas = _.filter(food[0], (value, key) => {
            // google sheets uses HYPERLINK to specify that is a link
            return _.includes(value, 'HYPERLINK')
        });
        const hyperlinkRemover = new RegExp(/=HYPERLINK\("https?:\/\/([^,]*)", ?"(.*)"/);
        const foodWithHyperlink = _.map(foodListFormulas, (value) => {
            const groups = hyperlinkRemover.exec(value);
            if (groups) {
                return {
                    url: groups[1],
                    name: groups[2],
                }
            }
        });
        foodCallback(foodWithHyperlink);
    });
}

const getFoodMatrix = (foodCallback) => {
    // Load client secrets from a local file.
    accessSpreadsheet('A2:Z20', foodCallback);
};

const bootstrap = () => {
    accessSpreadsheet('A1', () => {
        console.log('Register done');
    });
};

const accessSpreadsheet = (spreadsheetRange, callback) => {
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Sheets API.
        authorize(JSON.parse(content), (auth) => {
            var sheets = google.sheets('v4');
            sheets.spreadsheets.values.get({
                auth: auth,
                spreadsheetId: secrets.spreadsheet_id,
                range: spreadsheetRange,
            }, function(err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                var rows = response.values
                callback(rows);
            });
        });
    });
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
  fs.readFile(TOKEN_PATH, function(err, token) {
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
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
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


module.exports = {
    'getFoodWithHyperlink': getFoodWithHyperlink,
    'bootstrap': bootstrap,
};


