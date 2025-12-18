import { AiOutlineArrowRight } from "react-icons/ai";
import React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Logo from "../text/Logo";


const HomeComponent = () => {
  useGSAP(() => {
    gsap.from(".hero-text", {
      duration: 2,
      ease: "power1.inOut",
      x: "300",
    });
    gsap.from(".cloud1", {
      duration: 2,
      ease: "power1.inOut",
      height: "120vh",
      width: "100vw",
    });
    gsap.from(".cloud2", {
      duration: 2,
      ease: "power1.inOut",
      height: "50%",
      width: "50%",
    });
    gsap.from(".get-started-btn", {
      duration: 2,
      ease: "power1.inOut",
      y: "100",
    });
    gsap.to(".blur-anim", {
      duration: 2,
      opacity: 0
    });
  });
  return (
    <>
      <div className="hero-text absolute left-20 top-1/3 -translate-y-1/3 md:w-1/2 text-neutral-200">
        <div className="relative p-2 w-full h-full">
          <Logo />
          <p className="text-lg" style={{ lineHeight: 2 }}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Repellendus libero impedit doloribus saepe voluptatum, vel animi,
            perferendis quo aut vero nisi id! Rerum, quis aperiam. Adipisci quia
            dolor distinctio id?
          </p>
          <div className="blur-anim absolute top-0 left-0 w-full h-full backdrop-blur-sm z-20"></div>
        </div>
        <div className="mt-4 get-started-btn">
          <button className="group px-10 text-2xl bg-neutral-200/20 py-1 border-2 border-neutral-200 
  rounded-lg uppercase flex items-center gap-6 font-semibold cursor-pointer
  transition-all duration-300 ease-out
  hover:-translate-y-1 hover:shadow-lg hover:bg-neutral-200/30">
            <span className="font-beba">get started</span>
            <AiOutlineArrowRight
              className="font-semibold transition-transform duration-300 group-hover:translate-x-2"
              fontWeight={23}
            />
          </button>

        </div>
      </div>
      <div className="cloud1 absolute w-[80%] bottom-0 right-0 h-[90%]">
        <img src="/images/cloud1.png" alt="" className="h-full w-full" />
      </div>
      <div className="cloud2 absolute bottom-0 left-0 h-40 ">
        <img src="/images/cloud2.png" alt="" className="h-full w-full" />
      </div>
    </>
  );
};

export default HomeComponent;
