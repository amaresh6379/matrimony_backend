const Profile = require('../models').profile;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("../global_function");
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

async function generateToken(userDetails) {
  console.log("userDetails", userDetails);
  const payload = {
    id: userDetails.id,
    matrimonyId: userDetails.matrimonyId,
    gender: userDetails.gender,
    name: userDetails.name
  }
  const token = jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: '2d'
  });
  return token;

}

const verifyUserLogin = async (req) => {
  const { matrimonyId, password } = req.body;

  const [err, user] = await to(Profile.findOne({
    attributes: [
      'id',
      'name',
      'gender',
      'matrimonyId',
      'isActive',
      'mobileNumber',
      'password',
      'expiredAt',
      'failedAttempts',
      'lockedUntil'
    ],
    where: { matrimonyId, isDeleted: false }
  }));

  if (err || !user) {
    return { success: false, status: 'INVALID' };
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return { success: false, status: 'LOCKED' };
  }

  const isValid = await bcrypt.compare(password + CONFIG.SALT, user.password);

  if (!isValid) {
    const attempts = (user.failedAttempts || 0) + 1;

    const update = { failedAttempts: attempts };

    if (attempts >= MAX_FAILED) {
      update.lockedUntil = new Date(
        Date.now() + LOCK_MINUTES * 60 * 1000
      );
      update.failedAttempts = 0;
    }

    await Profile.update(update, { where: { id: user.id } });

    return { success: false, status: 'INVALID' };
  }

  if (!user.isActive) {
    return { success: false, status: 'INACTIVE' };
  }

  if (user.expiredAt && new Date(user.expiredAt) < new Date()) {
    return { success: false, status: 'EXPIRED' };
  }

  await Profile.update(
    { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    { where: { id: user.id } }
  );

  const token = await generateToken(user);

  return {
    success: true,
    userId: user.id,
    message: 'Login successful',
    token: token
  };
};

module.exports.verifyUserLogin = verifyUserLogin;


const activeUser = async (userId) => {
  const now = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(now.getFullYear() + 1);
  const [updateErr, updateData] = await to(
    Profile.update(
      { isActive: true, expiredAt: oneYearLater, startAt: new Date() },
      { where: { id: userId, isDeleted: false } }
    )
  );

  if (updateErr) {
    return TE(updateErr.message);
  }
  return updateData;

}
module.exports.activeUser = activeUser;


const deleteUser = async (userId) => {
  const [updateErr, updateData] = await to(
    Profile.update(
      { isDeleted: true },
      { where: { id: userId, isDeleted: false } }
    )
  );

  if (updateErr) {
    return TE(updateErr.message);
  }
  return updateData;

}
module.exports.deleteUser = deleteUser;