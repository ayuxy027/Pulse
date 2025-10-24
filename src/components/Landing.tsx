const LandingPage = () => {
  return (
    <div className="h-full w-full bg-[#f8f6f1] overflow-hidden">
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900 leading-tight max-w-3xl">
            <img
              src="https://i.postimg.cc/T3qqmkbv/begin.png"
              alt="begin icon"
              className="w-6 h-6 md:w-8 md:h-8 absolute -top-1 -left-5 md:-top-2 md:-left-6"
            />
            Eat smart. Live
            <img
              src="https://i.postimg.cc/PxcrR416/star.png"
              className="absolute -right-5 -top-1 w-6 h-6 md:-right-6 md:-top-2 md:w-8 md:h-8"
              alt="star icon"
            />
            <br />
            healthier
          </h1>
        </div>

        {/* Subtext */}
        <p className="mt-2 text-gray-600 text-base max-w-2xl">
          Transform your health journey with AI-powered nutrition insights,{" "}
          <span className="hidden sm:inline"><br /></span>
          personalized diet plans, and smart food scanning.
        </p>

        {/* CTA Button */}
        <button className="mt-4 px-6 py-3 md:px-8 md:py-4 bg-black text-white font-semibold text-base rounded-xl md:rounded-2xl hover:opacity-90 transition">
          Start Your Journey
        </button>
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