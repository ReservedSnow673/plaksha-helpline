'use strict';

const { v4: uuidv4 } = require('uuid');

const devUsers = [
  { email: 'super.admin@plaksha.edu.in', first: 'Super', last: 'Admin', role: 'SUPER_ADMIN', dept: null },
  { email: 'admin@plaksha.edu.in', first: 'System', last: 'Admin', role: 'ADMIN', dept: null },
  { email: 'dispatcher@plaksha.edu.in', first: 'Dispatch', last: 'One', role: 'DISPATCHER', dept: null },
  { email: 'responder.security@plaksha.edu.in', first: 'Security', last: 'Responder', role: 'RESPONDER', dept: 'SECURITY' },
  { email: 'responder.fire@plaksha.edu.in', first: 'Fire', last: 'Responder', role: 'RESPONDER', dept: 'FIRE' },
  { email: 'responder.medical@plaksha.edu.in', first: 'Medical', last: 'Responder', role: 'RESPONDER', dept: 'MEDICAL' },
  { email: 'responder.facilities@plaksha.edu.in', first: 'Facilities', last: 'Responder', role: 'RESPONDER', dept: 'FACILITIES' },
  { email: 'student@plaksha.edu.in', first: 'Test', last: 'Student', role: 'STUDENT', dept: null },
  { email: 'faculty@plaksha.edu.in', first: 'Test', last: 'Faculty', role: 'FACULTY', dept: null },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [departments] = await queryInterface.sequelize.query('SELECT id, code FROM departments;');
    const deptByCode = new Map(departments.map((d) => [d.code, d.id]));

    const userRows = devUsers.map((u) => ({
      id: uuidv4(),
      email: u.email,
      email_verified_at: now,
      microsoft_oid: null,
      first_name: u.first,
      last_name: u.last,
      phone_encrypted: null,
      phone_hash: null,
      preferred_language: 'en',
      role: u.role,
      department_id: u.dept ? deptByCode.get(u.dept) : null,
      status: 'ACTIVE',
      last_active_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    }));
    await queryInterface.bulkInsert('users', userRows);

    const responderUsers = userRows.filter((u) => u.role === 'RESPONDER');
    const responderRows = responderUsers.map((u) => ({
      user_id: u.id,
      department_id: u.department_id,
      is_on_duty: false,
      shift_started_at: null,
      current_lat: null,
      current_lng: null,
      location_updated_at: null,
      current_geohash: null,
      status: 'OFFLINE',
      current_assignment_id: null,
      vehicle_info: null,
      skills: ['general'],
      created_at: now,
      updated_at: now,
    }));
    if (responderRows.length > 0) {
      await queryInterface.bulkInsert('responder_profiles', responderRows);
    }
  },
  async down(queryInterface) {
    const emails = devUsers.map((u) => u.email);
    await queryInterface.bulkDelete('responder_profiles', null);
    await queryInterface.bulkDelete('users', { email: emails });
  },
};
