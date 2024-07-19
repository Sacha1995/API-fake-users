function genToken() {
  return Math.round(Math.random() * 100000000000000) + "" + Date.now();
}

function checkToken(req, res, next) {
  const { token } = req.headers;

  if (!token) {
    res.status(400).send({ status: 0, reason: "No token" });
    return;
  }

  const user = req.users.find((user) => {
    if (user.tokens) {
      return user.tokens.includes(token);
    }
  });

  if (!user) {
    res.status(400).send({ status: 0, reason: "Invalid token" });
    return;
  }

  req.authedUser = user;
  next();
}

module.exports = { genToken, checkToken };
