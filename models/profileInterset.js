module.exports = (db, Sequelize) => {
  let ProfileInterset = db.define('profileInterset', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    profileId: {
      type: Sequelize.STRING,
    },
    likedProfileId: {
      type: Sequelize.BOOLEAN
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

  return ProfileInterset;
}