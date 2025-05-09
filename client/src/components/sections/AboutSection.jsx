import React from 'react'
import { HomeIcon, BookOpenIcon, HeartIcon } from 'lucide-react'

export const AboutSection = () => {
  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            About Imani Foundation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Founded in 2010, we are dedicated to providing a safe and
            nurturing environment for orphaned and vulnerable children.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<HomeIcon className="h-8 w-8 text-orange-600" />}
            title="Safe Shelter"
            description="We provide safe and comfortable homes for children who have lost their parents or come from unsafe environments."
          />
          <FeatureCard 
            icon={<BookOpenIcon className="h-8 w-8 text-orange-600" />}
            title="Quality Education"
            description="Every child deserves an education. We ensure all children under our care receive quality schooling and mentorship."
          />
          <FeatureCard 
            icon={<HeartIcon className="h-8 w-8 text-orange-600" />}
            title="Healthcare"
            description="We provide regular medical check-ups, immunizations, and treatment to ensure our children stay healthy."
          />
        </div>
      </div>
    </section>
  )
}

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="bg-orange-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}