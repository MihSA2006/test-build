import React from 'react'
import Logo from '../components/text/Logo'
import Login from '../components/forms/Login'
import BackBtn from '../components/buttons/BackBtn'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const LoginPage = () => {
  useGSAP(()=>{
    gsap.from(".logo",{
      opacity: 0,
      y: "-100",
      duration: 1,
      ease: "power1.in"
    })
    gsap.from(".bottom-img",{
      y: "200",
      duration: 1,
      ease: "power4.InOut",
      delay: 0.2,
    })
  })
  return (
    <>
        <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#0E252D] to-[#4B6D7F]">
            <BackBtn/>
            <div className="logo ml-6 mt-10 2xl:mt-20">
                <Logo/>
            </div>
              <Login/>
            <div className="bottom-img absolute bottom-0 w-full h-[80%]">
                <img src="/images/sign-in.png" alt="" className='h-full w-full'/>
            </div>
        </div>
    </>
  )
}

export default LoginPage