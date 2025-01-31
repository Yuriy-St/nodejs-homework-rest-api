const HttpError = require('../helpers/HttpError');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

class AuthService {
  async authenticate(token) {
    const { SECRET_KEY } = process.env;
    const { id } = jwt.verify(token, SECRET_KEY);
    const candidate = await User.findById(id);
    return candidate;
  }

  async register(body) {
    const { email, password } = body;
    const competitor = await User.findOne({ email });
    if (competitor) {
      throw HttpError(409, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = nanoid();

    const newUser = await User.create({
      ...body,
      password: hashedPassword,
      verificationCode,
    });
    return newUser;
  }

  async login({ email, password }) {
    const { SECRET_KEY } = process.env;
    const candidate = await User.findOne({ email });

    if (!candidate) {
      throw HttpError(401, 'Email or password is invalid', 'LoginError');
    }

    const isMatch = await bcrypt.compare(password, candidate.password);

    if (!isMatch) {
      throw HttpError(401, 'Email or password is invalid', 'LoginError');
    }

    const payload = {
      id: candidate._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '24h',
    });
    const { verified } = await User.findByIdAndUpdate(candidate._id, { token });

    return { token, verified };
  }

  async logout({ _id }) {
    const response = await User.findByIdAndUpdate(_id, { token: null });
    return response;
  }

  async update(id, body = {}) {
    const candidate = await User.findByIdAndUpdate(id, body, { new: true });
    return candidate;
  }

  async findOne(body = {}) {
    const candidate = await User.findOne({ ...body });
    return candidate;
  }
}

module.exports = new AuthService();
