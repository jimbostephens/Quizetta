const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

exports.handler = async (event) => {
    let db;
    try {
        // More robust pathing for Netlify
        const dbPath = path.resolve(__dirname, '../../quizetta.db');
        const exclude = event.queryStringParameters.exclude || "";

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        let question;

        // Secure check for exclude IDs
        if (exclude && /^[0-9,]+$/.test(exclude)) {
            question = await db.get(`SELECT * FROM questions WHERE id NOT IN (${exclude}) ORDER BY RANDOM() LIMIT 1`);
        }

        // Fallback
        if (!question) {
            question = await db.get(`SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`);
        }

        await db.close(); // Close before returning

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(question)
        };

    } catch (error) {
        if (db) await db.close();
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
