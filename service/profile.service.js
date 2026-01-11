const Profile = require('../models').profile;
const PersonalDetails = require('../models').personalDetails;
const CareerDetails = require('../models').careerDetails;
const ParentDetails = require('../models').parentDetails;
const ProfileImage = require('../models').profileImage;
const ZodiacDetails = require('../models').zodiacDetails;
const District = require('../models').district;
const telegramService = require('../service/telegram.service');
const Height = require('../models').height;
const Weight = require('../models').weight;
const Zodiac = require('../models').zodiac;
const Star = require('../models').star;
const { createCanvas, loadImage } = require("canvas");
const { Op, where } = require('sequelize');
const puppeteer = require("puppeteer");
const path = require("path");
const axios = require('axios');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');


const s3 = new S3Client({
  region: CONFIG.AWS_REGION,
  credentials: {
    accessKeyId: CONFIG.AWS_ACCESS_KEY,
    secretAccessKey: CONFIG.AWS_SECRET_KEY
  }
});


require('../global_function');


const bcrypt = require('bcrypt');
const { TE } = require('../global_function');
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
  console.log("Personal data", req.body);
  const [personalDetailsErr, personalDetailsData] = await to(PersonalDetails.create({ heightId, weightId, skinTone, foodOption, Interest: Interest, asset, profileId: req.params.id }));
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
  const [careerDetailsErr, careerDetailsData] = await to(CareerDetails.create({ educationDetails, profession, companyName, monthyIncome, workLocation, profileId: parseInt(req.params.id) }));
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
  console.log("jathagam body", req.body);
  const [zodiacDetailsErr, zodiacDetailsData] = await to(ZodiacDetails.create({ zodiacId, starId, patham, dosham, jathgamImage, profileId: parseInt(req.params.id) }));
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
  const { fatherName, motherName, fatherMobileNumber, motherMobileNumber, siblingMale, siblingFemale, marriedMale, marriedFemale, contactPersonName, contactPersonNumber, contactPersonType } = req.body;
  const [familyDetailsErr, familyDetailsData] = await to(ParentDetails.create({ fatherName, motherName, fatherMobileNumber, motherMobileNumber, siblingMale, siblingFemale, marriedMale, marriedFemale, contactPersonName, contactPersonNumber, contactPersonType, profileId: req.params.id }));
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


const getOneProfileDetails = async (req) => {
  const id = req?.user?.id;
  if (!id) return TE('Id is required');
  console.log('id', id);
  const [matchErr, matachData] = await to(Profile.findOne({
    attributes: ['id', 'matrimonyId', 'name', 'gender', 'mobileNumber', 'dob', 'martialStatus', 'religion', 'nativePlace', 'districtId'],
    where: {
      id: id,
      isDeleted: false,
      // isActive: true
    },
    include: [
      {
        model: District,
        attributes: ['districtName'],
        required: false
      },
      {
        model: CareerDetails,
        attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome', 'workLocation'],
        required: false
      },
      {
        model: ParentDetails,
        attributes: ['fatherName', 'motherName', 'fatherMobileNumber', 'motherMobileNumber', 'siblingMale', 'siblingFemale', 'marriedMale', 'marriedFemale', 'contactPersonName', 'contactPersonNumber', 'contactPersonType'],
        required: false
      },
      {
        model: ZodiacDetails,
        attributes: ['id', 'patham', 'dosham', 'jathgamImage'],
        include: [
          {
            model: Zodiac,
            attributes: ['zodiacTamil'],
            required: false
          },
          {
            model: Star,
            attributes: ['starTamil'],
            required: false
          }
        ],
        required: false
      },
      {
        model: PersonalDetails,
        attributes: ['skinTone', 'foodOption', 'Interest', 'asset'],
        required: false,
        include: [
          {
            model: Height,
            attributes: ['heightName'],
            required: false
          },
          {
            model: Weight,
            attributes: ['weightName'],
            required: false
          }
        ]
      },
      {
        model: ProfileImage,
        attributes: ['profileUrl', 'isMain'],
        required: false,
        where: {
          isDeleted: false
        }
      }
    ]
  }));
  if (matchErr) {
    return TE(matchErr.message);
  }
  return matachData;

}

module.exports.getOneProfileDetails = getOneProfileDetails;


