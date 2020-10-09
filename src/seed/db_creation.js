// Import native 'node.js' modules
import path from "path";
import fs from "fs";

// Import dependencies
import mysql from "mysql";

// Import constants from own file 'app-config.js'
import {
  DB_PORT,
  DB_HOST,
  DB_USER,
  DB_PASSWORD
} from "./../config/app-config.js";

// Alternative to '__dirname' when using ES6 modules (import)
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create connection
const db = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD
});

// Connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  // On connection, then do...
  console.log("MySql connected...");
  let filePath = path.resolve(__dirname, "demo_db.sql");

  // Read file
  fs.readFile(filePath, 'utf8', (err, data) => {
    // On file read, then do...
    if (err) throw err

    // Store all queries as promises
    let promises = [];
    let sqlQueries = data.split(";");
    console.log("Executing queries...");
    sqlQueries.forEach(sqlQuery => {
      sqlQuery = sqlQuery.trim();
      sqlQuery = sqlQuery.replace(/(\r\n|\n|\r)/gm, "");
      if (sqlQuery.startsWith("--") || sqlQuery == "") {
        return;
      } else {
        let promise = new Promise((resolve, reject) => {
          db.query(sqlQuery, (err, res) => {
            if (err) throw err;
            resolve(res);
          })
        });
        promises.push(promise);
      }
    })

    // Resolve all promises
    Promise.all(promises)
      .then((results) => {
        results.forEach(result => {
          console.log(result);
        })
        console.log("Database created successfully!");
        
        // Close connection
        db.end((err) => {
          if (err) console.log(err);
          console.log("Connection ended...");
        });
      });
  })
});