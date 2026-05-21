'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [departments] = await queryInterface.sequelize.query('SELECT id, code FROM departments;');

    const policyRows = [];
    const levelRows = [];

    for (const dept of departments) {
      const policyId = uuidv4();
      policyRows.push({
        id: policyId,
        department_id: dept.id,
        name: `${dept.code} default policy`,
        is_active: true,
        created_at: now,
        updated_at: now,
      });

      const tiers = [
        { delay: 120, action: 'NOTIFY_BACKUP_RESPONDER', role: 'RESPONDER' },
        { delay: 300, action: 'NOTIFY_DISPATCHER', role: 'DISPATCHER' },
        { delay: 900, action: 'NOTIFY_ADMIN', role: 'ADMIN' },
      ];
      tiers.forEach((tier, idx) => {
        levelRows.push({
          id: uuidv4(),
          policy_id: policyId,
          level_index: idx + 1,
          trigger_after_seconds: tier.delay,
          action: tier.action,
          target_role: tier.role,
          target_user_id: null,
          target_department_id: dept.id,
          requires_ack: true,
          ack_deadline_seconds: tier.delay,
        });
      });
    }

    if (policyRows.length > 0) {
      await queryInterface.bulkInsert('escalation_policies', policyRows);
      await queryInterface.bulkInsert('escalation_levels', levelRows);
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('escalation_levels', null);
    await queryInterface.bulkDelete('escalation_policies', null);
  },
};
