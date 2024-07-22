const mysql = require("mysql");

const addUser = (email, password, name, role) => {
  return `INSERT INTO info(email, password, name, role)
  VALUES ("${email}","${password}", "${name}", "${role}");`; //double ; one for SQL and one for JS
};

const getId = (email, password) => {
  return `SELECT id FROM info 
            WHERE email LIKE "${email}" AND password LIKE "${password}";`;
};

const addToken = (user_id, token) => {
  return `INSERT INTO tokens (user_id, token) 
              VALUE (${user_id}, "${token}");`;
};

const getIdFromToken = (token) => {
  return `SELECT user_id FROM tokens WHERE token LIKE "${token}";`;
};

const setProfession = (id, profession, now) => {
  return `UPDATE info
          SET profession = "${profession}",
              updatedAt = "${now}"
          WHERE id = ${id};`;
};

const selectAll = () => {
  return `SELECT * FROM info;`;
};

const updateInfo = (fields, id) => {
  const keys = Object.keys(fields);
  const makeCommand = keys
    .map((key) => `${mysql.escapeId(key)} = ${mysql.escape(fields[key])}`)
    .join(", ");

  return `UPDATE info SET ${makeCommand} 
              WHERE id = ${id}`;
};
module.exports = {
  addUser,
  getId,
  addToken,
  getIdFromToken,
  setProfession,
  selectAll,
  updateInfo,
};
