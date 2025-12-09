module.exports = (db, Sequelize) => {
  let ProfileImage = db.define('profileImage', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    profileUrl: {
      type: Sequelize.STRING,
    },
    isMain: {
      type: Sequelize.BOOLEAN
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      required: true,
      defaultValue: false
    }
  },
    {
      tableName: 'profileImage', schema: 'matrimony', underscored: true, timestamps: false,
      indexes: [
        {
          name: 'profile_image_idx_is_deleted',
          using: 'BTREE',
          fields: ['is_deleted']
        },
        {
          name: 'profile_image_idx_is_main',
          using: 'BTREE',
          fields: ['is_main']
        }
      ]
    });
  ProfileImage.association = (models) => {
    ProfileImage.belongsTo(models.profile, { foreignKey: 'profileId' })
  }
  return ProfileImage;
}