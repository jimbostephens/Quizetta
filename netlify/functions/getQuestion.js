const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // This points to the root of your project where quizetta.db lives
    const dbPath = path.resolve(__dirname, '../../quizetta.db');

// Inside your exports.handler
const exclude = event.queryStringParameters.exclude;

// If we have IDs to skip, we use "NOT IN", otherwise we just grab any random row
const query = exclude 
    ? `SELECT * FROM questions WHERE id NOT IN (${exclude}) ORDER BY RANDOM() LIMIT 1` 
    : `SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`;

try {
    const question = await db.get(query);
    
    // If the database is "empty" because we've excluded EVERYTHING, 
    // we should return a message or a fresh random question.
    if (!question && exclude) {
        const resetQuestion = await db.get(`SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`);
        return { statusCode: 200, body: JSON.stringify(resetQuestion) };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(question),
    };
} catch (error) {
    return { statusCode: 500, body: error.toString() };
}

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
