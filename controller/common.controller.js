const router = require('express').Router({ mergeParams: true });
const { to } = require('../global_function');
const commonService = require('../service/common.service');
require('../global_function');


const getDistrict = async (req, res) => {
  const [err, data] = await to(commonService.getDistrict());
  if (err) {
    return ReE(res, Object.assign({ success: false }, { details: err.message }), 422);
  }
  return ReS(res, { result: data }, 200);
}

const getStar = async (req, res) => {
  const [err, data] = await to(commonService.getStar());
  if (err) {
    return ReE(res, Object.assign({ success: false }, { details: err.message }), 422);
  }
  return ReS(res, { result: data }, 200);
}


const getZodiac = async (req, res) => {
  const [err, data] = await to(commonService.getZodiac());
  if (err) {
    return ReE(res, Object.assign({ success: false }, { details: err.message }), 422);
  }
  return ReS(res, { result: data }, 200);
}


const getWeight = async (req, res) => {
  const [err, data] = await to(commonService.getWeight());
  if (err) {
    return ReE(res, Object.assign({ success: false }, { details: err.message }), 422);
  }
  return ReS(res, { result: data }, 200);
}


const getHeight = async (req, res) => {
  const [err, data] = await to(commonService.getHeight());
  if (err) {
    return ReE(res, Object.assign({ success: false }, { details: err.message }), 422);
  }
  return ReS(res, { result: data }, 200);
}



router.get('/district', getDistrict);
router.get('/star', getStar);
router.get('/zodiac', getZodiac);
router.get('/weight', getWeight);
router.get('/height', getHeight);

module.exports = {
  router,
  getDistrict,
  getStar,
  getZodiac
};