const updateProfileDetails = async (req) => {
  if (req?.body) {
    const updateDetails = {
      matrimonyId: req.body.matrimonyId,
      name: req.body.name,
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
      dob: req.body.dob,
      martialStatus: req.body.martialStatus,
      religion: req.body.religion,
      nativePlace: req.body.nativePlace,
      districtId: req.body.districtId
    };
    const [updateErr, updateData] = await to(Profile.update(updateDetails, { where: { id: req.user.id, isDeleted: false, isActive: true } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }
}
module.exports.updateProfileDetails = updateProfileDetails;

const updateProfileImage = async (req) => {
  if (req?.body) {
    const updateProfileImage = {
      profileUrl: req.body.profileUrl,
      isMain: true
    };
    const [updateErr, updateData] = await to(ProfileImage.update(updateProfileImage, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;

  }
}
module.exports.updateProfileImage = updateProfileImage;


const updateCareerDetails = async (req) => {
  if (req?.body) {
    const updateCareerDetails = {
      educationDetails: req.body.educationDetails,
      profession: req.body.profession,
      companyName: req.body.companyName,
      monthyIncome: req.body.monthyIncome,
      workLocation: req.body.workLocation,
      updatedAt: new Date()
    };
    const [updateErr, updateData] = await to(CareerDetails.update(updateCareerDetails, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }

};

module.exports.updateCareerDetails = updateCareerDetails;


const updateFamilyDetails = async (req) => {
  if (req?.body) {
    const updateParentDetails = {
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      fatherMobileNumber: req.body.fatherMobileNumber,
      motherMobileNumber: req.body.motherMobileNumber,
      siblingMale: req.body.siblingMale,
      siblingFemale: req.body.siblingFemale,
      marriedMale: req.body.marriedMale,
      marriedFemale: req.body.marriedFemale,
      updatedAt: new Date()
    };
    const [updateErr, updateData] = await to(ParentDetails.update(updateParentDetails, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }

}
module.exports.updateFamilyDetails = updateFamilyDetails;


const updateZodiacDetails = async (req) => {
  if (req?.body) {
    const updateZodiacDetails = {
      patham: req.body.patham,
      dosham: req.body.dosham,
      jathgamImage: req.body.jathgamImage,
      zodiacId: req.body.zodiacId,
      starId: req.body.starId
    };
    const [updateErr, updateData] = await to(ZodiacDetails.update(updateZodiacDetails, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }

}

module.exports.updateZodiacDetails = updateZodiacDetails;


const updatePersonalDetails = async (req) => {
  if (req?.body) {
    const updatePersonalDetails = {
      skinTone: req.body.skinTone,
      foodOption: req.body.foodOption,
      Interest: req.body.interest,
      weightId: req.body.weightId,
      heightId: req.body.heightId
    };
    const [updateErr, updateData] = await to(PersonalDetails.update(updatePersonalDetails, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }
};
module.exports.updatePersonalDetails = updatePersonalDetails;


const getProfilePercentage = async (req) => {
  const id = req.user.id;
  const fields = {
    profile: ["name", "gender", "dob", "mobileNumber", "martialStatus", "religion", "nativePlace", "districtId"],
    personalDetails: ["skinTone", "foodOption", "Interest", "asset", "heightId", "weightId"],
    careerDetails: ["educationDetails", "profession", "companyName", "monthyIncome", "workLocation"],
    parentsDetails: ["fatherName", "motherName", "fatherMobileNumber", "motherMobileNumber", "siblingMale", "siblingFemale", "marriedMale", "marriedFemale"],
    zodiacDetails: ["patham", "dosham", "jathgamImage", "zodiacId", "starId"],
    profileImage: ["profileUrl", "isMain"]
  };

  let totalFields = 0;
  let filledFields = 0;

  // Fetch all related tables
  const [
    profile,
    personalDetails,
    careerDetails,
    parentsDetails,
    zodiacDetails,
    profileImage
  ] = await Promise.all([
    Profile.findOne({ attributes: ["name", "gender", "dob", "mobileNumber", "martialStatus", "religion", "nativePlace", "districtId"], where: { id: id, isActive: true, isDeleted: false } }),
    PersonalDetails.findOne({ attributes: ["skinTone", "foodOption", "Interest", "asset", "heightId", "weightId"], where: { profileId: id } }),
    CareerDetails.findOne({ attributes: ["educationDetails", "profession", "companyName", "monthyIncome", "workLocation"], where: { profileId: id } }),
    ParentDetails.findOne({ attributes: ["fatherName", "motherName", "fatherMobileNumber", "motherMobileNumber", "siblingMale", "siblingFemale", "marriedMale", "marriedFemale"], where: { profileId: id } }),
    ZodiacDetails.findOne({ attributes: ["patham", "dosham", "jathgamImage", "zodiacId", "starId"], where: { profileId: id } }),
    ProfileImage.findOne({ attributes: ["profileUrl", "isMain"], where: { profileId: id } }),
  ]);

  const dataMap = {
    profile,
    personalDetails,
    careerDetails,
    parentsDetails,
    zodiacDetails,
    profileImage
  };

  // Count filled fields
  for (const table in fields) {
    const tableFields = fields[table];
    totalFields += tableFields.length;

    const row = dataMap[table];

    for (const f of tableFields) {
      if (row && row[f] !== null && row[f] !== "" && row[f] !== undefined) {
        filledFields++;
      }
    }
  }

  // Calculate percentage
  const percentage = Math.round((filledFields / totalFields) * 100);

  return percentage;
};


module.exports.getProfilePercentage = getProfilePercentage;

// async function generateProfileImage(htmlPath, data, outputPath) {
//   const browser = await puppeteer.launch({
//     headless: "new"
//   });

//   const page = await browser.newPage();

//   // Read HTML template
//   let html = fs.readFileSync(htmlPath, "utf8");

//   // Inject data into template
//   Object.keys(data).forEach((key) => {
//     html = html.replaceAll(`{{${key}}}`, data[key] || "");
//   });

//   // Load HTML
//   await page.setContent(html, { waitUntil: "networkidle0" });

//   // A4 size (high quality)
//   await page.setViewport({
//     width: 794,
//     height: 930,
//     deviceScaleFactor: 2
//   });

//   // Generate image
//   await page.screenshot({
//     path: outputPath,
//     fullPage: true
//   });

//   await browser.close();

//   return outputPath;
// }
async function generateProfileImage(htmlPath, data) {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });

    const page = await browser.newPage();

    let html = fs.readFileSync(htmlPath, 'utf8');

    Object.keys(data).forEach((key) => {
      html = html.replaceAll(`{{${key}}}`, data[key] || '');
    });


    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.setViewport({
      width: 794,
      height: 930,
      deviceScaleFactor: 2,
    });

    // ⬇️ Return image as BUFFER
    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
    });

    await browser.close();
    return imageBuffer;

  }
  catch (err) {
    console.error('Error generating profile image:', err);

  }


}
async function uploadImageBufferToS3(buffer, key) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    })
  );

  return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  return age;
}


const downloadProfile = async (req) => {

  const [getProfileCardErr, getProfileCardData] = await to(Profile.findOne({
    attributes: ['profileCardUrl'],
    where: { id: req.params.id }
  }));
  if (getProfileCardErr) {
    return TE(getProfileCardErr.message);
  }
  if (getProfileCardData.profileCardUrl) {
    return { s3Url: getProfileCardData.profileCardUrl, matrimonyId: getProfileCardData.matrimonyId };
  }
  else if (!getProfileCardData.profileCardUrl) {
    const input = {
      user: {
        id: req.params.id
      }
    };
    let [userErr, userData] = await to(getOneProfileDetails(input));
    if (userErr) {
      return TE(userErr.message);
    }
    // console.log("userData", userData);
    let particularUserDetail = {};
    const educationDetails = userData?.careerDetails[0]?.dataValues?.educationDetails?.join(", ");
    const contactDetails =
      userData?.parentDetails?.[0]?.dataValues?.contactPersonName +
      ' (' +
      userData?.parentDetails?.[0]?.dataValues?.contactPersonType +
      ')\n' +
      userData?.parentDetails?.[0]?.dataValues?.contactPersonNumber;


    console.log("userData?.dob", userData?.dob);
    const readableDate = userData?.dob?.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    console.log("personal details", userData?.personalDetails?.[0]?.dataValues);
    particularUserDetail = {
      name: userData.name,
      matrimonyId: userData.matrimonyId,
      gender: userData.gender,
      dob: readableDate,
      age: calculateAge(userData.dob),
      maritalStatus: userData.martialStatus ?? '-',
      religion: userData.religion ?? '-',
      nativePlace: userData.nativePlace ?? '-',
      district: userData?.district?.dataValues?.districtName ?? '-',
      education: educationDetails ?? '-',
      profession: userData?.careerDetails?.[0]?.dataValues?.profession ?? '-',
      company: userData?.careerDetails?.[0]?.dataValues?.companyName ?? '-',
      salary: userData?.careerDetails?.[0]?.dataValues?.monthyIncome ?? '-',
      workLocation: userData?.careerDetails?.[0]?.dataValues?.workLocation ?? '-',
      height: userData?.personalDetails?.[0]?.dataValues?.height?.dataValues?.heightName ?? '-',
      weight: userData?.personalDetails?.[0]?.dataValues?.weight?.dataValues?.weightName ?? '-',
      contact: contactDetails ?? '-',
      fatherName: userData?.parentDetails?.[0]?.dataValues?.fatherName ?? '-',
      motherName: userData?.parentDetails?.[0]?.dataValues?.motherName ?? '-',
      raasi: userData?.zodiacDetails?.[0]?.zodiac?.dataValues?.zodiacTamil ?? '-',
      nachathiram: userData?.zodiacDetails?.[0]?.star?.dataValues?.starTamil ?? '-',
      paatham: userData?.zodiacDetails?.[0]?.dataValues?.patham ? userData?.zodiacDetails?.[0]?.dataValues?.patham + ' ஆம் பாதம்' : '-',
      dosham: userData?.zodiacDetails?.[0]?.dataValues?.dosham ?? '-',
      foodOption: userData?.personalDetails?.[0]?.dataValues?.foodOption ?? '-',
      color: userData?.personalDetails?.[0]?.dataValues?.skinTone ?? '-',
      assets: userData?.personalDetails?.[0]?.dataValues?.asset ?? '-',
      expectation: userData?.personalDetails?.[0]?.dataValues?.Interest ?? '-',
      photoUrl: `https://vc-matrimony.s3.us-east-1.amazonaws.com/profile/profileimage/${userData.matrimonyId}.jpg`,
      jathagamImageUrl: `https://vc-matrimony.s3.us-east-1.amazonaws.com/profile/jathagamimage/${userData.matrimonyId}.jpg`
    };
    console.log("particularUserDetail", particularUserDetail);
    const bufferData = await generateProfileImage(path.join(__dirname, 'profileCard.html'), particularUserDetail, path.join(__dirname, `profile_${userData.matrimonyId}.png`));
    const s3Url = await uploadImageBufferToS3(
      bufferData,
      `profile/profilecard/${userData.matrimonyId}.png`
    );
    if (s3Url) {
      const [updateUserErr, updateUserData] = await to(Profile.update({ profileCardUrl: s3Url }, { where: { id: userData.id } }));
      if (updateUserErr) {
        return TE(updateUserErr.message);
      }
    }
    return { s3Url, matrimonyId: userData.matrimonyId };
  }
}

module.exports.downloadProfile = downloadProfile;


function parseDOB_DDMMYYYY(dateStr) {
  const [day, month, year] = dateStr.split('-').map(Number);
  console.log('day, month, year', day, month, year);
  return new Date(Date.UTC(year, month - 1, day));
}



const BulkCreateProfile = async function (req) {
  const profileData = req.body;
  let rawData = {};
  if (profileData.rawRequest) {
    try {
      rawData = JSON.parse(profileData.rawRequest);
    } catch (err) {
      console.error('[BulkCreateProfile] Invalid rawRequest JSON', err.message);
      return;
    }
  }

  const answers = {};
  for (const key in rawData) {
    if (key.startsWith('q')) {
      answers[key] = normalizeValue(rawData[key]);
    }
  }
  console.log('[BulkCreateProfile] Answers:', answers);

  /* -------------------- MASTER FETCHES -------------------- */

  let districtErr, districtData;
  if (answers.q65_district) {
    console.log('[BulkCreateProfile] Fetching District:', answers.q65_district);
    [districtErr, districtData] = await to(
      District.findOne({ where: { districtName: answers.q65_district } })
    );
    if (districtErr) {
      console.error('[BulkCreateProfile] District fetch error', districtErr.message);
      return TE(districtErr.message);
    }
    console.log('[BulkCreateProfile] District found:', districtData?.id);
  }

  let starErr, starData;
  if (answers.q48_starnbsp) {
    console.log('[BulkCreateProfile] Fetching Star:', answers.q48_starnbsp);
    [starErr, starData] = await to(
      Star.findOne({ where: { starTamil: answers.q48_starnbsp } })
    );
    if (starErr) {
      console.error('[BulkCreateProfile] Star fetch error', starErr.message);
      return TE(starErr.message);
    }
    console.log('[BulkCreateProfile] Star found:', starData?.id);
  }

  let zodiacErr, zodiacData;
  if (answers.q47_zodiacnbsp) {
    console.log('[BulkCreateProfile] Fetching Zodiac:', answers.q47_zodiacnbsp);
    [zodiacErr, zodiacData] = await to(
      Zodiac.findOne({ where: { zodiacTamil: answers.q47_zodiacnbsp } })
    );
    if (zodiacErr) {
      console.error('[BulkCreateProfile] Zodiac fetch error', zodiacErr.message);
      return TE(zodiacErr.message);
    }
    console.log('[BulkCreateProfile] Zodiac found:', zodiacData?.id);
  }

  let weightErr, weightData;
  if (answers.q74_weight) {
    console.log('[BulkCreateProfile] Fetching Weight:', answers.q74_weight);
    [weightErr, weightData] = await to(
      Weight.findOne({ where: { weightName: answers.q74_weight } })
    );
    if (weightErr) {
      console.error('[BulkCreateProfile] Weight fetch error', weightErr.message);
      return TE(weightErr.message);
    }
  }

  let heightErr, heightData;
  if (answers.q73_height) {
    console.log('[BulkCreateProfile] Fetching Height:', answers.q73_height);
    [heightErr, heightData] = await to(
      Height.findOne({ where: { heightName: answers.q73_height } })
    );
    if (heightErr) {
      console.error('[BulkCreateProfile] Height fetch error', heightErr.message);
      return TE(heightErr.message);
    }
  }

  /* -------------------- PROFILE CREATE -------------------- */

  const profileDetails = {
    body: {
      gender: answers.q36_gender?.toUpperCase(),
      name: answers.q64_name,
      dob: parseDOB_DDMMYYYY(answers.q25_date),
      mobileNumber: answers.q72_mobileNumber72?.replace(/\D/g, ''),
      password: 'Admin@123',
      martialStatus: answers.q34_martialStatus?.toUpperCase(),
      religion: answers.q78_religion?.toUpperCase(),
      nativePlace: answers.q28_typeA,
      districtId: districtData?.id ?? null
    }
  };

  const [profileErr, profileSucc] = await to(createProfile(profileDetails));
  if (profileErr) {
    console.error('[BulkCreateProfile] Profile creation failed', profileErr.message);
    return TE(profileErr.message);
  }

  if (!profileSucc?.id) {
    console.warn('[BulkCreateProfile] Profile ID missing, aborting');
    return;
  }



  const careerDetails = {
    body: {
      educationDetails: [answers.q38_education],
      profession: answers.q39_profession,
      companyName: answers.q40_company,
      monthyIncome: answers.q41_monthlyIncome,
      workLocation: answers.q42_workLocation
    },
    params: { id: JSON.stringify(profileSucc.id) }
  };

  const [careerErr] = await to(createCareerDetails(careerDetails));
  if (careerErr) {
    console.error('[BulkCreateProfile] Career creation failed', careerErr.message);
    return TE(careerErr.message);
  }


  const familyDetails = {
    body: {
      fatherName: answers.q45_fathersName,
      motherName: answers.q31_mothersName,
      contactPersonName: answers.q53_typeA53,
      contactPersonNumber: answers.q55_mobileNumber?.replace(/\D/g, ''),
      contactPersonType: answers.q54_typeA54
    },
    params: { id: JSON.stringify(profileSucc.id) }
  };

  const [familyErr] = await to(createFamilyDetails(familyDetails));
  if (familyErr) {
    console.error('[BulkCreateProfile] Family creation failed', familyErr.message);
    return TE(familyErr.message);
  }



  let jathamImage, photo;

  if (rawData?.jathamImage?.[0]) {
    jathamImage = await uploadImageFromUrl(
      rawData.jathamImage[0],
      'profile/jathagamimage',
      profileSucc.matrimonyId
    );
  }

  if (rawData?.photo?.[0]) {
    console.log('[BulkCreateProfile] Uploading Profile Image');
    photo = await uploadImageFromUrl(
      rawData.photo[0],
      'profile/profileimage',
      profileSucc.matrimonyId
    );
  }



  const [zodiacDetailsErr, zodiacDetailsData] = await to(createZodiacDetails({
    body: {
      zodiacId: zodiacData?.id ?? null,
      starId: starData?.id ?? null,
      patham: answers.q49_input49?.match(/\d+/)?.[0],
      dosham: answers.q50_dosham,
      jathgamImage: jathamImage?.url ?? null
    },
    params: { id: JSON.stringify(profileSucc.id) }
  }));

  if (zodiacDetailsErr) {
    console.error('[BulkCreateProfile] Zodiac creation failed', zodiacDetailsErr.message);
    return TE(zodiacDetailsErr.message);
  }

  console.log('[BulkCreateProfile] Zodiac created');

  const [createProfileImageErr] = await to(createProfileImage({
    body: { profileUrl: photo?.url ?? null },
    params: { id: JSON.stringify(profileSucc.id) }
  }));

  if (createProfileImageErr) {
    console.error('[BulkCreateProfile] Profile Image creation failed', createProfileImageErr.message);
    return TE(createProfileImageErr.message);
  }

  console.log('[BulkCreateProfile] Profile Image created');
  const [createPersonalDetailsErr] = await to(createPersonalDetails({
    body: {
      heightId: heightData?.id ?? null,
      weightId: weightData?.id ?? null,
      skinTone: answers.q60_color,
      foodOption:
        answers.q61_foodOption === 'அசைவம்' ? 'NONVEG' :
          answers.q61_foodOption === 'சைவம்' ? 'VEG' : 'SOMETIMES_NONVEG',
      Interest: answers.q57_input57,
      asset: answers.q56_input56
    },
    params: { id: JSON.stringify(profileSucc.id) }
  }));

  if (createPersonalDetailsErr) {
    console.error('[BulkCreateProfile] Personal Details creation failed', createPersonalDetailsErr.message);
    return TE(createPersonalDetailsErr.message);
  }

  console.log('[BulkCreateProfile] COMPLETED SUCCESSFULLY:', profileSucc.id);
};



function normalizeValue(value) {
  if (value === null || value === undefined) return null;

  // Phone fields
  if (typeof value === 'object' && value.full) {
    return value.full;
  }

  // Date fields
  if (typeof value === 'object' && value.day && value.month && value.year) {
    return `${value.day}-${value.month}-${value.year}`;
  }

  // Other objects
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}



/**
 * Uploads an image from a public URL to S3.
 *
 * @param {string} source - Public URL of the image.
 * @param {string} folder - Folder to upload the image to (e.g. 'profile' or 'jotform').
 * @param {string} profileId - ID of the profile to associate the image with.
 *
 * @returns {Promise<{ key: string, url: string }>} - Promise that resolves to an object containing the S3 key and URL of the uploaded image.
 *
 * @throws {Error} - If the content-type of the image is invalid or if the upload to S3 fails.
 */



async function uploadImageFromUrl(source, folder, profileId) {
  if (!source) {
    console.warn('Source is empty');
    return null;
  }

  let response;
  let extension;

  try {
    response = await axios.get(source, {
      responseType: 'arraybuffer', // <-- consume full response as buffer
      timeout: 20000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'image/*',
      },
    });

    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const matches = disposition.match(/filename="?(.+?)"?$/);
      if (matches && matches[1]) {
        const filename = matches[1];
        extension = filename.split('.').pop();
      }
    }

    if (!extension) {
      const contentType = response.headers['content-type'];
      if (contentType && contentType.startsWith('image/')) {
        extension = contentType.split('/')[1];
      } else {
        throw new Error('Cannot determine file extension');
      }
    }
    const key = `${folder}/${profileId}.${extension}`;

    const uploadParams = {
      Bucket: CONFIG.AWS_BUCKET,
      Key: key,
      Body: Buffer.from(response.data), // <-- full buffer
      ContentType: response.headers['content-type'] || 'application/octet-stream',
    };

    try {
      const s3Result = await s3.send(new PutObjectCommand(uploadParams));
      console.log('✅ S3 Upload Success:', s3Result);
    } catch (s3Err) {
      console.error('🔥 S3 upload failed');
      console.error('Message:', s3Err.message);
      console.error('Code:', s3Err.code);
      console.error('HTTP Status:', s3Err.$metadata?.httpStatusCode);
      console.error('Request ID:', s3Err.$metadata?.requestId);
      throw s3Err;
    }

    const finalUrl = `https://${CONFIG.AWS_BUCKET}.s3.${CONFIG.AWS_REGION}.amazonaws.com/${key}`;
    console.log('✅ Upload successful:', finalUrl);

    return { key, url: finalUrl };
  } catch (err) {
    console.error('🔥 uploadImageFromUrl FAILED');
    console.error('Message:', err.message);
    if (err.response) {
      console.error('HTTP Status:', err.response.status);
      console.error('Response headers:', err.response.headers);
    }
    console.log('================ FAILED uploadImageFromUrl ================');
    throw err;
  }
}






module.exports.BulkCreateProfile = BulkCreateProfile;