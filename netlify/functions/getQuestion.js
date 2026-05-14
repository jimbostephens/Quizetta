const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.handler = async (event, context) => {
    // 1. Get the IDs and make sure they are just numbers/commas to prevent errors
    const excludeIds = event.queryStringParameters.exclude;
    
const dbPath = path.resolve(__dirname, '..', 'quizetta.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error("Database opening error: ", err);
});


    return new Promise((resolve, reject) => {
        // 2. Build the query safely
        let query = "SELECT * FROM questions";
        
        // Only add the filter if we actually have IDs to exclude
        if (excludeIds && /^[0-9,]+$/.test(excludeIds)) {
            query += ` WHERE id NOT IN (${excludeIds})`;
        }

        query += " ORDER BY RANDOM() LIMIT 1";

        db.get(query, [], (err, row) => {
            if (err) {
                console.error("Database error:", err);
                resolve({ 
                    statusCode: 500, 
                    body: JSON.stringify({ error: "Failed to fetch question" }) 
                });
            } else {
                resolve({
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row || { message: "No more questions!" }),
                });
            }
            db.close();
        });
    });
};
