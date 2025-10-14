import React from 'react'
import Hero from '../Components/HomeComponents/Hero'
import Footer from '../Components/HomeComponents/Footer'
import Info from '../Components/HomeComponents/Info'
import ImpactMetrics from '../Components/HomeComponents/ImpactMetrics'

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Single page background: gradient blobs + dotted pattern */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-50">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary blur-3xl opacity-50 rounded-full" />
        <div className="absolute top-150  -right-24 w-96 h-96 bg-secondary blur-3xl opacity-30 rounded-full" />
        <div className="absolute top-300 left-0 w-96 h-96 bg-primary blur-3xl opacity-50 rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary blur-3xl opacity-30 rounded-full" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="dots-home" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#1c8309" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-home)" />
        </svg>
      </div>

      {/* Content sections */}
      <Hero/>
      <ImpactMetrics/>
      {/* <Map/> */}
      <Info/>
      <Footer/>
    </div>
  )
}

export default Home
