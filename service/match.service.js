const Profile = require('../models').profile;
const CareerDetails = require('../models').careerDetails;
const ZodiacDetails = require('../models').zodiacDetails;
const Zodiac = require('../models').zodiac;
const Star = require('../models').star;
const ProfileInterset = require('../models').profileInterset;
const ProfileImage = require('../models').profileImage;
require('../global_function');
const { Op, where } = require("sequelize");
const { off } = require('..');

const getMatchingList = async (req) => {
  const gender = req.user.gender;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const filterData = req.query.filterData
    ? JSON.parse(req.query.filterData)
    : null;
  let zodiacWhereCondition = {};
  let profileWhereCondition = {
    gender: { [Op.ne]: gender },
    isDeleted: false,
    isActive: true
  };

  // Filters
  if (filterData) {
    if (filterData.searchQuery) {
      profileWhereCondition[Op.or] = [
        { name: { [Op.like]: `%${filterData.searchQuery}%` } },
        { matrimonyId: { [Op.like]: `%${filterData.searchQuery}%` } }
      ];
    }

    if (filterData.location) {
      profileWhereCondition[Op.and] = [
        {
          [Op.or]: [
            { nativePlace: { [Op.like]: `%${filterData.location}%` } },
            { '$careerDetails.workLocation$': { [Op.like]: `%${filterData.location}%` } }
          ]
        }
      ];
    }

    if (filterData.zodiacId) {
      zodiacWhereCondition.zodiacId = filterData.zodiacId;
    }

    if (filterData.starId) {
      zodiacWhereCondition.starId = filterData.starId;
    }

    if (filterData.star) {
      zodiacWhereCondition['$star.starTamil$'] = filterData.star;
    }

    if (filterData.dosham) {
      zodiacWhereCondition.dosham = filterData.dosham;
    }

    const fromAge = filterData.fromAge || filterData.ageFrom;
    const toAge = filterData.toAge || filterData.ageTo;
    if (fromAge || toAge) {
      const today = new Date();
      const minAge = toAge ? parseInt(toAge) : 100;
      const maxAge = fromAge ? parseInt(fromAge) : 0;

      const minDOB = new Date(
        today.getFullYear() - minAge - 1,
        today.getMonth(),
        today.getDate()
      );

      const maxDOB = new Date(
        today.getFullYear() - maxAge,
        today.getMonth(),
        today.getDate()
      );

      profileWhereCondition.dob = {
        [Op.between]: [minDOB, maxDOB]
      };
    }

    if (filterData.maritalStatus) {
      profileWhereCondition.martialStatus = filterData.maritalStatus;
    }

    if (filterData.districtId) {
      profileWhereCondition.districtId = filterData.districtId;
    }
  }

  const [matchErr, matachData] = await to(Profile.findAndCountAll(
    {
      attributes: ['id', 'matrimonyId', 'name', 'gender', 'dob', 'martialStatus', 'religion', 'nativePlace', 'createdAt', 'districtId'],
      where: profileWhereCondition,
      include: [
        {
          model: CareerDetails,
          attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome'],
          required: false
        },
        {
          model: ZodiacDetails,
          attributes: ['id', 'dosham', 'patham'],
          where: zodiacWhereCondition,
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
          required: (zodiacWhereCondition.zodiacId || zodiacWhereCondition.starId || zodiacWhereCondition.dosham || zodiacWhereCondition['$star.starTamil$']) ? true : false
        },
        {
          model: ProfileImage,
          attributes: ['profileUrl'],
          required: false,
          where: {
            isMain: true,
            isDeleted: false
          }
        }
      ],
      order: [
        ['created_at', 'DESC']
      ],
      limit: limit,
      offset: offset,
      distinct: true,
      subQuery: false
    }));

  if (matchErr) {
    return TE(matchErr.message);
  }
  return {
    count: matachData.count,
    rows: matachData.rows
  };
}


