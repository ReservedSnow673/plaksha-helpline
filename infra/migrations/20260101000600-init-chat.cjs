'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_threads', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      incident_id: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'incidents', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      closed_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.createTable('chat_messages', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      thread_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'chat_threads', key: 'id' }, onDelete: 'CASCADE' },
      sender_user_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      body: { type: Sequelize.TEXT, allowNull: false },
      attachment_url: { type: Sequelize.STRING(512), allowNull: true },
      attachment_type: { type: Sequelize.STRING(64), allowNull: true },
      client_message_id: { type: Sequelize.STRING(128), allowNull: true, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      read_at: { type: Sequelize.DATE, allowNull: true },
      system: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    });
    await queryInterface.addIndex('chat_messages', ['thread_id'], { name: 'chat_messages_thread_id' });
    await queryInterface.addIndex('chat_messages', ['thread_id', 'created_at'], { name: 'chat_messages_thread_time' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('chat_messages');
    await queryInterface.dropTable('chat_threads');
  },
};
