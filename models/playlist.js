'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      // Define many-to-many relationship with Song
      Playlist.belongsToMany(models.Song, {
        through: 'PlaylistSongs',
        foreignKey: 'PlaylistId',
        otherKey: 'SongId',
        as: 'Songs' // Alias to access songs related to the playlist
      });
    }
  }
  
  Playlist.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Playlist',
  });
  
  return Playlist;
};
