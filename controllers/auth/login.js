const { User, Session } = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require("../../helpers/env");
const { createError } = require("../../helpers/errors");

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw createError(403, "Wrong email or password");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw createError(403, "Wrong email or password");
  }

  const newSession = await Session.create({
    uid: user._id,
  });

  const accessToken = jwt.sign(
    { uid: user._id, sid: newSession._id },
    JWT_ACCESS_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { uid: user._id, sid: newSession._id },
    JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  return res.json({
    status: "Success",
    code: 200,
    data: {
      accessToken,
      refreshToken,
      sid: newSession._id,
      userData: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    },
  });
};

module.exports = login;
