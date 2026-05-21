'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feature_flags', {
      key: { type: Sequelize.STRING(128), primaryKey: true },
      value: { type: Sequelize.JSONB, allowNull: false, defaultValue: false },
      scope: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'GLOBAL' },
      updated_by: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable('outbox_events', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      aggregate_type: { type: Sequelize.STRING(64), allowNull: false },
      aggregate_id: { type: Sequelize.STRING(128), allowNull: false },
      event_type: { type: Sequelize.STRING(64), allowNull: false },
      payload: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      rooms: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      published_at: { type: Sequelize.DATE, allowNull: true },
      retries: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      last_error: { type: Sequelize.TEXT, allowNull: true },
    });
    await queryInterface.addIndex('outbox_events', ['published_at', 'created_at'], { name: 'outbox_pending' });
    await queryInterface.addIndex('outbox_events', ['aggregate_type', 'aggregate_id'], { name: 'outbox_aggregate' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('outbox_events');
    await queryInterface.dropTable('feature_flags');
  },
};
