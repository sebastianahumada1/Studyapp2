export type Role = 'student' | 'coach' | 'admin'

export const ROLES = {
  STUDENT: 'student' as const,
  COACH: 'coach' as const,
  ADMIN: 'admin' as const,
} satisfies Record<string, Role>

export function isValidRole(role: string): role is Role {
  return role === 'student' || role === 'coach' || role === 'admin'
}

// Profile type según schema.sql (tabla profiles)
export type Profile = {
  id: string
  full_name: string
  phone: string
  role: Role
  created_at?: string
}
