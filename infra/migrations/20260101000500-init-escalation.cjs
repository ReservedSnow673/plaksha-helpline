'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escalation_policies', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      department_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'departments', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(100), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('escalation_policies', ['department_id'], { name: 'escalation_policy_department' });

    await queryInterface.createTable('escalation_levels', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      policy_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'escalation_policies', key: 'id' }, onDelete: 'CASCADE' },
      level_index: { type: Sequelize.INTEGER, allowNull: false },
      trigger_after_seconds: { type: Sequelize.INTEGER, allowNull: false },
      action: { type: Sequelize.STRING(32), allowNull: false },
      target_role: { type: Sequelize.STRING(32), allowNull: true },
      target_user_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      target_department_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'departments', key: 'id' }, onDelete: 'SET NULL' },
      requires_ack: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ack_deadline_seconds: { type: Sequelize.INTEGER, allowNull: true },
    });
    await queryInterface.addIndex('escalation_levels', ['policy_id'], { name: 'escalation_level_policy_id' });
    await queryInterface.addIndex('escalation_levels', ['policy_id', 'level_index'], { name: 'escalation_level_unique', unique: true });

    await queryInterface.createTable('escalation_runs', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      incident_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'incidents', key: 'id' }, onDelete: 'CASCADE' },
      policy_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'escalation_policies', key: 'id' }, onDelete: 'RESTRICT' },
      level_index: { type: Sequelize.INTEGER, allowNull: false },
      scheduled_for: { type: Sequelize.DATE, allowNull: false },
      fired_at: { type: Sequelize.DATE, allowNull: true },
      outcome: { type: Sequelize.STRING(32), allowNull: true },
      job_id: { type: Sequelize.STRING(128), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('escalation_runs', ['incident_id'], { name: 'escalation_run_incident' });
    await queryInterface.addIndex('escalation_runs', ['outcome', 'scheduled_for'], { name: 'escalation_runs_outcome' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('escalation_runs');
    await queryInterface.dropTable('escalation_levels');
    await queryInterface.dropTable('escalation_policies');
  },
};
