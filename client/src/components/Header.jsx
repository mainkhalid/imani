import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshakeIcon, MenuIcon, XIcon } from 'lucide-react'
export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <HeartHandshakeIcon className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">
              Imani Foundation
            </span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-orange-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/#about"
              className="text-gray-700 hover:text-orange-600 font-medium"
            >
              About Us
            </Link>
            <Link
              to="/#programs"
              className="text-gray-700 hover:text-orange-600 font-medium"
            >
              Our Programs
            </Link>
            <Link
              to="/#donate"
              className="text-gray-700 hover:text-orange-600 font-medium"
            >
              Donate
            </Link>
            <Link
              to="/#contact"
              className="text-gray-700 hover:text-orange-600 font-medium"
            >
              Contact
            </Link>
            <Link
              to="/admin"
              className="text-gray-700 hover:text-orange-600 font-medium"
            >
              Admin
            </Link>
          </nav>
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3 pb-3">
            <Link
              to="/"
              className="block text-gray-700 hover:text-orange-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/#about"
              className="block text-gray-700 hover:text-orange-600 font-medium"
            >
              About Us
            </Link>
            <Link
              to="/#programs"
              className="block text-gray-700 hover:text-orange-600 font-medium"
            >
              Our Programs
            </Link>
            <Link
              to="/#donate"
              className="block text-gray-700 hover:text-orange-600 font-medium"
            >
              Donate
            </Link>
            <Link
              to="/#contact"
              className="block text-gray-700 hover:text-orange-600 font-medium"
            >
              Contact
            </Link>
            <Link
              to="/admin"
              className="block text-gray-700 hover:text-orange-600 font-medium"
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
