'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlaylistSongs extends Model {}

  PlaylistSongs.init({
    PlaylistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Playlists',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    SongId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Songs',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'PlaylistSongs',
  });
  
  return PlaylistSongs;
};