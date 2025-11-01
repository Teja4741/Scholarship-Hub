import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-education.jpg';

const Hero = () => {
  const scrollToScholarships = () => {
    document.getElementById('scholarships')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Students celebrating graduation" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <GraduationCap className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Empowering Dreams Through
          <span className="block mt-2 text-accent">Education Scholarships</span>
        </h1>
        
        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
          Government scholarship programs supporting students across Medical, Engineering, 
          Degree, Diploma, and ITI courses. Your future starts here.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={scrollToScholarships}
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Explore Scholarships
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 transition-all duration-300"
          >
            Check Eligibility
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50K+</div>
            <div className="text-white/80 text-sm">Students Benefited</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">₹500Cr</div>
            <div className="text-white/80 text-sm">Scholarships Awarded</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">15+</div>
            <div className="text-white/80 text-sm">Programs Available</div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
