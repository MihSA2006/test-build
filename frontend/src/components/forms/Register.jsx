import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import React, { useState } from "react";
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const Register = () => {
  useGSAP(() => {
    gsap.from(".form", {
      x: "200",
      duration: 1,
      ease: "power1.out",
    })
  })
  return (
    <>
      <div className="form absolute w-[45%] z-10 right-16 top-1/2 -translate-y-1/2 px-12 py-[60px] bg-neutral-200/5 text-neutral-200 backdrop-blur-xs border-2 border-neutral-200 rounded-2xl">
        <span className="text-7xl font-beba uppercase font-semibold">
          sign up
        </span>
        <form action="" className="flex flex-col mt-4 mx-10">
          <div className="flex gap-2">
            <div className="flex flex-col flex-1">
              <label htmlFor="email" className="mt-3 text-xl">
                Nom
              </label>
              <input
                placeholder='Ex: Dupont'
                type="text"
                className="px-2 py-3 mt-[3px] border-b-2 border-neutral-200 focus:border-neutral-200 focus:border-b-2 text-black rounded-[4px] "
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="email" className="mt-3 text-xl flex-1">
                Prénom
              </label>
              <input
                placeholder='Ex: Jean'
                type="text"
                className="px-2 py-3 mt-[3px] border-b-2 border-neutral-200 focus:border-neutral-200 focus:border-b-2 text-black rounded-[4px]"
              />
            </div>
          </div>
          <label htmlFor="email" className="mt-3 text-xl">
            Email
          </label>
          <input
            placeholder='Ex: email@gmail.com'
            type="text"
            className="px-2 py-3 mt-[3px] border-b-2 border-neutral-200 focus:border-neutral-200 focus:border-b-2 text-black rounded-[4px]"
          />
          <label htmlFor="password" className="mt-3 text-xl">
            Mot de passe
          </label>
          <input
            placeholder="********"
            className="px-2 py-3 mt-[3px] border-b-2 border-neutral-200 focus:border-neutral-200 focus:border-b-2 text-black rounded-[4px]"
          />
          <span className="text-center my-4">Ou</span>
          <div className="">
            <button className="w-full px-4 py-2 flex justify-center items-center gap-4 
  bg-neutral-200 rounded-lg
  transition-all duration-300 ease-out
  hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02]">
              <FcGoogle size={20} />
              <span className="text-neutral-700 font-semibold">
                S'inscrire avec google
              </span>
            </button>

            <button className="mt-5 w-full px-4 py-2 flex justify-center items-center gap-4 
  bg-gradient-to-r from-[#70b7cf] to-70% to-[#1d4e5e] rounded-lg font-semibold
  transition-all duration-300 ease-out
  hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02]">
              S'inscrire
            </button>

          </div>
          <span className="text-center mt-10">
            Vous avez déjà un compte?
            <Link to="/sign-in" className="text-blue-600"> Connectez-vous!</Link>
          </span>
        </form>
      </div>
    </>
  );
};

export default Register;
