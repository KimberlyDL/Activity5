'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('PlaylistSongs', {
      PlaylistId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Playlists', // name of Target model
          key: 'id', // key in Target model
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      SongId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Songs', // name of Target model
          key: 'id', // key in Target model
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('PlaylistSongs');
  }
};
