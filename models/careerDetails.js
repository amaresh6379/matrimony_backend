module.exports = (db, Sequelize) => {
  let CareerDetails = db.define('careerDetails', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    educationDetails: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      required: true
    },
    profession: {
      type: Sequelize.STRING,
      required: true
    },
    companyName: {
      type: Sequelize.STRING
    },
    monthyIncome: {
      type: Sequelize.INTEGER,
      required: true
    },
    workLocation: {
      type: Sequelize.STRING,
      required: true
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
      tableName: 'careerDetails', schema: 'matrimony', underscored: true, timestamps: false,
      indexes: [
        {
          name: 'career_details_idx_monthy_income',
          using: 'BTREE',
          fields: ['monthy_income']
        },
        {
          name: 'career_details_idx_work_location',
          using: 'BTREE',
          fields: ['work_location']
        },
        {
          name: 'career_details_idx_profession',
          using: 'BTREE',
          fields: ['profession']
        }
      ]
    });
  CareerDetails.association = (models) => {
    // console.log("carer details model", models)
    CareerDetails.belongsTo(models.profile, { foreignKey: 'profileId' })
  }
  return CareerDetails;
}