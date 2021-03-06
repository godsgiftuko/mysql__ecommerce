// Import native 'node.js' modules
import path from "path";
import fs from "fs";

// Import db connection creation from own file 'app-config.js'
import {
  con_createDb
} from "./../config/app-config.js";

// Alternative to '__dirname' when using ES6 modules (import)
import { dirname }  from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Connect
const runDatabase = () => {
  con_createDb.connect((err) => {
    if (err) {
      console.log(err);
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
      sqlQueries.forEach(sqlQuery => {
        sqlQuery = sqlQuery.trim();
        sqlQuery = sqlQuery.replace(/(\r\n|\n|\r)/gm, "");
        if (sqlQuery.startsWith("--") || sqlQuery == "") {
          return;
        } else {
          let promise = new Promise((resolve, reject) => {
            con_createDb.query(sqlQuery, (err, res) => {
              if (err) reject(err);
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
          con_createDb.end((err) => {
            if (err) console.log(err);
            console.log("Connection ended...");
          });
        })
        .catch((err) =>{
          if (err.code == 'ER_TABLE_EXISTS_ERROR') {
            return
          } 
          throw err;
        })
    })
  });
}

export default runDatabase;