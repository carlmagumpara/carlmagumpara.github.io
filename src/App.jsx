import { useEffect, useState } from 'react'
import {
  SiBootstrap,
  SiFirebase,
  SiGit,
  SiJavascript,
  SiLaravel,
  SiMysql,
  SiNginx,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiRedux,
  SiRubyonrails,
  SiSwagger,
  SiTailwindcss,
} from 'react-icons/si'
import heroImg from './assets/avatar.jpg'

const resume = {
  name: 'Carl Anthony Magumpara',
  username: 'CARLMAGUMPARA',
  title: 'Software Engineer',
  location: 'Gumaca, Quezon',
  phone: '(+63) 950-780-3663',
  email: 'magumparacarlanthony@gmail.com',
  github: 'https://github.com/carlmagumpara',
  skills: [
    'Frontend/Backend Development',
    'Mobile Development (Cross Platform)',
    'API Integration',
    'Testing/Debugging',
    'Database Management',
    'Git Version Control',
  ],
  tech: [
    'Laravel (PHP)',
    'JavaScript (ES6)',
    'Node.js',
    'NGINX',
    'React JS',
    'Redux',
    'React Native',
    'Python',
    'Ruby on Rails',
    'MySQL',
    'Firebase',
    'Bootstrap',
    'Tailwind',
    'RESTful APIs',
    'Git',
  ],
  experience: [
    {
      company: 'LexMeet Inc',
      location: 'Pasig City',
      role: 'Fullstack Developer',
      period: 'Apr 2017 — Present',
      bullets: [
        'Develop full-stack web applications using Laravel for backend and frontend technologies like React.',
        'Design and implement RESTful APIs, database schemas, and user interfaces.',
        'Stay updated with Laravel framework updates and best practices.',
        'Develop and maintain mobile applications using React Native.',
      ],
    },
    {
      company: 'E-Law Solutions',
      location: 'Pasig City',
      role: 'Ruby on Rails Developer',
      period: 'Apr 2016 — Apr 2017',
      bullets: [
        'Develop, test, and maintain Ruby on Rails applications.',
        'Collaborate with cross-functional teams to define, design, and ship new features.',
        'Ensure code quality, performance, and responsiveness of applications.',
      ],
    },
  ],
}

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Skills', href: '#skills' },
  { label: 'Technology', href: '#technology' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

const stats = [
  { value: '9+ yrs', label: 'Professional experience' },
  { value: 'Web + Mobile', label: 'Full-stack delivery' },
  { value: 'Laravel • React', label: 'Primary stack' },
]

const skillCards = [
  {
    title: 'Frontend/Backend Development',
    desc: 'Build and maintain production web apps with clean UI, solid backend structure, and reliable data flow.',
  },
  {
    title: 'Mobile Development (Cross Platform)',
    desc: 'Ship mobile experiences with React Native, focusing on maintainability and performance.',
  },
  {
    title: 'API Integration',
    desc: 'Design and integrate RESTful APIs to connect services, clients, and external systems.',
  },
  {
    title: 'Testing/Debugging',
    desc: 'Identify issues quickly and keep releases stable with practical testing and systematic debugging.',
  },
  {
    title: 'Database Management',
    desc: 'Model, query, and maintain databases with attention to performance and data integrity.',
  },
  {
    title: 'Git Version Control',
    desc: 'Work effectively in teams with clean branching, reviews, and disciplined change management.',
  },
]

const techLogoMeta = {
  'Laravel (PHP)': { Icon: SiLaravel, color: '#FF2D20' },
  'JavaScript (ES6)': { Icon: SiJavascript, color: '#F7DF1E' },
  'Node.js': { Icon: SiNodedotjs, color: '#339933' },
  NGINX: { Icon: SiNginx, color: '#009639' },
  'React JS': { Icon: SiReact, color: '#61DAFB' },
  Redux: { Icon: SiRedux, color: '#764ABC' },
  'React Native': { Icon: SiReact, color: '#61DAFB' },
  Python: { Icon: SiPython, color: '#3776AB' },
  'Ruby on Rails': { Icon: SiRubyonrails, color: '#CC0000' },
  MySQL: { Icon: SiMysql, color: '#4479A1' },
  Firebase: { Icon: SiFirebase, color: '#FFCA28' },
  Bootstrap: { Icon: SiBootstrap, color: '#7952B3' },
  Tailwind: { Icon: SiTailwindcss, color: '#06B6D4' },
  'RESTful APIs': { Icon: SiSwagger, color: '#85EA2D' },
  Git: { Icon: SiGit, color: '#F05032' },
}

function getTechAcronym(label) {
  return label
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

function TechLogo({ label, className }) {
  const meta = techLogoMeta[label]
  const IconComp = meta?.Icon
  const color = meta?.color ?? '#94A3B8'

  return (
    <span
      className={`glass-tile grid h-10 w-10 place-items-center rounded-xl ${className ?? ''}`}
      style={{ color }}
      aria-hidden="true"
    >
      {IconComp ? (
        <IconComp className="h-5 w-5" />
      ) : (
        <span className="text-[10px] font-extrabold tracking-widest">{getTechAcronym(label)}</span>
      )}
    </span>
  )
}

function Icon({ name, className }) {
  // Minimal inline icons (no external deps)
  const cls = className ?? 'h-4 w-4'

  if (name === 'spark') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2l1.2 5.1L18 9l-4.8 1.9L12 16l-1.2-5.1L6 9l4.8-1.9L12 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M19 13l.7 3 2.3.9-2.3.9-.7 3-.7-3-2.3-.9 2.3-.9.7-3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (name === 'pin') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s7-5 7-11a7 7 0 10-14 0c0 6 7 11 7 11z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 10.5a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    )
  }
  if (name === 'menu') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (name === 'close') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6l-12 12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (name === 'sun') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 17a5 5 0 100-10 5 5 0 000 10z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (name === 'moon') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 13.2A7.8 7.8 0 1110.8 3a6.2 6.2 0 0010.2 10.2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 12h10M12 7v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      return stored === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileNavOpen])

  useEffect(() => {
    document.documentElement.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [mobileNavOpen])

  return (
    <div className="bg-geo min-h-dvh text-slate-900 dark:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-900/10 bg-white/40 dark:border-white/10 dark:bg-white/5 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-400 text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.18)]">
              <Icon name="spark" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">{resume.username}</span>
            </span>
          </a>

          <nav className="hidden items-center md:flex" aria-label="Primary">
            <div className="flex flex-wrap items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={
                    item.href === '#home'
                      ? 'text-xs font-semibold text-slate-900 underline decoration-slate-900/20 underline-offset-[10px] dark:text-white dark:decoration-white/30'
                      : 'text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline hover:decoration-slate-900/20 hover:underline-offset-[10px] dark:text-slate-300 dark:hover:text-white dark:hover:decoration-white/20 dark:hover:underline-offset-[10px]'
                  }
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              className="btn-secondary px-3 py-2"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <a href="#contact" className="btn-secondary px-3 py-2 text-xs" onClick={() => setMobileNavOpen(false)}>
              Contact
            </a>
            <button
              type="button"
              className="btn-secondary px-3 py-2"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="btn-secondary px-3 py-2"
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <Icon name={mobileNavOpen ? 'close' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-slate-950/20 dark:bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-xs rounded-l-3xl border-l border-slate-900/10 bg-white/45 dark:border-white/10 dark:bg-white/5 p-4 backdrop-blur-2xl backdrop-saturate-150 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold tracking-widest text-slate-600 dark:text-slate-400">NAVIGATION</div>
                <button
                  type="button"
                  className="rounded-xl border border-slate-900/10 bg-white/40 dark:border-white/10 dark:bg-white/5 p-2 text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:focus-visible:ring-white/30"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon name="close" className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              <nav id="mobile-nav" className="mt-4" aria-label="Primary">
                <ul className="grid gap-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={
                          item.href === '#home'
                            ? 'flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white'
                            : 'flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
                        }
                      >
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={
                              item.href === '#home'
                                ? 'h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white'
                                : 'h-1.5 w-1.5 rounded-full bg-slate-900/30 dark:bg-white/30'
                            }
                          />
                          {item.label}
                        </span>
                        <span className="text-slate-500 dark:text-slate-500">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="home" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="pill">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                {resume.title.toUpperCase()}
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Build web & mobile products with{' '}
                <span className="bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  clean, maintainable code
                </span>
                .
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
                Full-stack engineer experienced with Laravel, React, and React Native—focused on
                reliable APIs, strong data models, and user-friendly interfaces.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map((s) => (
                  <div key={s.label} className="card px-4 py-3">
                    <div className="text-lg font-semibold text-slate-900 dark:text-white">{s.value}</div>
                    <div className="mt-1 text-xs tracking-wide text-slate-600 dark:text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#experience" className="btn-primary">
                  View experience
                </a>
                <a href="#contact" className="btn-secondary">
                  Contact
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/40 to-white/0 p-[1px]">
                <div className="card rounded-3xl p-4">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/40 to-white/5 dark:from-slate-900 dark:to-slate-950">
                    <img
                      src={heroImg}
                      alt={`${resume.name} profile`}
                      className="h-[360px] w-full object-contain p-6"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(600px_220px_at_50%_10%,rgba(56,189,248,0.18),transparent_60%)]" />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{resume.title}</div>
                    <div className="pill">
                      <Icon name="pin" />
                      {resume.location}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Email:</span> {resume.email}
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Phone:</span> {resume.phone}
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">GitHub:</span>{' '}
                      <a
                        className="text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
                        href={resume.github}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {resume.github.replace('https://', '')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-slate-900/10 dark:border-white/10" />
        </section>

        <section id="skills" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-300" />
            SKILLS
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            What I work on
          </h2>
          <p className="mt-4 max-w-2xl text-slate-700 dark:text-slate-300">
            Core strengths based on real production experience across web, APIs, and mobile.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {skillCards.map((s) => (
              <div key={s.title} className="card p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-sky-300">
                    <Icon name="spark" />
                  </span>
                  {s.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="technology" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-300" />
            TECHNOLOGY
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Languages & frameworks
          </h2>
          <p className="mt-4 max-w-2xl text-slate-700 dark:text-slate-300">
            Tools I’ve used across backend, frontend, mobile, and database work.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {resume.tech.map((t) => (
              <div key={t} className="card flex items-center gap-3 px-4 py-4" title={t}>
                <TechLogo label={t} className="shrink-0" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{t}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <div className="card rounded-3xl p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_20%_20%,rgba(56,189,248,0.18),transparent_60%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_380px_at_90%_30%,rgba(99,102,241,0.18),transparent_60%)]" />
              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <div className="pill">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                    OPEN FOR WORK
                  </div>
                  <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Looking for a reliable engineer?
                  </div>
                  <p className="mt-2 max-w-xl text-sm text-slate-700 dark:text-slate-300">
                    I build and maintain full-stack systems—web, APIs, and mobile—focused on quality
                    and long-term maintainability.
                  </p>
                </div>
                <a href="#contact" className="btn-primary">
                  Get in touch
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-300" />
            EXPERIENCE
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Work history
          </h2>
          <p className="mt-4 max-w-2xl text-slate-700 dark:text-slate-300">
            Roles and responsibilities from production teams.
          </p>

          <div className="mt-8 grid gap-4">
            {resume.experience.map((job) => (
              <div key={`${job.company}-${job.period}`} className="card p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {job.company}, {job.location}
                    <span className="text-slate-600 dark:text-slate-300"> — {job.role}</span>
                  </div>
                  <div className="text-xs tracking-wide text-slate-600 dark:text-slate-400">{job.period}</div>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>


        <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-300" />
            CONTACT
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Let’s connect
          </h2>
          <p className="mt-4 max-w-2xl text-slate-700 dark:text-slate-300">
            Email me directly or send a message here.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-1">
              <div className="text-xs font-semibold tracking-widest text-slate-600 dark:text-slate-400">DIRECT</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>
                  <span className="text-slate-600 dark:text-slate-400">Email:</span> {resume.email}
                </li>
                <li>
                  <span className="text-slate-600 dark:text-slate-400">Phone:</span> {resume.phone}
                </li>
                <li>
                  <span className="text-slate-600 dark:text-slate-400">Location:</span> {resume.location}
                </li>
                <li>
                  <span className="text-slate-600 dark:text-slate-400">GitHub:</span>{' '}
                  <a
                    className="text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
                    href={resume.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {resume.github.replace('https://', '')}
                  </a>
                </li>
              </ul>
            </div>

            <div className="card p-6 sm:p-8 lg:col-span-2">
              <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-slate-700 dark:text-slate-300">
                      NAME
                    </label>
                    <input className="input mt-2" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-slate-700 dark:text-slate-300">
                      EMAIL
                    </label>
                    <input className="input mt-2" placeholder="you@company.com" type="email" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-widest text-slate-700 dark:text-slate-300">
                    MESSAGE
                  </label>
                  <textarea
                    className="input mt-2 min-h-[140px] resize-y"
                    placeholder="Tell me about your project…"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Available for full-stack web, API, and mobile development.
                  </div>
                  <button className="btn-primary" type="submit">
                    Send message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-900/10 dark:border-white/10">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{resume.name}</div>
              <div className="mt-1 text-xs tracking-wide text-slate-600 dark:text-slate-400">{resume.title}</div>
              <p className="mt-4 max-w-md text-sm text-slate-700 dark:text-slate-300">
                Full-stack software engineer focused on building reliable web, API, and mobile
                solutions.
              </p>
            </div>

            <div className="lg:col-span-3">
              <div className="text-xs font-semibold tracking-widest text-slate-600 dark:text-slate-400">NAVIGATION</div>
              <ul className="mt-3 space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" href={item.href}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <div className="text-xs font-semibold tracking-widest text-slate-600 dark:text-slate-400">CONTACT</div>
              <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                <li>{resume.email}</li>
                <li>{resume.phone}</li>
                <li>{resume.location}</li>
                <li>
                  <a
                    className="text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
                    href={resume.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {resume.github.replace('https://', '')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900/10 py-6 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-500">
            © {new Date().getFullYear()} {resume.name}. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
