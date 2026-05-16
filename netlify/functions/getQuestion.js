const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

exports.handler = async (event) => {
    let db;
    try {
        const dbPath = path.resolve(__dirname, '../../quizetta.db');
        
        // Grab query parameters from the URL if they exist
        const excludeIds = event.queryStringParameters.exclude || "";
        const specificId = event.queryStringParameters.id || "";

        db = await open({ filename: dbPath, driver: sqlite3.Database });

        let query = 'SELECT rowid, * FROM questions';

        // CASE 1: If a specific ID is requested for previewing
        if (specificId && /^[0-9]+$/.test(specificId)) {
            query += ` WHERE rowid = ${specificId}`;
        } 
        // CASE 2: Standard random gameplay with exclusion filtering
        else {
            if (excludeIds && /^[0-9,]+$/.test(excludeIds)) {
                query += ` WHERE rowid NOT IN (${excludeIds})`;
            }
            query += ' ORDER BY RANDOM() LIMIT 1';
        }

        let question = await db.get(query);

        // Fallback: If specific ID wasn't found or exclude filter emptied the pool
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
