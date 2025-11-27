import { Train } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-in fade-in duration-700">
          <Train className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-in slide-in-from-bottom duration-700">
          VIT Cab Share
        </h1>
        
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8 animate-in slide-in-from-bottom duration-700 delay-150">
          Share cabs with fellow VITians traveling to Katpadi Junction. 
          <br className="hidden sm:block" />
          Save money, travel together, never miss your train!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom duration-700 delay-300">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-white border border-white/20">
            <div className="text-sm opacity-80">From</div>
            <div className="font-semibold">VIT Vellore</div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-0.5 bg-white/40 hidden sm:block"></div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-white border border-white/20">
            <div className="text-sm opacity-80">To</div>
            <div className="font-semibold">Katpadi Junction</div>
          </div>
        </div>
      </div>
    </section>
  );
};
