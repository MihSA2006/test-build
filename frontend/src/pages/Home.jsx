
import HomeComponent from '../components/hero/HomeComponent';
import Navbar from '../components/navbar/Navbar';

const Home = () => {
  return (
    <>
        <div className="w-screen relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#4B8FA5] to-70% to-[#1D373F]">
            <Navbar/>
            <HomeComponent/>
        </div>
    </>
  )
}

export default Home;
