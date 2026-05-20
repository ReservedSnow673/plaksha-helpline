'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('incidents', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      public_code: { type: Sequelize.STRING(16), allowNull: false, unique: true },
      reported_by_user_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      reporter_phone_hash: { type: Sequelize.STRING(64), allowNull: true },
      anonymous: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      category: { type: Sequelize.STRING(48), allowNull: false },
      department_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'departments', key: 'id' }, onDelete: 'SET NULL' },
      priority: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'P3' },
      status: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'CREATED' },
      channel: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'APP_SOS' },
      language: { type: Sequelize.STRING(8), allowNull: false, defaultValue: 'en' },
      lat: { type: Sequelize.DOUBLE, allowNull: true },
      lng: { type: Sequelize.DOUBLE, allowNull: true },
      geohash: { type: Sequelize.STRING(12), allowNull: true },
      location_accuracy_m: { type: Sequelize.DOUBLE, allowNull: true },
      location_label: { type: Sequelize.STRING(255), allowNull: true },
      address_text: { type: Sequelize.STRING(500), allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      sla_response_target_at: { type: Sequelize.DATE, allowNull: true },
      sla_resolve_target_at: { type: Sequelize.DATE, allowNull: true },
      acknowledged_at: { type: Sequelize.DATE, allowNull: true },
      first_responder_assigned_at: { type: Sequelize.DATE, allowNull: true },
      en_route_at: { type: Sequelize.DATE, allowNull: true },
      arrived_at: { type: Sequelize.DATE, allowNull: true },
      resolved_at: { type: Sequelize.DATE, allowNull: true },
      closed_at: { type: Sequelize.DATE, allowNull: true },
      archived_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_reason: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('incidents', ['status'], { name: 'incidents_status' });
    await queryInterface.addIndex('incidents', ['department_id', 'status'], { name: 'incidents_dept_status' });
    await queryInterface.addIndex('incidents', ['priority', 'status'], { name: 'incidents_priority_status' });
    await queryInterface.addIndex('incidents', ['geohash'], { name: 'incidents_geohash' });
    await queryInterface.addIndex('incidents', ['created_at'], { name: 'incidents_created_at' });
    await queryInterface.addIndex('incidents', ['reported_by_user_id'], { name: 'incidents_reporter' });

    await queryInterface.createTable('incident_events', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      incident_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'incidents', key: 'id' }, onDelete: 'CASCADE' },
      sequence: { type: Sequelize.BIGINT, allowNull: false, autoIncrement: true, unique: true },
      event_type: { type: Sequelize.STRING(64), allowNull: false },
      actor_user_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      actor_kind: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'SYSTEM' },
      payload: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      occurred_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('incident_events', ['incident_id', 'sequence'], { name: 'incident_events_incident_seq' });
    await queryInterface.addIndex('incident_events', ['event_type'], { name: 'incident_events_type' });

    await queryInterface.createTable('incident_assignments', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      incident_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'incidents', key: 'id' }, onDelete: 'CASCADE' },
      responder_user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'OFFERED' },
      offered_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      accepted_at: { type: Sequelize.DATE, allowNull: true },
      rejected_at: { type: Sequelize.DATE, allowNull: true },
      rejection_reason: { type: Sequelize.STRING(500), allowNull: true },
      en_route_at: { type: Sequelize.DATE, allowNull: true },
      arrived_at: { type: Sequelize.DATE, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      eta_seconds: { type: Sequelize.INTEGER, allowNull: true },
      distance_m: { type: Sequelize.DOUBLE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('incident_assignments', ['incident_id'], { name: 'assignments_incident_id' });
    await queryInterface.addIndex('incident_assignments', ['responder_user_id'], { name: 'assignments_responder_id' });
    await queryInterface.addIndex('incident_assignments', ['status'], { name: 'assignments_status' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('incident_assignments');
    await queryInterface.dropTable('incident_events');
    await queryInterface.dropTable('incidents');
  },
};
