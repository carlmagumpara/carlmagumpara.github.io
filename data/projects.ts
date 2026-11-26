export type Project = {
  name: string
  description: string
  href: string
  tags: string[]
}

// Add real projects here and they'll render on the /projects page automatically.
export const projects: Project[] = [
  {
    name: 'LexMeet Website',
    description: 'The official LexMeet web platform.',
    href: 'https://lexmeet.com',
    tags: ['Website', 'Web']
  },
  {
    name: 'LexMeet for Android',
    description: "LexMeet's Android app on Google Play.",
    href: 'https://play.google.com/store/apps/details?id=com.lexmeet&hl=en',
    tags: ['Android', 'Google Play']
  },
  {
    name: 'LexMeet for iOS',
    description: 'LexMeet: Legal Help Simplified on the App Store.',
    href: 'https://apps.apple.com/ph/app/lexmeet-legal-help-simplified/id1451815948',
    tags: ['iOS', 'App Store']
  },
  {
    name: 'E-Law Solutions Website',
    description: 'The official E-Law Solutions web platform.',
    href: 'https://www.e-lawsolutions.com',
    tags: ['Website', 'Web']
  }
]
