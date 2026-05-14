const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

exports.handler = async (event) => {
    // Attempt to find the DB in the root (one level up from functions)
    const dbPath = path.resolve(__dirname, '..', '..', 'quizetta.db');
    
    // LOGGING FOR DEBUGGING
    console.log("Function Dir:", __dirname);
    console.log("Looking for DB at:", dbPath);
    console.log("Does file exist?", fs.existsSync(dbPath));

    if (!fs.existsSync(dbPath)) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Database file not found", 
                lookedAt: dbPath,
                filesInDir: fs.readdirSync(path.resolve(__dirname, '..')) 
            })
        };
    }

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    const excludeIds = event.queryStringParameters.exclude;

    return new Promise((resolve) => {
        let query = "SELECT * FROM questions";
        
        if (excludeIds && /^[0-9,]+$/.test(excludeIds)) {
            query += ` WHERE id NOT IN (${excludeIds})`;
        }

        query += " ORDER BY RANDOM() LIMIT 1";

        db.get(query, [], (err, row) => {
            db.close();
            if (err) {
                resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
            } else {
                resolve({
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row)
                });
            }
        });
    });
};
