'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      // Define many-to-many relationship with Playlist
      Song.belongsToMany(models.Playlist, {
        through: 'PlaylistSongs',
        foreignKey: 'SongId',
        otherKey: 'PlaylistId',
        as: 'Playlists' // Alias to access playlists related to the song
      });
    }
  }
  
  Song.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    album: {
      type: DataTypes.STRING,
    },
    genre: {
      type: DataTypes.STRING,
    },
    filepath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isFav: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Song',
  });
  
  return Song;
};
