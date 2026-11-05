/** Keep in sync with CREDITS.md at the repository root. */
export interface Credit { file: string; usedFor: string; title: string; author: string; source: string; license: string; licenseUrl: string }

const unsplash = { license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license' }

export const imageCredits: Credit[] = [
  {
    file: '/images/digital-learning.jpg', usedFor: 'Home page hero; social sharing image (og-image.jpg)',
    title: 'Diverse group of students gathered around a laptop', author: 'Vitaly Gariev',
    source: 'https://unsplash.com/photos/diverse-group-of-students-gathered-around-a-laptop-8gAbl776pc0', ...unsplash,
  },
  {
    file: '/images/collaborative-learning.jpg', usedFor: 'About page, Our Story',
    title: 'Group of people using laptop computer', author: 'Annie Spratt',
    source: 'https://unsplash.com/photos/group-of-people-using-laptop-computer-QckxruozjRg', ...unsplash,
  },
  {
    file: '/images/digital-education.webp', usedFor: 'Donate page, Digital Education',
    title: 'Child’s hands typing on a laptop keyboard', author: 'Vlad Deep',
    source: 'https://unsplash.com/photos/childs-hands-typing-on-a-laptop-keyboard-zniM2Qqaxv4', ...unsplash,
  },
  {
    file: '/images/technology-access.webp', usedFor: 'Donate page, Technology Access',
    title: 'People sitting down near table with assorted laptop computers', author: 'Marvin Meyer',
    source: 'https://unsplash.com/photos/people-sitting-down-near-table-with-assorted-laptop-computers-SYTO3xs06fU', ...unsplash,
  },
  {
    file: '/images/community-empowerment.webp', usedFor: 'Donate page, Community Empowerment',
    title: 'A group of children walking down a street (Tigaon, Camarines Sur, Philippines)', author: 'Taylor Keeran',
    source: 'https://unsplash.com/photos/a-group-of-children-walking-down-a-street-Gdbvbk9pIYU', ...unsplash,
  },
]
