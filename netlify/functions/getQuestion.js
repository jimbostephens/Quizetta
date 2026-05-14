const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

exports.handler = async (event) => {
    let db;
    try {
        // Use process.cwd() to ensure we find the file in the root directory on Netlify
        const dbPath = path.join(process.cwd(), 'quizetta.db');
        const exclude = event.queryStringParameters.exclude;

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        let query = "";
        let question = null;

        // Only use "NOT IN" if exclude has actual numbers (e.g., "1,2,3")
        // We also use regex to ensure the string only contains numbers and commas for security
        if (exclude && /^[0-9,]+$/.test(exclude)) {
            query = `SELECT * FROM questions WHERE id NOT IN (${exclude}) ORDER BY RANDOM() LIMIT 1`;
            question = await db.get(query);
        }

        // If no exclusion or if the exclusion query returned nothing (pool empty)
        if (!question) {
            query = `SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`;
            question = await db.get(query);
        }

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Helps with mobile browser permissions
            },
            body: JSON.stringify(question || { error: "No questions found" })
        };

    } catch (error) {
        console.error("Database Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch question", message: error.message })
        };
    } finally {
        if (db) await db.close();
    }
};
