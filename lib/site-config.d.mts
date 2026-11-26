export type SiteConfig = {
  profile: {
    name: string
    firstName: string
    title: string
    bio: string
    email: string
    phone: string
    github: string
    linkedin: string
    facebook: string
    discord: string
  }
  githubUsername: string
  technology: { title: string; items: string[] }[]
  workExperience: {
    company: string
    location: string
    role: string
    period: string
    bullets: string[]
  }[]
  projects: { name: string; description: string; href: string; tags: string[] }[]
}

export const siteConfig: SiteConfig
