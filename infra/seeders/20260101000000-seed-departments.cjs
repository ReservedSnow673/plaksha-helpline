'use strict';

const { v4: uuidv4 } = require('uuid');

/** Matches @plaksha/shared-types DEPARTMENT_CODES */
const departments = [
  { code: 'MEDICAL', en: 'Medical', hi: 'चिकित्सा', pa: 'ਮੈਡੀਕਲ', color: '#f97316', priority: 'P1' },
  { code: 'FIRE', en: 'Fire', hi: 'अग्नि', pa: 'ਅੱਗ', color: '#ef4444', priority: 'P1' },
  { code: 'SECURITY', en: 'Security', hi: 'सुरक्षा', pa: 'ਸੁਰੱਖਿਆ', color: '#dc2626', priority: 'P2' },
  { code: 'WOMEN_SAFETY', en: 'Women Safety', hi: 'महिला सुरक्षा', pa: 'ਮਹਿਲਾ ਸੁਰੱਖਿਆ', color: '#ec4899', priority: 'P1' },
  { code: 'MENTAL_HEALTH', en: 'Mental Health', hi: 'मानसिक स्वास्थ्य', pa: 'ਮਾਨਸਿਕ ਸਿਹਤ', color: '#8b5cf6', priority: 'P2' },
  { code: 'MAINTENANCE', en: 'Maintenance', hi: 'रखरखाव', pa: 'ਰੱਖ-ਰਖਾਅ', color: '#0ea5e9', priority: 'P4' },
  { code: 'ELECTRICAL', en: 'Electrical', hi: 'विद्युत', pa: 'ਬਿਜਲੀ', color: '#eab308', priority: 'P3' },
  { code: 'CARPENTRY', en: 'Carpentry', hi: 'बढ़ईगीरी', pa: 'ਬੜਈਗੀਰੀ', color: '#a16207', priority: 'P4' },
  { code: 'FACILITIES', en: 'Facilities', hi: 'सुविधाएं', pa: 'ਸਹੂਲਤਾਂ', color: '#14b8a6', priority: 'P4' },
  { code: 'ESCORT', en: 'Safe Walk / Escort', hi: 'सुरक्षित चाल', pa: 'ਸੁਰੱਖਿਅਤ ਚਾਲ', color: '#22c55e', priority: 'P3' },
  {
    code: 'ADMIN_ESCALATION',
    en: 'Administrative Escalation',
    hi: 'प्रशासनिक',
    pa: 'ਪ੍ਰਸ਼ਾਸਕੀ',
    color: '#6366f1',
    priority: 'P3',
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = departments.map((d) => ({
      id: uuidv4(),
      code: d.code,
      name_en: d.en,
      name_hi: d.hi,
      name_pa: d.pa,
      color_hex: d.color,
      default_priority: d.priority,
      escalation_policy_id: null,
      is_active: true,
      created_at: now,
      updated_at: now,
    }));
    await queryInterface.bulkInsert('departments', rows);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('departments', {
      code: departments.map((d) => d.code),
    });
  },
};
