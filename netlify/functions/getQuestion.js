const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

exports.handler = async (event, context) => {
  // 1. Open the database file
  const db = await open({
    filename: './quizetta.db',
    driver: sqlite3.Database
  });

  // 2. Ask for ONE random question
  const question = await db.get('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1');

  await db.close();

  // 3. Send it back to your website
  return {
    statusCode: 200,
    body: JSON.stringify(question),
  };
};

