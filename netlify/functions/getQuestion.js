const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // This points to the root of your project where quizetta.db lives
    const dbPath = path.resolve(__dirname, '../../quizetta.db');

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const question = await db.get('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1');
    await db.close();

    return {
      statusCode: 200,
      body: JSON.stringify(question),
    };
  } catch (error) {
    // This helps you see the error in the Netlify Function logs
    console.error("Database Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch question", details: error.message }),
    };
  }
};