const { getIdFromToken } = require("./mysql/queries");
const asyncMySQL = require("./mysql/connection");

function genToken() {
  return Math.round(Math.random() * 100000000000000) + "" + Date.now();
}

async function checkToken(req, res, next) {
  const { token } = req.headers;

  if (!token) {
    res.status(400).send({ status: 0, reason: "No token" });
    return;
  }

  console.log(req.headers.token);

  try {
    const results = await asyncMySQL(getIdFromToken(req.headers.token));

    if (results.length === 0 || !results) {
      throw new Error("Token not found");
    }

    req.authedUserId = results[0].user_id;
    next();
  } catch (e) {
    res.status(400).send({ status: 0, error: e.message });
  }
}

module.exports = { genToken, checkToken };
