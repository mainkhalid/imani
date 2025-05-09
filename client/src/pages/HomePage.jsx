import React from 'react'
import { HeroSection } from '../components/sections/HeroSection'
import { AboutSection } from '../components/sections/AboutSection'
import { ImpactSection } from '../components/sections/ImpactSection'
import { DonationForm } from '../components/sections/DonationForm'


export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ImpactSection />
      <DonationForm />
      </>
  )
}