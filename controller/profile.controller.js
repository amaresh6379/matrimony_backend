const router = require('express').Router({ mergeParams: true });
const profileService = require('../service/profile.service');
require('../global_function');


const createProfile = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createProfile(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}


const createCareerDetails = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createCareerDetails(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}

const createFamilyDetails = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createFamilyDetails(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}

const createZodiacDetails = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createZodiacDetails(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}


const createPersonalDetails = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createPersonalDetails(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}


const createProfileImage = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createProfileImage(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}


router.post('/', createProfile);
router.post('/:id/personal', createPersonalDetails);
router.post('/:id/career', createCareerDetails);
router.post('/:id/family', createFamilyDetails);
router.post('/:id/zodiac', createZodiacDetails);
router.post('/:id/profileImage', createProfileImage);


module.exports = {
  router,
  createProfile
};
