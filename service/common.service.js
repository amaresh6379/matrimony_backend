const District = require('../models').district;
const Star = require('../models').star;
const Zodiac = require('../models').zodiac;
const Weight = require('../models').weight;
const Height = require('../models').height;

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


module.exports = {
  getDistrict,
  getStar,
  getZodiac,
  getWeight,
  getHeight
}