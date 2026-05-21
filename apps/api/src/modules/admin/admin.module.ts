import { Module } from '@nestjs/common';

/**
 * Composition shell for admin-only cross-cutting endpoints. Most admin functionality
 * lives in the resource modules (users, departments, escalation, feature-flags, audit)
 * and is gated by RBAC. This module exists as a stable mount point for future
 * admin-only utilities (export, retention triggers, etc.).
 */
@Module({})
export class AdminModule {}
