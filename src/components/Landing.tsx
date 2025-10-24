import { SiBento, SiRobotframework } from 'react-icons/si';
import { BsGraphUpArrow } from 'react-icons/bs';
import { GiMuscleUp } from 'react-icons/gi';
import Button from './ui/Button';

const LandingPage = () => {
  return (
    <div className="w-full bg-[#f8f6f1] min-h-screen">
      {/* Hero */}

      <section className="w-full bg-[url('./bg.png')] bg-repeat bg-[#f8f6f1] py-6 md:py-8 flex flex-col items-center text-center rounded-t-2xl px-4 p-[30px]">

        {/* Users row */}
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          {/* Avatars */}
          <div className="flex -space-x-2">
            <img
              src="https://randomuser.me/api/portraits/women/65.jpg"
              alt="user1"
              className="w-6 h-6 md:w-8 md:h-8 rounded-full"
            />
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="user2"
              className="w-6 h-6 md:w-8 md:h-8 rounded-full"
            />
            <img
              src="https://randomuser.me/api/portraits/men/35.jpg"
              alt="user2"
              className="w-6 h-6 md:w-8 md:h-8 rounded-full"
            />
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="user3"
              className="w-6 h-6 md:w-8 md:h-8 rounded-full"
            />
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium">
            5000+ Healthy Users
          </p>
        </div>
        {/* Heading */}
        <div className="relative mt-10 md:mt-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900 leading-tight max-w-4xl">
            <img
              src="https://i.postimg.cc/T3qqmkbv/begin.png"
              alt="begin icon"
              className="w-6 h-6 md:w-8 md:h-8 absolute -top-1 -left-5 md:-top-2 md:-left-6"
            />
            Eat smart with AI.
            <img
              src="https://i.postimg.cc/PxcrR416/star.png"
              className="absolute -right-5 -top-1 w-6 h-6 md:-right-6 md:-top-2 md:w-8 md:h-8"
              alt="star icon"
            />
            <br />
            Live Healthier and Immune ready.
          </h1>
        </div>

        {/* Subtext */}
        <p className="mt-2 text-gray-600 text-base max-w-2xl">
          Transform your health journey with AI-powered nutrition insights,{" "}
          <span className="hidden sm:inline"><br /></span>
          personalized diet plans, and smart food scanning.
        </p>

        {/* Additional Benefits */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="text-center p-4">
            <div className="flex justify-center mb-2">
              <SiBento size={24} className="text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Smart Food Scanner</h3>
            <p className="text-gray-600 text-xs">Snap your meal and get instant nutrition analysis with AI-powered insights</p>
          </div>
          <div className="text-center p-4">
            <div className="flex justify-center mb-2">
              <SiRobotframework size={24} className="text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">AI Health Coach</h3>
            <p className="text-gray-600 text-xs">Ask questions like "Can I eat pizza tonight?" and get personalized advice</p>
          </div>
          <div className="text-center p-4">
            <div className="flex justify-center mb-2">
              <BsGraphUpArrow size={24} className="text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Health Dashboard</h3>
            <p className="text-gray-600 text-xs">Track streaks, earn badges, and see your immunity score improve</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          className="mt-4 !w-auto !h-auto px-6 py-3 md:px-8 md:py-4 text-base font-semibold rounded-xl md:rounded-2xl hover:scale-105 transition-all duration-300"
        >
          <GiMuscleUp size={20} className="mr-2" />
          Start Your Journey
        </Button>
      </section>

      {/* <div className="h-60 sm:h-72 md:h-96 bg-[url('./bg.png')] bg-repeat bg-[#f8f6f1] relative flex items-start justify-center px-4">
        <img
          src="https://i.postimg.cc/RhkhNRF3/hola.png"
          alt="Language learning illustration"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 max-h-[90%] sm:max-h-[100%] object-contain w-auto max-w-full"
        />
      </div> */}
      <div className='flex justify-center items-center p-[30px]'>
        <img src="https://i.postimg.cc/RhkhNRF3/hola.png" alt="" />
      </div>
    </div>
  );
};

export default LandingPage;