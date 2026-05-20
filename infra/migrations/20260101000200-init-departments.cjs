'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departments', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      code: { type: Sequelize.STRING(32), allowNull: false, unique: true },
      name_en: { type: Sequelize.STRING(100), allowNull: false },
      name_hi: { type: Sequelize.STRING(100), allowNull: false },
      name_pa: { type: Sequelize.STRING(100), allowNull: false },
      color_hex: { type: Sequelize.STRING(7), allowNull: false, defaultValue: '#dc2626' },
      default_priority: { type: Sequelize.STRING(4), allowNull: false, defaultValue: 'P2' },
      escalation_policy_id: { type: Sequelize.UUID, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addConstraint('users', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'users_department_id_fk',
      references: { table: 'departments', field: 'id' },
      onDelete: 'SET NULL',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('users', 'users_department_id_fk');
    await queryInterface.dropTable('departments');
  },
};
