import React from 'react'
import { AboutSection } from '../../components/sections/AboutSection'
import {ImpactSection} from '../../components/sections/ImpactSection'
import VideoBanner from '../../components/sections/VideoBanner'

export const About = () => {
  return (
    <>
      <AboutSection />
      <VideoBanner />
      <ImpactSection />
    </>
  )
}
