'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      email: { type: 'CITEXT', allowNull: false, unique: true },
      email_verified_at: { type: Sequelize.DATE, allowNull: true },
      microsoft_oid: { type: Sequelize.STRING, allowNull: true, unique: true },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: false },
      phone_encrypted: { type: Sequelize.TEXT, allowNull: true },
      phone_hash: { type: Sequelize.STRING(64), allowNull: true },
      preferred_language: { type: Sequelize.STRING(8), allowNull: false, defaultValue: 'en' },
      role: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'STUDENT' },
      department_id: { type: Sequelize.UUID, allowNull: true },
      status: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'ACTIVE' },
      last_active_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('users', ['role'], { name: 'users_role' });
    await queryInterface.addIndex('users', ['department_id'], { name: 'users_department_id' });
    await queryInterface.addIndex('users', ['phone_hash'], { name: 'users_phone_hash' });

    await queryInterface.createTable('sessions', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      refresh_token_hash: { type: Sequelize.STRING(255), allowNull: false },
      device_id: { type: Sequelize.STRING(128), allowNull: true },
      platform: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'UNKNOWN' },
      app_version: { type: Sequelize.STRING(32), allowNull: true },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      user_agent: { type: Sequelize.STRING(512), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      last_used_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      revoked_at: { type: Sequelize.DATE, allowNull: true },
      revoked_reason: { type: Sequelize.STRING(64), allowNull: true },
    });
    await queryInterface.addIndex('sessions', ['user_id'], { name: 'sessions_user_id' });

    await queryInterface.createTable('magic_link_tokens', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      email: { type: 'CITEXT', allowNull: false },
      token_hash: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      consumed_at: { type: Sequelize.DATE, allowNull: true },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      attempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('magic_link_tokens', ['email'], { name: 'magic_link_email' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('magic_link_tokens');
    await queryInterface.dropTable('sessions');
    await queryInterface.dropTable('users');
  },
};
