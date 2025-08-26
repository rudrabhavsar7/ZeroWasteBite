import React from 'react'
import Hero from '../Components/HomeComponents/Hero'
import Footer from '../Components/HomeComponents/Footer'
import Info from '../Components/HomeComponents/Info'

const Home = () => {
  return (
    <div>
      <Hero/>
      {/* <Map/> */}
      <Info/>
      <Footer/>
    </div>
  )
}

export default Home
