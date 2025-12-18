import React from 'react'
import Logo from '../components/text/Logo'
import Register from "../components/forms/Register"
import BackBtn from '../components/buttons/BackBtn'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const RegisterPage = () => {
  useGSAP(()=>{
      gsap.from(".logo",{
        opacity: 0,
        y: "1-00",
        duration: 1,
        ease: "power1.in"
      })
      gsap.from(".bottom-img",{
        y: "200",
        duration: 1,
        ease: "power1.out",
        delay: 0.5,
      })
    })
  return (
    <>
        <div className="relative w-screen h-screen overflow-x-hidden bg-gradient-to-b from-[#0E252D] to-[#1D373F]">
            <BackBtn/>
            <div className="logo absolute top-1/2 left-20 -translate-y-1/2 z-10">
                <Logo/>
            </div>
            <Register/>
            <div className="absolute bottom-0 w-full h-full">
                <img src="/images/sign-up.png" alt="" className='h-full w-full'/>
            </div>
        </div>
    </>
  )
}

export default RegisterPage