'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('call_records', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      incident_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'incidents', key: 'id' }, onDelete: 'SET NULL' },
      provider: { type: Sequelize.STRING(16), allowNull: false },
      provider_call_sid: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      direction: { type: Sequelize.STRING(16), allowNull: false },
      from_e164: { type: Sequelize.STRING(32), allowNull: false },
      to_e164: { type: Sequelize.STRING(32), allowNull: false },
      language: { type: Sequelize.STRING(8), allowNull: true },
      ivr_path: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      started_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      answered_at: { type: Sequelize.DATE, allowNull: true },
      ended_at: { type: Sequelize.DATE, allowNull: true },
      duration_seconds: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'RINGING' },
      recording_url: { type: Sequelize.STRING(512), allowNull: true },
      recording_consent: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('call_records', ['incident_id'], { name: 'call_records_incident_id' });
    await queryInterface.addIndex('call_records', ['from_e164'], { name: 'call_records_from' });

    await queryInterface.createTable('sms_records', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      incident_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'incidents', key: 'id' }, onDelete: 'SET NULL' },
      provider: { type: Sequelize.STRING(16), allowNull: false },
      provider_message_id: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      direction: { type: Sequelize.STRING(16), allowNull: false },
      from_e164: { type: Sequelize.STRING(32), allowNull: false },
      to_e164: { type: Sequelize.STRING(32), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'QUEUED' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('sms_records', ['incident_id'], { name: 'sms_records_incident_id' });
    await queryInterface.addIndex('sms_records', ['from_e164'], { name: 'sms_records_from' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('sms_records');
    await queryInterface.dropTable('call_records');
  },
};
