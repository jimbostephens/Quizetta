const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

exports.handler = async (event) => {
    let db;
    try {
        const dbPath = path.resolve(__dirname, '../../quizetta.db');
        const excludeIds = event.queryStringParameters.exclude || "";

        db = await open({ filename: dbPath, driver: sqlite3.Database });

        // Select rowid explicitly since it's not a standard column
        let query = 'SELECT rowid, * FROM questions';
        let params = [];

        if (excludeIds && /^[0-9,]+$/.test(excludeIds)) {
            query += ` WHERE rowid NOT IN (${excludeIds})`;
        }

        query += ' ORDER BY RANDOM() LIMIT 1';

        let question = await db.get(query);

        // Fallback: if we've excluded too many or something goes wrong
        if (!question) {
            question = await db.get('SELECT rowid, * FROM questions ORDER BY RANDOM() LIMIT 1');
        }

        await db.close();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(question),
        };
    } catch (error) {
        if (db) await db.close();
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
