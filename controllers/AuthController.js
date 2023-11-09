const asyncHandler = require('../helpers/asyncHandler');
const AuthSrevice = require('../services/AuthService');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
const sendEmail = require('../helpers/sendEmail');
const HttpError = require('../helpers/HttpError');

const { BASE_URL } = process.env;

class AuthController {
  avatarsDir = path.join(__dirname, '..', 'public', 'avatars');

  register = asyncHandler(async (req, res) => {
    const { name, email, avatarURL, subscription, verificationCode } =
      await AuthSrevice.register({
        ...req.body,
        avatarURL: gravatar.url(req.body.email),
      });

    await this.sendVerifyEmail({ email, verificationCode });

    res.status(201).json({
      code: 201,
      message:
        'User registered successfully. Please, confirm the provided email box.',
      data: { name, email, avatarURL, subscription },
    });
  });

  sendVerifyEmail = async ({ email, verificationCode }) => {
    const verifyEmail = {
      to: email,
      subject: 'Email verification',
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationCode}">Click to verify email</a>`,
    };

    return await sendEmail(verifyEmail);
  };

  resendVerifyEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await AuthSrevice.findOne({ email });
    if (!user) {
      throw HttpError(401, 'Email or password is invalid', 'LoginError');
    }
    if (user.verified) {
      throw HttpError(401, 'Email already verified', 'VerificationError');
    }
    await this.sendVerifyEmail(user);

    res.status(200).json({
      code: 200,
      message: 'Verification email send successfully',
    });
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const { verificationCode } = req.params;
    const user = await AuthSrevice.findOne({ verificationCode });
    if (!user) {
      throw HttpError(404, 'User not found');
    }

    await AuthSrevice.update(user._id, {
      verified: true,
      verificationCode: '',
    });

    res.status(200).json({
      code: 200,
      message: 'Email verified successfully',
    });
  });

  login = asyncHandler(async (req, res) => {
    const { token, verified } = await AuthSrevice.login(req.body);

    if (!verified) {
      throw HttpError(401, 'Please verify your email', 'LoginError');
    }

    res.status(200).json({
      code: 200,
      message: 'User logged in successfully',
      token,
    });
  });

  logout = asyncHandler(async (req, res) => {
    await AuthSrevice.logout(req.user);
    res.status(200).json({
      code: 200,
      message: 'User logged out successfully',
    });
  });

  current = asyncHandler((req, res) => {
    const { name, email, avatarURL, subscription } = req.user;
    res.status(200).json({
      code: 200,
      message: 'ok',
      data: { name, email, avatarURL, subscription },
    });
  });

  update = asyncHandler(async (req, res) => {
    const { name, email, subscription } = await AuthSrevice.update(
      req.user._id,
      req.body
    );
    res.status(200).json({
      code: 200,
      message: 'User updated successfully',
      data: { name, email, subscription },
    });
  });

  updateAvatar = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { path: tempDir, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const avatarPath = path.join(this.avatarsDir, filename);
    await fs.rename(tempDir, avatarPath);
    const avatarURL = path.join('avatars', filename);
    await AuthSrevice.update(_id, { avatarURL });

    res.status(200).json({
      code: 200,
      message: 'User avatar updated successfully',
      data: { avatarURL },
    });
  });
}

module.exports = new AuthController();
