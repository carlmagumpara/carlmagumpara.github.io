export type Experience = {
  company: string
  location: string
  role: string
  period: string
  bullets: string[]
}

export const experience: Experience[] = [
  {
    company: 'LexMeet Inc',
    location: 'Pasig City',
    role: 'Fullstack Developer',
    period: 'Apr 2017 — Present',
    bullets: [
      'Develop full-stack web applications using Laravel for backend and frontend technologies like React.',
      'Design and implement RESTful APIs, database schemas, and user interfaces.',
      'Stay updated with Laravel framework updates and best practices.',
      'Develop and maintain mobile applications using React Native.'
    ]
  },
  {
    company: 'E-Law Solutions',
    location: 'Pasig City',
    role: 'Ruby on Rails Developer',
    period: 'Apr 2016 — Apr 2017',
    bullets: [
      'Develop, test, and maintain Ruby on Rails applications.',
      'Collaborate with cross-functional teams to define, design, and ship new features.',
      'Ensure code quality, performance, and responsiveness of applications.'
    ]
  }
]
