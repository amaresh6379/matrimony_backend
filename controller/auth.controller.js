const router = require('express').Router({ mergeParams: true });
const authService = require('../service/auth.service');
require('../global_function');

const verifyUserLogin = async (req, res) => {
  const [verifyErr, verifyData] = await to(authService.verifyUserLogin(req));
  if (verifyErr) {
    return ReE(res, Object.assign({ success: false }, { details: verifyErr.message }), 422);
  }
  return ReS(res, { result: verifyData }, 200);
}


const activeProfile = async (req, res) => {
  const [verifyErr, verifyData] = await to(authService.activeProfile(req));
  if (verifyErr) {
    return ReE(res, Object.assign({ success: false }, { details: verifyErr.message }), 422);
  }
  return ReS(res, { result: verifyData }, 200);
}


router.post('/login', verifyUserLogin);

module.exports = {
  router, verifyUserLogin, activeProfile
};
