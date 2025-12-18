import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Login = () => {
  useGSAP(() => {
    gsap.from(".form", {
      x: "200",
      duration: 1,
      ease: "power1.out",
    })
  })

  // const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="form py-[60px] absolute w-1/2 2xl:w-2/5 z-10 right-16 top-1/2 -translate-y-1/2 px-12  bg-neutral-200/5 text-neutral-200 backdrop-blur-xs border-2 border-neutral-200 rounded-2xl">
        <span className="text-7xl font-beba uppercase font-semibold">
          sign in
        </span>
        <form action="" className='flex flex-col mt-4 mx-10'>
          <label htmlFor="email" className='my-3 text-xl'>Email</label>
          <input type="text" placeholder='Ex: email@gmail.com'             className="px-2 py-3 mt-[3px] border-b-2 border-neutral-200 focus:border-neutral-200 focus:border-b-2 text-black rounded-[4px]" 
 />
          <label htmlFor="password" className='my-3 text-xl'>Mot de passe</label>
          <input type="password" placeholder='********'             className="px-2 py-3 mt-[3px] border-b-2 border-neutral-200 focus:border-neutral-200 focus:border-b-2 text-black rounded-[4px]"
 />
          <div className="flex justify-between items-center my-10">
            <div className="flex gap-2">
              <input type="checkbox" name="rememberMe" id="" className="bg-transparent cursor-pointer border-2 border-neutral-200 rounded-lg" />
              Se souvenir de moi
            </div>
            <span className="cursor-pointer ">Mot de passe oublié?</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-0.5 w-1/3 bg-neutral-200 rounded-full"></div>
            <span>Ou</span>
            <div className="h-0.5 w-1/3 bg-neutral-200 rounded-full"></div>
          </div>
          <div className="my-10">
            <button className="w-full px-4 py-2 flex justify-center items-center gap-4 
  bg-neutral-200 rounded-lg
  transition-all duration-300 ease-out
  hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02]"><FcGoogle size={20} /><span className="text-neutral-700 font-semibold">Se connecter avec google</span></button>
            <button className="mt-5 w-full px-4 py-2 flex justify-center items-center gap-4 
  bg-gradient-to-r from-[#70b7cf] to-70% to-[#1d4e5e] rounded-lg font-semibold
  transition-all duration-300 ease-out
  hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02]">Se connecter</button>

          </div>
          <span className="text-center">Vous n'avez pas encore de compte? <Link to="/sign-up" className="text-blue-600">Inscrivez-vous gratuitement!</Link></span>
        </form>
      </div>
    </>
  )
}

export default Login