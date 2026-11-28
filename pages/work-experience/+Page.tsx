import config from '../../config.json'
import { SectionPage } from '../../components/SectionPage'

const { workExperience } = config

export { Page }

function Page() {
  return (
    <SectionPage
      eyebrow="Resume"
      title="Work Experience"
      description="A brief history of the teams and roles I've worked with."
    >
      <ul className="flex flex-col gap-8">
        {workExperience.map((job) => (
          <li key={job.company}>
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
          </li>
        ))}
      </ul>
    </SectionPage>
  )
}
