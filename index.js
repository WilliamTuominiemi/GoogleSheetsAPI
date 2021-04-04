const fs = require('fs')
// BEFORE RUNNING:
// ---------------
// 1. If not already done, enable the Google Sheets API
//    and check the quota for your project at
//    https://console.developers.google.com/apis/api/sheets
// 2. Install the Node.js client library by running
//    `npm install googleapis --save`
// 3. Download credentials.json from your Google Cloud Platform Console app credentials

const readline = require('readline')
const {google} = require('googleapis')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
// Authorize using one of the following scopes:
  //   'https://www.googleapis.com/auth/drive'
  //   'https://www.googleapis.com/auth/drive.file'
  //   'https://www.googleapis.com/auth/spreadsheets'
// Quickstart has .readonly at the end, remove that shit. 

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err)
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), read_data)
})


// Creating a spreadsheet
const create_spreadsheet = (auth) => {
  const sheets = google.sheets({version: 'v4', auth})

  const request = {
    auth: auth
  }

  // Create spreadsheet function
  const response = sheets.spreadsheets.create(request, (err, response) => {
    if (err) return console.log('The API returned an error: ' + err)     
    console.log(JSON.stringify(response, null, 2))
  })
}

// Appending data to sheet
const append_data = (auth) => {
  const sheets = google.sheets({version: 'v4', auth})

  const request = {
    spreadsheetId: '1aQTnAYFqDZsUNA1o0Q1-FXMJJxpRNa4acinTBs4j_Gk',   // The ID of the spreadsheet to update.
    range: 'Sheet1!A:B',  // Values are appended after the last row of the table.
    valueInputOption: 'USER_ENTERED', // How the input data should be interpreted.
    insertDataOption: 'INSERT_ROWS',   // How the input data should be inserted.
    resource: {
        "majorDimension": "ROWS",
        "values": [["Row 1 Col 1","Row 1 Col 2"], ["Row 2 Col 1","Row 2 Col 2"]]
    },
    auth: auth, // Authorize
  }

  // Append function
  const response = sheets.spreadsheets.values.append(request, (err, response) => {
    if (err) return console.log('The API returned an error: ' + err)     
    console.log(JSON.stringify(response, null, 2))
  })
}

const read_data = (auth) => {
  const sheets = google.sheets({version: 'v4', auth})
  
  const request = {
    spreadsheetId: '1aQTnAYFqDZsUNA1o0Q1-FXMJJxpRNa4acinTBs4j_Gk',  // The ID of the spreadsheet to update.
    range: 'Sheet1!A1:A4',
  }

  // Get data function
  const response = sheets.spreadsheets.values.get(request, (err, response) => {
    if (err) return console.log('The API returned an error: ' + err)
    const rows = response.data.values // Formats response
    console.log(rows)
  })
}

const update_data = (auth) => {
  const sheets = google.sheets({version: 'v4', auth})

  const request = {
    spreadsheetId: '1aQTnAYFqDZsUNA1o0Q1-FXMJJxpRNa4acinTBs4j_Gk',  // The ID of the spreadsheet to update.
    range: 'Sheet1!A1', // Update value on sheet1 A1
    valueInputOption: 'USER_ENTERED', // How the input data should be interpreted.
    resource: {
        "majorDimension": "ROWS",
        "values": [["7","7","7"]]
    },
    auth: auth, // Authorize
  }

  // Update function
  const response = sheets.spreadsheets.values.update(request, (err, response) => {
    if (err) return console.log('The API returned an error: ' + err)     
    console.log(JSON.stringify(response, null, 2))
  })
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (credentials, callback) => {
  const {client_secret, client_id, redirect_uris} = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */

const getNewToken = (oAuth2Client, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */

const listMajors = (auth) => {
  const sheets = google.sheets({version: 'v4', auth})
  sheets.spreadsheets.values.get({
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    range: 'Class Data!A2:E',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err)
    const rows = res.data.values
    if (rows.length) {
      console.log('Name, Major:')
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[4]}`)
      })
    } else {
      console.log('No data found.')
    }
  })
}