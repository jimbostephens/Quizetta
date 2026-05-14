const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

exports.handler = async (event) => {
    let db;
    try {
        const dbPath = path.resolve(__dirname, '../../quizetta.db');
        const excludeIds = event.queryStringParameters.exclude || "";

        db = await open({ filename: dbPath, driver: sqlite3.Database });

        let query = 'SELECT * FROM questions';
        
        // Only add the filter if we actually have IDs to exclude
        if (excludeIds && /^[0-9,]+$/.test(excludeIds)) {
            query += ` WHERE id NOT IN (${excludeIds})`;
        }
        
        query += ' ORDER BY RANDOM() LIMIT 1';

        let question = await db.get(query);

        // Fallback: If for some reason we run out of questions, just grab any random one
        if (!question) {
            question = await db.get('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1');
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
