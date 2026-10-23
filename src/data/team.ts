export interface TeamMember {
  /** A unique, stable identifier, such as the member's first and last name. */
  id: string
  name: string
  role: string
  /** Optional local photo path, for example /images/team/your-photo.jpg. */
  image?: string
  biography: string
}

/**
 * Add only confirmed team members and photos you have permission to use.
 * Save photographs in public/images/team/ and reference them from /images/team/.
 * The About page automatically displays cards when this array contains members.
 * An omitted or unavailable image displays the member's initials instead.
 *
 * Copy this structure into the array and replace every value with real details:
 * {
 *   id: 'your-unique-member-id',
 *   name: 'Actual member name',
 *   role: 'Actual project responsibility',
 *   image: '/images/team/your-photo.jpg',
 *   biography: 'A short, approved biography about this member.',
 * },
 */
export const teamMembers: TeamMember[] = []
