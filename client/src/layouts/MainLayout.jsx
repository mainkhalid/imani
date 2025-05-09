import React from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}