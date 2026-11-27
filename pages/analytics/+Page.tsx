import { AnalyticsDashboard } from '../../components/AnalyticsDashboard'
import { SectionPage } from '../../components/SectionPage'

export { Page }

function Page() {
  return (
    <SectionPage
      eyebrow="Dashboard"
      title="Site analytics"
      description="A transparent look at how this portfolio gets used: views over time, popular pages, and where visitors click most."
    >
      <AnalyticsDashboard />
    </SectionPage>
  )
}
