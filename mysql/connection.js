const mysql = require("mysql");

//connect to database on mysql
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "users",
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
});

//create a function to interact with mySQL
function asyncMySQL(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results);
    });
  });
}

module.exports = asyncMySQL;
