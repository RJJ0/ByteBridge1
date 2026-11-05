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
export const teamMembers: TeamMember[] = [
  {
    id: 'richard-jebolan',
    name: 'Richard Jebolan',
    role: 'Founder and Program Lead',
    biography: 'Leads ByteBridge’s direction and shapes the learning program, from workshop content to how sessions are delivered.',
  },
  {
    id: 'raleigh-tracer-cabotage',
    name: 'Raleigh Tracer Cabotage',
    role: 'Co-founder and Operations',
    biography: 'Coordinates the planning and day-to-day logistics that help workshops run smoothly.',
  },
  {
    id: 'saul-goodman',
    name: 'Saul Goodman',
    role: 'Co-founder and Partnerships',
    biography: 'Builds relationships with schools, communities, and organizations interested in bringing digital learning to their learners.',
  },
]
