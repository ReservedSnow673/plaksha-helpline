'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('responder_profiles', {
      user_id: { type: Sequelize.UUID, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      department_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'departments', key: 'id' }, onDelete: 'RESTRICT' },
      is_on_duty: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      shift_started_at: { type: Sequelize.DATE, allowNull: true },
      current_lat: { type: Sequelize.DOUBLE, allowNull: true },
      current_lng: { type: Sequelize.DOUBLE, allowNull: true },
      location_updated_at: { type: Sequelize.DATE, allowNull: true },
      current_geohash: { type: Sequelize.STRING(12), allowNull: true },
      status: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'OFFLINE' },
      current_assignment_id: { type: Sequelize.UUID, allowNull: true },
      vehicle_info: { type: Sequelize.JSONB, allowNull: true },
      skills: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: false, defaultValue: [] },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('responder_profiles', ['department_id'], { name: 'responder_department_id' });
    await queryInterface.addIndex('responder_profiles', ['is_on_duty'], { name: 'responder_on_duty' });
    await queryInterface.addIndex('responder_profiles', ['current_geohash'], { name: 'responder_geohash' });
    await queryInterface.addIndex('responder_profiles', ['status'], { name: 'responder_status' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('responder_profiles');
  },
};
