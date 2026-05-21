'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      actor_user_id: { type: Sequelize.UUID, allowNull: true },
      actor_role: { type: Sequelize.STRING(32), allowNull: true },
      action: { type: Sequelize.STRING(64), allowNull: false },
      resource_type: { type: Sequelize.STRING(64), allowNull: false },
      resource_id: { type: Sequelize.STRING(128), allowNull: true },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      user_agent: { type: Sequelize.STRING(512), allowNull: true },
      before: { type: Sequelize.JSONB, allowNull: true },
      after: { type: Sequelize.JSONB, allowNull: true },
      occurred_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('audit_logs', ['action'], { name: 'audit_logs_action' });
    await queryInterface.addIndex('audit_logs', ['resource_type'], { name: 'audit_logs_resource' });
    await queryInterface.addIndex('audit_logs', ['resource_type', 'resource_id'], { name: 'audit_logs_resource_lookup' });
    await queryInterface.addIndex('audit_logs', ['actor_user_id'], { name: 'audit_logs_actor' });
    await queryInterface.addIndex('audit_logs', ['occurred_at'], { name: 'audit_logs_occurred_at' });

    await queryInterface.createTable('consent_records', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      consent_type: { type: Sequelize.STRING(32), allowNull: false },
      granted_at: { type: Sequelize.DATE, allowNull: true },
      revoked_at: { type: Sequelize.DATE, allowNull: true },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      policy_version: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'v1' },
    });
    await queryInterface.addIndex('consent_records', ['user_id'], { name: 'consent_records_user_id' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('consent_records');
    await queryInterface.dropTable('audit_logs');
  },
};
