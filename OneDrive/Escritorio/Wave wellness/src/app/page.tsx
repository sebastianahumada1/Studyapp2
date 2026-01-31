import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { ImageCarousel } from '@/components/landing/ImageCarousel'
import { AboutSection } from '@/components/landing/AboutSection'
import { CommunitySection } from '@/components/landing/CommunitySection'
import { ScheduleSection } from '@/components/landing/ScheduleSection'
import { PriceList } from '@/components/landing/PriceList'
import { RulesSection } from '@/components/landing/RulesSection'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { FloatingCTA } from '@/components/landing/FloatingCTA'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background-light overflow-x-hidden pt-24">
      <LandingNavbar />
      <LandingHeader />
      <ImageCarousel />
      <AboutSection />
      <CommunitySection />
      <ScheduleSection />
      <PriceList />
      <RulesSection />
      <LandingFooter />
      <FloatingCTA />
    </main>
  )
}
