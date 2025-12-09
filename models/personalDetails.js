module.exports = (db, Sequelize) => {
  let PersonalDetails = db.define('personalDetails', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    skinTone: {
      type: Sequelize.STRING
    },
    foodOption: {
      type: Sequelize.ENUM('VEG', 'NONVEG', 'SOMETIMES_NONVEG')
    },
    Interest: {
      type: Sequelize.STRING
    },
    asset: {
      type: Sequelize.STRING
    }
  },
    {
      tableName: 'personalDetails', schema: 'matrimony', underscored: true, timestamps: false,
      indexes: [
        {
          name: 'personal_details_idx_food_option',
          using: 'BTREE',
          fields: ['food_option']
        },
        {
          name: 'personal_details_idx_skin_tone',
          using: 'BTREE',
          fields: ['skin_tone']
        }
      ]
    });
  PersonalDetails.association = (models) => {
    PersonalDetails.belongsTo(models.profile, { foreignKey: 'profileId' })
    PersonalDetails.belongsTo(models.height, { foreignKey: 'heightId' })
    PersonalDetails.belongsTo(models.weight, { foreignKey: 'weightId' })
  }
  return PersonalDetails;
}