import { experience } from '../../data/experience'
import { SectionPage } from '../../components/SectionPage'

export { Page }

function Page() {
  return (
    <SectionPage
      eyebrow="Resume"
      title="Work Experience"
      description="A brief history of the teams and roles I've worked with."
    >
      <ul className="flex flex-col gap-8">
        {experience.map((job) => (
          <li key={job.company} className="flex gap-4">
            <div
              aria-hidden="true"
              className="brand-gradient flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            >
              {job.company
                .split(' ')
                .slice(0, 2)
                .map((word) => word[0])
                .join('')}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <h2 className="text-base font-semibold">{job.role}</h2>
                <span className="text-faint text-xs">{job.period}</span>
              </div>
              <p className="text-muted text-sm">
                {job.company} · {job.location}
              </p>
              <ul className="text-muted mt-2 list-disc space-y-1 pl-5 text-sm">
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </SectionPage>
  )
}
