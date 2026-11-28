import { Badges } from '../../components/Card'
import { ProjectCarousel } from '../../components/ProjectCarousel'
import { SectionPage } from '../../components/SectionPage'
import config from '../../config.json'

const { projects } = config

export { Page }

function Page() {
  return (
    <SectionPage eyebrow="Portfolio" title="Projects" description="Things I've designed, built, and shipped.">
      {projects.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <li key={project.name} className="rounded-xl border border-base-200 p-4">
              <h2 className="text-base font-semibold">
                <a href={project.href} target="_blank" rel="noreferrer" className="link-brand">
                  {project.name} →
                </a>
              </h2>
              <p className="text-muted mt-1 text-sm">{project.description}</p>
              <ProjectCarousel images={project.images} name={project.name} />
              <div className="mt-3">
                <Badges items={project.tags} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm">Projects coming soon — check back shortly.</p>
      )}
    </SectionPage>
  )
}
