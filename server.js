const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const RANGE = 'Sheet1!A2:B'; // Adjust sheet and range as necessary

// Setup Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: 'process.env.GOOGLE_CLIENT_EMAIL',
    private_key: 'process.env.GOOGLE_PRIVATE_KEY',
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });

app.get('/api/question', async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = result.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No questions found.' });
    }
    const random = Math.floor(Math.random() * rows.length);
    const [question, answer] = rows[random];

    res.json({ question, answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));