const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

exports.handler = async (event) => {
    let db;
    try {
        const dbPath = path.resolve(__dirname, '../../quizetta.db');
        const exclude = event.queryStringParameters.exclude;

        // 1. Open Connection
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // 2. Build Query
        let query = (exclude && exclude.length > 0)
            ? `SELECT * FROM questions WHERE id NOT IN (${exclude}) ORDER BY RANDOM() LIMIT 1`
            : `SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`;

        // 3. Execute
        let question = await db.get(query);

        // 4. Fallback if all questions are excluded
        if (!question && exclude) {
            question = await db.get(`SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`);
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(question)
        };

    } catch (error) {
        console.error("Database Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch question", details: error.message })
        };
    } finally {
        if (db) await db.close();
    }
};
