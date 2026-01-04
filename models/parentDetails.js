module.exports = (db, Sequelize) => {
  let ParentDetails = db.define('parentDetails', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fatherName: {
      type: Sequelize.STRING,
      required: true
    },
    motherName: {
      type: Sequelize.STRING,
      required: true
    },
    fatherMobileNumber: {
      type: Sequelize.STRING
    },
    motherMobileNumber: {
      type: Sequelize.STRING
    },
    siblingMale: {
      type: Sequelize.INTEGER
    },
    siblingFemale: {
      type: Sequelize.INTEGER
    },
    marriedMale: {
      type: Sequelize.INTEGER
    },
    marriedFemale: {
      type: Sequelize.INTEGER
    },
    contactPersonName:{
      type: Sequelize.STRING
    },
    contactPersonNumber:{
      type: Sequelize.STRING
    },
    contactPersonType:{
      type: Sequelize.STRING
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
  },
    {
      tableName: 'parentDetails', schema: 'matrimony', underscored: true, timestamps: false,
    });
  ParentDetails.association = (models) => {
    ParentDetails.belongsTo(models.profile, { foreignKey: 'profileId' })
  }
  return ParentDetails;
}