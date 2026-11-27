import config from '../../config.json'
import { Eyebrow } from '../../components/Card'
import { ContactForm } from '../../components/ContactForm'
import { CopyEmail } from '../../components/CopyEmail'
import { SectionPage } from '../../components/SectionPage'
import { FaDiscord, FaFacebookF, FaGithub, FaLinkedin, FaPhone } from 'react-icons/fa'

const { profile } = config

export { Page }

function Page() {
  return (
    <SectionPage
      eyebrow="Contact"
      title="Get in touch"
      description="Have a project in mind or just want to say hi? Send a message and I'll get back to you."
    >
      <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
        <ContactForm />
        <aside className="md:border-base-200 md:border-l md:pl-8">
          <Eyebrow>Direct lines</Eyebrow>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <CopyEmail email={profile.email} />
            </li>
            <li className="text-muted flex items-center gap-2">
              <FaPhone /> {profile.phone}
            </li>
          </ul>
          <div className="mt-6">
            <Eyebrow>Elsewhere</Eyebrow>
            <ul className="flex justify-start gap-4 text-xl">
              <li className="transition-all ease-in-out hover:scale-110 hover:text-brand-start">
                <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <FaGithub />
                </a>
              </li>
              <li className="transition-all ease-in-out hover:scale-110 hover:text-brand-start">
                <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
              </li>
              <li className="transition-all ease-in-out hover:scale-110 hover:text-brand-start">
                <a href={profile.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <FaFacebookF />
                </a>
              </li>
              <li className="transition-all ease-in-out hover:scale-110 hover:text-brand-start">
                <a href={profile.discord} target="_blank" rel="noreferrer" aria-label="Discord">
                  <FaDiscord />
                </a>
              </li>
            </ul>
          </div>
          <p className="text-muted mt-6 text-sm">
            Prefer email? Reach me directly at{' '}
            <a href={`mailto:${profile.email}`} className="link-brand font-semibold">
              {profile.email}
            </a>
            .
          </p>
        </aside>
      </div>
    </SectionPage>
  )
}
