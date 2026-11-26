import { Badges, Card, Eyebrow, GroupLabel } from '../../components/Card'
import { CopyEmail } from '../../components/CopyEmail'
import { FacebookIcon, GithubIcon, LinkedinIcon, PhoneIcon, PinIcon } from '../../components/Icons'
import { LastPlayedBanner } from '../../components/LastPlayedBanner'

export { Page }

const profile = {
  name: 'Carl Anthony Magumpara',
  title: 'Software Engineer',
  bio: 'Full-stack engineer experienced with Laravel, React, and React Native—focused on reliable APIs, strong data models, and user-friendly interfaces.',
  location: 'Gumaca, Quezon',
  email: 'magumparacarlanthony@gmail.com',
  phone: '(+63) 950-780-3663',
  github: 'https://github.com/carlmagumpara',
  linkedin: 'https://www.linkedin.com/in/carlmagumpara',
  facebook: 'https://www.facebook.com/im.crlm'
}

const technology = [
  {
    title: 'Languages',
    items: ['JavaScript', 'Python', 'PHP', 'Ruby', 'HTML', 'CSS']
  },
  {
    title: 'Frontend Development',
    items: ['React JS', 'Redux', 'Bootstrap', 'Tailwind CSS', 'Vite JS', 'SASS']
  },
  {
    title: 'Backend Development',
    items: ['Laravel', 'Node JS', 'Ruby on Rails', 'RESTful APIs']
  },
  {
    title: 'Mobile Development',
    items: ['React Native', 'Xcode', 'Android Studio']
  },
  {
    title: 'Databases & Storage',
    items: ['MySQL', 'Redis', 'Firebase']
  },
  {
    title: 'DevOps & Deployment',
    items: ['Docker', 'NGINX', 'Ubuntu', 'Vercel', 'Render']
  },
  {
    title: 'Version Control & Project Management',
    items: ['Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira']
  },
  {
    title: 'Development Tools & AI',
    items: [
      'Visual Studio Code',
      'Roo Code',
      'OpenCode',
      'ChatGPT',
      'Gemini'
    ]
  }
];

function Page() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 md:px-0">
      
      <main className="flex grow flex-col">
        <div className="grid w-full grid-cols-1 items-start gap-4 py-8 lg:grid-cols-3">
          <div className="contents lg:col-span-2 lg:flex lg:flex-col lg:gap-4">
            <Card className="order-1">
              <div className="flow-root">
                <div className="mx-auto mb-4 w-60 sm:float-right sm:mb-2 sm:ml-6 sm:w-44 sm:[shape-margin:1rem] sm:[shape-outside:circle(50%)]">
                  <img
                    src="/avatar.jpg"
                    alt={`${profile.name} avatar`}
                    width={500}
                    height={500}
                    className="brand-gradient h-auto w-full rounded-full p-2 object-cover"
                  />
                </div>

                <p className="label-eyebrow text-faint text-xs">{profile.title}</p>
                <h1 className="mt-1 text-center text-4xl sm:text-left md:text-3xl">
                  Hi, I&apos;m <span className="brand-text font-bold">Carl</span>
                </h1>

                <div className="text-muted mt-3 space-y-3 text-sm">
                  <p>{profile.bio}</p>
                  <p className="flex items-center gap-1.5">
                    <PinIcon /> {profile.location}
                  </p>
                </div>

              </div>
            </Card>

            <div className="order-3 grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-4">
                <Card>
                  <Eyebrow>Get in touch</Eyebrow>
                  <ul className="flex flex-col gap-2 text-sm">
                    <li>
                      <CopyEmail email={profile.email} />
                    </li>
                    <li className="text-muted flex items-center gap-2">
                      <PhoneIcon /> {profile.phone}
                    </li>
                  </ul>
                  <ul className="mt-4 flex justify-center gap-4 text-2xl">
                    <li className="transition-all ease-in-out hover:scale-110 hover:text-brand-start">
                      <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                        <GithubIcon />
                      </a>
                    </li>
                    <li className="transition-all ease-in-out hover:scale-110 hover:text-brand-start">
                      <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                        <LinkedinIcon />
                      </a>
                    </li>
                    <li className="transition-all ease-in-out hover:scale-110 hover:text-brand-start">
                      <a href={profile.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                        <FacebookIcon />
                      </a>
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="flex flex-col gap-4">
                <Card>
                  <Eyebrow>Currently</Eyebrow>
                  <p className="text-muted text-sm font-medium">Available for freelance &amp; projects</p>
                  <p className="text-muted mt-2 text-sm">
                    I build and maintain full-stack systems—web, APIs, and mobile—focused on quality and long-term
                    maintainability.
                  </p>
                  <a href={`mailto:${profile.email}`} className="link-brand mt-3 text-sm font-semibold">
                    Get in touch →
                  </a>
                </Card>
              </div>

              <Card className="sm:col-span-2">
                <Eyebrow>GitHub</Eyebrow>
                <p className="text-sm font-medium">Contributions</p>
                <p className="text-muted mt-1 text-sm">Recent activity from my GitHub profile.</p>
                <div className="mt-3 overflow-x-auto">
                  <img
                    src="https://ghchart.rshah.org/39d353/carlmagumpara"
                    alt={`${profile.name} GitHub contributions chart`}
                    className="max-w-none"
                    loading="lazy"
                  />
                </div>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="link-brand mt-3 text-sm font-semibold"
                >
                  View profile →
                </a>
              </Card>

              <LastPlayedBanner />
            </div>
          </div>

          <div className="contents lg:flex lg:flex-col lg:gap-4">
            <Card className="order-2" id="technology">
              <Eyebrow>Stack &amp; Tools</Eyebrow>
              <p className="text-muted mb-4 text-xs">32+ tools used across backend, frontend, mobile, and database work.</p>
              <div className="flex flex-col gap-4">
                {technology.map((group) => (
                  <div key={group.title}>
                    <GroupLabel>{group.title}</GroupLabel>
                    <Badges items={group.items} />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="order-4">
              <p className="text-muted text-center text-sm">
                © {new Date().getFullYear()} {profile.name}. All rights reserved.
              </p>
            </Card>
          </div>
        </div>

      </main>
    </div>
  )
}
