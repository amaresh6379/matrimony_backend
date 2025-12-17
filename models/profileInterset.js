module.exports = (db, Sequelize) => {
  let ProfileInterset = db.define('profileInterset', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  },
    {
      tableName: 'profileInterset', schema: 'matrimony', underscored: true, timestamps: false,
      indexes: [
        {
          name: 'profile_interset_idx_id',
          using: 'BTREE',
          fields: ['id']
        },
        {
          name: 'profile_interset_idx_profile_id',
          using: 'BTREE',
          fields: ['profile_id']
        },
        {
          name: 'profile_interset_idx_liked_profile_id',
          using: 'BTREE',
          fields: ['liked_profile_id']
        },
      ]
    });
  ProfileInterset.association = (models) => {
    ProfileInterset.belongsTo(models.profile, { foreignKey: 'profileId', as: 'Sender' });
    ProfileInterset.belongsTo(models.profile, { foreignKey: 'likedProfileId', as: 'Receiver' });
  }

  return ProfileInterset;
}