const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../../client_secret.json");
const moment = require('moment-timezone');

const getGoogleSheet = async (spreadsheetId) => {
    const doc = new GoogleSpreadsheet(spreadsheetId);

    // Authentication using Google Service Account (See client_secret.json)
    doc.useServiceAccountAuth(creds);

    // loads document properties and worksheets
    await doc.loadInfo(); 

    return doc;
}

const getTopics = async () => {
    const doc = await getGoogleSheet(process.env.TOPIC_SPREADSHEET_ID);

    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();

    let result = [];

    for (let i = 0; i < sheet.rowCount; i++) {
        if (!rows[i]) break;
        result.push({ text: rows[i].Title, value: rows[i].Value });
    }

    return result;
};

const captureResponses = async (messageId, username, currentTime, usersRequestingSupport, selectedTopic, summaryDescription) => {
    const doc = await getGoogleSheet(process.env.RESPONSES_SPREADSHEET_ID);

    const sheet = doc.sheetsByIndex[0];

    const userList = usersRequestingSupport.join(', ');

    const dateFormatted = moment.tz(currentTime, "America/New_York").format('LLLL');

    const row = await sheet.addRow({ 
        MessageId: messageId,
        SubmittedBy: username,
        DateTimeUTC: currentTime,
        DateTimeEST: dateFormatted,
        Users: userList, 
        Topic: selectedTopic, 
        Summary: summaryDescription, 
        AssignedTeam: 'none' 
    });
};

module.exports = {
    getTopics,
    captureResponses
};