const Profile = require('../models').profile;
const PersonalDetails = require('../models').personalDetails;
const CareerDetails = require('../models').careerDetails;
const ParentDetails = require('../models').parentDetails;
const ProfileImage = require('../models').profileImage;
const ZodiacDetails = require('../models').zodiacDetails;
const District = require('../models').district;
const telegramService = require('../service/telegram.service');



require('../global_function');


const bcrypt = require('bcrypt');
const SALT = CONFIG.SALT;

async function hashPasswordBcrypt(plainPassword) {
  const saltRounds = 12;
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash; // store in DB
}

/**
 * 
 * @param {*} req 
 * @returns 
 */
const createProfile = async (req) => {
  const { gender, name, dob, mobileNumber, password, martialStatus, religion, nativePlace, districtId } = req.body;
  const hashPassword = await hashPasswordBcrypt(password + SALT);
  const [profileErr, profileData] = await to(Profile.create({ name, gender, dob: new Date(dob), mobileNumber, password: hashPassword, martialStatus, religion, nativePlace, districtId }));
  if (profileErr) {
    console.log("profileErr", profileErr);
    return TE(profileErr.message);
  }
  if (profileData) {
    profileData['age'] = new Date().getFullYear() - new Date(profileData.dob).getFullYear();
    const districtDetails = await District.findOne({ where: { id: profileData.districtId } });
    profileData['districtName'] = districtDetails.districtName;
    const [telegramErr, telegramData] = await to(telegramService.sendNewUserMessage(profileData));
    if (telegramErr) {
      return TE(telegramErr.message);
    }

    return {
      createProfile: true,
      message: 'Profile created successfully',
      matrimonyId: profileData.matrimonyId,
      id: profileData.id
    };
  }
}

module.exports.createProfile = createProfile;


const createPersonalDetails = async (req) => {
  const { heightId, weightId, skinTone, foodOption, Interest, asset } = req.body;
  const [personalDetailsErr, personalDetailsData] = await to(PersonalDetails.create({ heightId, weightId, skinTone, foodOption, Interest, asset, profileId: req.params.id }));
  if (personalDetailsErr) {
    return TE(personalDetailsErr.message);
  }
  if (personalDetailsData) {
    return {
      createPersonalDetails: true,
      message: 'Personal Details created successfully'
    };
  }
}

module.exports.createPersonalDetails = createPersonalDetails;


const createCareerDetails = async (req) => {
  const { educationDetails, profession, companyName, monthyIncome, workLocation } = req.body;
  const [careerDetailsErr, careerDetailsData] = await to(CareerDetails.create({ educationDetails, profession, companyName, monthyIncome, workLocation, profileId: req.params.id }));
  if (careerDetailsErr) {
    return TE(careerDetailsErr.message);
  }
  if (careerDetailsData) {
    return {
      createCareerDetails: true,
      message: 'Career Details created successfully'
    };
  }

}
module.exports.createCareerDetails = createCareerDetails;



const createZodiacDetails = async (req) => {
  const { zodiacId, starId, patham, dosham, jathgamImage } = req.body;
  const [zodiacDetailsErr, zodiacDetailsData] = await to(ZodiacDetails.create({ zodiacId, starId, patham, dosham, jathgamImage, profileId: req.params.id }));
  if (zodiacDetailsErr) {
    return TE(zodiacDetailsErr.message);
  }
  if (zodiacDetailsData) {
    return {
      createZodiacDetails: true,
      message: 'Zodiac Details created successfully'
    };
  }
}
module.exports.createZodiacDetails = createZodiacDetails;


const createFamilyDetails = async (req) => {
  const { fatherName, motherName, fatherMobileNumber, motherMobileNumber, siblingMale, siblingFemale, marriedMale, marriedFemale } = req.body;
  const [familyDetailsErr, familyDetailsData] = await to(ParentDetails.create({ fatherName, motherName, fatherMobileNumber, motherMobileNumber, siblingMale, siblingFemale, marriedMale, marriedFemale, profileId: req.params.id }));
  if (familyDetailsErr) {
    return TE(familyDetailsErr.message);
  }
  if (familyDetailsData) {
    return {
      createFamilyDetails: true,
      message: 'Family Details created successfully'
    };
  }
}
module.exports.createFamilyDetails = createFamilyDetails;


const createProfileImage = async (req) => {
  const { profileUrl } = req.body;
  const [profileImageErr, profileImageData] = await to(ProfileImage.create({ profileUrl, profileId: req.params.id, isMain: true }));
  if (profileImageErr) {
    return TE(profileImageErr.message);
  }
  if (profileImageData) {
    return {
      createProfileImage: true,
      message: 'Profile Image created successfully'
    };
  }
}
module.exports.createProfileImage = createProfileImage;