const getProfileList = async (req) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const filterData = req.query.filterData
    ? JSON.parse(req.query.filterData)
    : null;
  let zodiacWhereCondition = {};
  let profileWhereCondition = {
    isDeleted: false,
    isActive: true
  };

  // Filters
  if (filterData) {
    if (filterData.searchQuery) {
      profileWhereCondition[Op.or] = [
        { name: { [Op.like]: `%${filterData.searchQuery}%` } },
        { matrimonyId: { [Op.like]: `%${filterData.searchQuery}%` } }
      ];
    }

    if (filterData.location) {
      profileWhereCondition[Op.and] = [
        {
          [Op.or]: [
            { nativePlace: { [Op.like]: `%${filterData.location}%` } },
            { '$careerDetails.workLocation$': { [Op.like]: `%${filterData.location}%` } }
          ]
        }
      ];
    }

    if (filterData.zodiacId) {
      zodiacWhereCondition.zodiacId = filterData.zodiacId;
    }

    if (filterData.starId) {
      zodiacWhereCondition.starId = filterData.starId;
    }

    if (filterData.star) {
      zodiacWhereCondition['$star.starTamil$'] = filterData.star;
    }

    if (filterData.dosham) {
      zodiacWhereCondition.dosham = filterData.dosham;
    }

    const fromAge = filterData.fromAge || filterData.ageFrom;
    const toAge = filterData.toAge || filterData.ageTo;
    if (fromAge || toAge) {
      const today = new Date();
      const minAge = toAge ? parseInt(toAge) : 100;
      const maxAge = fromAge ? parseInt(fromAge) : 0;

      const minDOB = new Date(
        today.getFullYear() - minAge - 1,
        today.getMonth(),
        today.getDate()
      );

      const maxDOB = new Date(
        today.getFullYear() - maxAge,
        today.getMonth(),
        today.getDate()
      );

      profileWhereCondition.dob = {
        [Op.between]: [minDOB, maxDOB]
      };
    }

    if (filterData.maritalStatus) {
      profileWhereCondition.martialStatus = filterData.maritalStatus;
    }

    if (filterData.districtId) {
      profileWhereCondition.districtId = filterData.districtId;
    }
  }

  const [matchErr, matachData] = await to(Profile.findAndCountAll(
    {
      attributes: ['id', 'matrimonyId', 'name', 'gender', 'dob', 'martialStatus', 'religion', 'nativePlace', 'createdAt', 'districtId'],
      where: profileWhereCondition,
      include: [
        {
          model: CareerDetails,
          attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome'],
          required: false
        },
        {
          model: ZodiacDetails,
          attributes: ['id', 'dosham', 'patham'],
          where: zodiacWhereCondition,
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
          required: (zodiacWhereCondition.zodiacId || zodiacWhereCondition.starId || zodiacWhereCondition.dosham || zodiacWhereCondition['$star.starTamil$']) ? true : false
        },
        {
          model: ProfileImage,
          attributes: ['profileUrl'],
          required: false,
          where: {
            isMain: true,
            isDeleted: false
          }
        }
      ],
      order: [
        ['created_at', 'DESC']
      ],
      limit: limit,
      offset: offset,
      distinct: true,
      subQuery: false
    }));

  if (matchErr) {
    return TE(matchErr.message);
  }
  return {
    count: matachData.count,
    rows: matachData.rows
  };
}


const sendInterset = async (req) => {
  const id = req?.user?.id;
  const interestId = req?.query?.interestId;
  if (!id || !interestId) return TE('Id is required');
  const [matchErr, matachData] = await to(ProfileInterset.findOrCreate({
    where: {
      profileId: id,
      likedProfileId: interestId
    },
    defaults: {
      profileId: id,
      likedProfileId: interestId
    }
  })
  );
  if (matchErr) {
    return TE(matchErr.message);
  }
  console.log("matachData", matachData[1]);
  if (matachData[1]) {
    return {
      success: true,
      message: 'Interest sent successfully',
      data: matachData[0]
    }
  }
  else {
    return {
      success: true,
      message: 'Interest already sent',
      data: matachData[0]
    }

  }
  return matachData;
}

const getSentLikes = async (req) => {
  const id = req?.user?.id;
  const gender = req?.user?.gender;
  if (!id) return TE('Id is required');
  const [matchErr, matchData] = await to(
    ProfileInterset.findAll({
      attributes: ['profileId', 'likedProfileId'],

      where: { profileId: id },

      include: [
        {
          model: Profile,
          attributes: [
            "id",
            "matrimonyId",
            "name",
            "gender",
            "dob",
            "mobileNumber",
            "martialStatus",
            "religion",
            "nativePlace",
            "createdAt",
            "districtId"
          ],
          as: 'Receiver',
          required: true,
          where: {
            gender: { [Op.ne]: gender },
            isDeleted: false,
            isActive: true
          },
          include: [
            {
              model: CareerDetails,
              attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome'],
              required: false
            },
            {
              model: ZodiacDetails,
              attributes: ['id'],
              required: false,
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
              ]
            },
            {
              model: ProfileImage,
              attributes: ['profileUrl'],
              required: false,
              where: {
                isMain: true,
                isDeleted: false
              }
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ],
    })
  );
  if (matchErr) {
    return TE(matchErr.message);
  }
  return matchData;
}

const getReceivedLikes = async (req) => {
  const id = req?.user?.id;
  const gender = req?.user?.gender;
  if (!id) return TE('Id is required');
  const [matchErr, matachData] = await to(ProfileInterset.findAll({
    attributes: ['profileId', 'likedProfileId'],
    where: {
      likedProfileId: id
    },
    include: [
      {
        model: Profile,
        attributes: [
          "id",
          "matrimonyId",
          "name",
          "gender",
          "dob",
          "mobileNumber",
          "martialStatus",
          "religion",
          "nativePlace",
          "createdAt",
          "districtId"
        ],
        required: true,
        as: "Sender",
        where: {
          gender: { [Op.ne]: gender },
          isDeleted: false,
          isActive: true
        },
        include: [
          {
            model: CareerDetails,
            attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome'],
            required: false
          },
          {
            model: ZodiacDetails,
            attributes: ['id'],
            required: false,
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
            ]
          },
          {
            model: ProfileImage,
            attributes: ['profileUrl'],
            required: false,
            where: {
              isMain: true,
              isDeleted: false
            }
          }
        ],
        order: [['created_at', 'DESC']]
      }
    ],
  }));
  if (matchErr) {
    return TE(matchErr.message);
  }
  return matachData;
}

module.exports = {
  getMatchingList,
  sendInterset,
  getSentLikes,
  getReceivedLikes,
  getProfileList
}