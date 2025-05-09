import React from 'react'

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Help Us Make a Difference in Children's Lives
            </h1>
            <p className="text-xl mb-6">
              Imani Foundation provides shelter, education, and care for
              vulnerable children in Kenya.
            </p>
            <a
              href="#donate"
              className="inline-block bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-md shadow-md"
            >
              Donate Now
            </a>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
              alt="Happy children at Imani Foundation"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}