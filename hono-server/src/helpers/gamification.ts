import { ROLE_HIERARCHY } from './auth.js';
import { UserRole } from '../models/index.js';

export const calculateUserLevel = (xp: number, currentRole: string): UserRole => {
  // 1. Check if user is Moderator or Admin (Level 5 or 10)
  const currentRank = ROLE_HIERARCHY[currentRole] || 1;

  // 2. Protect staff! If they are moderator or above, NEVER change their role.
  if (currentRank >= ROLE_HIERARCHY.moderator) {
    return currentRole as UserRole;
  }

  if (xp >= 500) return 'budget_guru';
  if (xp >= 250) return 'wise_spender';
  if (xp >= 100) return 'budget_starter';
  return 'regular';
};
