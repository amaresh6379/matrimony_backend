const { TE } = require('../global_function');
const District = require('../models').district;
const Star = require('../models').star;
const Zodiac = require('../models').zodiac;
const Weight = require('../models').weight;
const Height = require('../models').height;
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const getDistrict = async () => {
  const [districtErr, districtData] = await to(District.findAll({ attributes: ['id', 'districtName', 'isDeleted'], where: { isDeleted: false } }));
  if (districtErr) {
    return TE(districtErr.message);
  }
  return districtData;
};

const getStar = async () => {
  const [starErr, starData] = await to(Star.findAll({ attributes: ['id', 'starName', 'starTamil'] }));
  if (starErr) {
    return TE(starErr.message);
  }
  return starData;
};

const getZodiac = async () => {
  const [zodiacErr, zodiacData] = await to(Zodiac.findAll({ attributes: ['id', 'zodiacName', 'zodiacTamil'] }));
  if (zodiacErr) {
    return TE(zodiacErr.message);
  }
  return zodiacData;
};


const getWeight = async () => {
  const [weightErr, weightData] = await to(Weight.findAll({ attributes: ['id', 'weightName'] }));
  if (weightErr) {
    return TE(weightErr.message);
  }
  return weightData;
}

const getHeight = async () => {
  const [heightErr, heightData] = await to(Height.findAll({ attributes: ['id', 'heightName'] }));
  if (heightErr) {
    return TE(heightErr.message);
  }
  return heightData;
}


const s3 = new S3Client({
  region: CONFIG.AWS_REGION,
  credentials: {
    accessKeyId: CONFIG.AWS_ACCESS_KEY,
    secretAccessKey: CONFIG.AWS_SECRET_KEY
  }
});

const getPresignedUrl = async (req, res) => {
  const { fileName, fileType } = req.body;
  console.log("fileName", fileName);
  console.log("fileType", fileType);
  const command = new PutObjectCommand({
    Bucket: CONFIG.AWS_BUCKET,
    Key: `profile/${fileName}`,
    ContentType: fileType
  });
  const [uploadErr, uploadUrl] = await to(getSignedUrl(s3, command, { expiresIn: 30000 }));
  if (uploadErr) {
    return TE(uploadErr.message);
  }
  return {
    uploadUrl,
    fileUrl: `https://${CONFIG.AWS_BUCKET}.s3.amazonaws.com/profile/${fileName}`
  };
}

module.exports = {
  getDistrict,
  getStar,
  getZodiac,
  getWeight,
  getHeight,
  getPresignedUrl
}