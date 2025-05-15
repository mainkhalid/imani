import React from 'react'
import {
  HeartHandshakeIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
} from 'lucide-react'
export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" id="contact">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HeartHandshakeIcon className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">
                Imani Foundation
              </span>
            </div>
            <p className="text-gray-300">
              Dedicated to improving the lives of children in need through
              education, healthcare, and community support.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-orange-500" />
                <span>+254 712 345 678</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="h-5 w-5 text-orange-500" />
                <span>info@imanifoundation.org</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-orange-500 mt-1" />
                <span>123 Charity Lane, Nairobi, Kenya</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-orange-500">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-orange-500">
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-orange-500">
                <InstagramIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Imani Foundation. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
