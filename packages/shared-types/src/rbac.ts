export type Role =
  | 'STUDENT'
  | 'FACULTY'
  | 'STAFF'
  | 'RESPONDER'
  | 'DISPATCHER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export const ROLES: readonly Role[] = [
  'STUDENT',
  'FACULTY',
  'STAFF',
  'RESPONDER',
  'DISPATCHER',
  'ADMIN',
  'SUPER_ADMIN',
] as const;

export type Permission =
  | 'incident.create'
  | 'incident.read.own'
  | 'incident.read.any'
  | 'incident.read.department'
  | 'incident.update.status'
  | 'incident.assign'
  | 'incident.escalate'
  | 'incident.cancel.own'
  | 'incident.close'
  | 'incident.archive'
  | 'responder.update_status'
  | 'responder.update_location'
  | 'responder.assignment.accept'
  | 'responder.assignment.reject'
  | 'department.read'
  | 'department.write'
  | 'user.read.any'
  | 'user.write'
  | 'user.role.assign'
  | 'audit.read'
  | 'analytics.read'
  | 'escalation_policy.read'
  | 'escalation_policy.write'
  | 'feature_flag.read'
  | 'feature_flag.write'
  | 'call.read'
  | 'call.dispatch'
  | 'chat.send'
  | 'chat.read'
  | 'system.admin';

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  STUDENT: [
    'incident.create',
    'incident.read.own',
    'incident.cancel.own',
    'chat.send',
    'chat.read',
  ],
  FACULTY: [
    'incident.create',
    'incident.read.own',
    'incident.cancel.own',
    'chat.send',
    'chat.read',
  ],
  STAFF: [
    'incident.create',
    'incident.read.own',
    'incident.cancel.own',
    'chat.send',
    'chat.read',
  ],
  RESPONDER: [
    'incident.read.department',
    'incident.update.status',
    'responder.update_status',
    'responder.update_location',
    'responder.assignment.accept',
    'responder.assignment.reject',
    'chat.send',
    'chat.read',
  ],
  DISPATCHER: [
    'incident.read.any',
    'incident.create',
    'incident.update.status',
    'incident.assign',
    'incident.escalate',
    'incident.close',
    'responder.update_status',
    'department.read',
    'user.read.any',
    'call.read',
    'call.dispatch',
    'chat.send',
    'chat.read',
    'analytics.read',
  ],
  ADMIN: [
    'incident.read.any',
    'incident.create',
    'incident.update.status',
    'incident.assign',
    'incident.escalate',
    'incident.close',
    'incident.archive',
    'department.read',
    'department.write',
    'user.read.any',
    'user.write',
    'user.role.assign',
    'audit.read',
    'analytics.read',
    'escalation_policy.read',
    'escalation_policy.write',
    'feature_flag.read',
    'call.read',
    'call.dispatch',
    'chat.send',
    'chat.read',
  ],
  SUPER_ADMIN: [
    'incident.read.any',
    'incident.create',
    'incident.update.status',
    'incident.assign',
    'incident.escalate',
    'incident.close',
    'incident.archive',
    'department.read',
    'department.write',
    'user.read.any',
    'user.write',
    'user.role.assign',
    'audit.read',
    'analytics.read',
    'escalation_policy.read',
    'escalation_policy.write',
    'feature_flag.read',
    'feature_flag.write',
    'call.read',
    'call.dispatch',
    'chat.send',
    'chat.read',
    'system.admin',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function rolesWithPermission(permission: Permission): Role[] {
  return ROLES.filter((role) => hasPermission(role, permission));
}
