'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      channel: { type: Sequelize.STRING(16), allowNull: false },
      incident_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'incidents', key: 'id' }, onDelete: 'SET NULL' },
      payload: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      priority: { type: Sequelize.STRING(4), allowNull: false, defaultValue: 'P3' },
      status: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'QUEUED' },
      provider_message_id: { type: Sequelize.STRING(128), allowNull: true },
      attempt_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      last_attempt_at: { type: Sequelize.DATE, allowNull: true },
      delivered_at: { type: Sequelize.DATE, allowNull: true },
      error: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('notifications', ['user_id'], { name: 'notifications_user_id' });
    await queryInterface.addIndex('notifications', ['status'], { name: 'notifications_status' });
    await queryInterface.addIndex('notifications', ['incident_id'], { name: 'notifications_incident' });

    await queryInterface.createTable('device_registrations', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      expo_push_token: { type: Sequelize.STRING(256), allowNull: false, unique: true },
      device_id: { type: Sequelize.STRING(128), allowNull: false },
      platform: { type: Sequelize.STRING(16), allowNull: false },
      app_version: { type: Sequelize.STRING(32), allowNull: false },
      locale: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'en' },
      last_seen_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      push_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('device_registrations', ['user_id'], { name: 'device_registrations_user_id' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('device_registrations');
    await queryInterface.dropTable('notifications');
  },
};
