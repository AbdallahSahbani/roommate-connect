import { motion } from "framer-motion";
import { User, ShieldCheck, Search, Sparkles, Users } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Create Profile",
    description: "Set up your preferences, lifestyle, and budget to get started.",
    icon: User,
  },
  {
    number: 2,
    title: "Pre-Verification",
    description: "Complete ID, income, and background checks for trust.",
    icon: ShieldCheck,
  },
  {
    number: 3,
    title: "Property Search",
    description: "Browse verified rentals that fit your criteria.",
    icon: Search,
  },
  {
    number: 4,
    title: "AI Matching",
    description: "Our algorithm finds roommates who match your lifestyle.",
    icon: Sparkles,
  },
  {
    number: 5,
    title: "Group Apply",
    description: "Team up and apply to properties with confidence.",
    icon: Users,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const HowItWorksSection = () => {
  const leftSteps = steps.slice(0, 2);
  const rightSteps = steps.slice(2, 4);
  const bottomStep = steps[4];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-primary min-h-[900px]">
      {/* Spline particle animation background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          src="https://my.spline.design/particlesforwebsite-O7wvRpDGjTPGSNAOZLSAKZeC/"
          className="w-full h-full pointer-events-none scale-110"
          frameBorder="0"
          aria-hidden="true"
          title="Decorative particle animation"
        />
      </div>
      
      {/* Full overlay to cover Spline UI completely */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/40 to-primary z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-primary z-[1]" />

      {/* Solid covers for Spline UI elements - corners and edges */}
      <div className="pointer-events-none absolute left-0 bottom-0 z-[2] h-24 w-64 bg-primary" />
      <div className="pointer-events-none absolute left-0 top-0 z-[2] h-20 w-56 bg-primary" />
      <div className="pointer-events-none absolute right-0 bottom-0 z-[2] h-20 w-56 bg-primary" />
      <div className="pointer-events-none absolute right-0 top-0 z-[2] h-20 w-56 bg-primary" />

      {/* OpenAI Animation Video - Bottom Right Corner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-6 right-6 z-[15] w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 overflow-hidden opacity-60 hover:opacity-100 transition-opacity duration-300 rounded-lg"
      >
        <video
          src="/videos/openai-animation.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-[400%] h-[400%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ objectPosition: 'center center' }}
        />
      </motion.div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Center title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="inline-block px-4 py-1.5 border border-primary-foreground/20 text-primary-foreground/80 text-xs font-medium tracking-widest uppercase mb-4 bg-primary/80 backdrop-blur-sm rounded-full">
            Process
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground tracking-tight mb-4 relative z-[3]">
            How It Works
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
            From profile to move-in, we've streamlined every step
          </p>
        </motion.div>

        {/* Steps arranged around animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start mt-16"
        >
          {/* Left column - Steps 1 & 2 */}
          <div className="flex flex-col gap-6 lg:pt-12">
            {leftSteps.map((step) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 8 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-start gap-4 p-5 bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/15 hover:border-primary-foreground/25 transition-all duration-300 backdrop-blur-sm rounded-xl">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-accent flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-lg font-semibold text-accent-foreground">
                          {step.number}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent transition-colors" />
                        <h3 className="text-base font-medium text-primary-foreground tracking-wide">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-primary-foreground/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Center - Empty space for animation visibility */}
          <div className="hidden lg:flex items-center justify-center min-h-[300px]">
            {/* Animation shows through here */}
          </div>

          {/* Right column - Steps 3 & 4 */}
          <div className="flex flex-col gap-6 lg:pt-12">
            {rightSteps.map((step) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: -8 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-start gap-4 p-5 bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/15 hover:border-primary-foreground/25 transition-all duration-300 backdrop-blur-sm rounded-xl">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-accent flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-lg font-semibold text-accent-foreground">
                          {step.number}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent transition-colors" />
                        <h3 className="text-base font-medium text-primary-foreground tracking-wide">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-primary-foreground/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom step - Step 5 centered */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-8 max-w-md mx-auto"
        >
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.03, y: -4 }}
            className="group cursor-pointer"
          >
            <div className="flex items-start gap-4 p-5 bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/15 hover:border-primary-foreground/25 transition-all duration-300 backdrop-blur-sm rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg font-semibold text-accent-foreground">
                    {bottomStep.number}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <bottomStep.icon className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent transition-colors" />
                  <h3 className="text-base font-medium text-primary-foreground tracking-wide">
                    {bottomStep.title}
                  </h3>
                </div>
                <p className="text-sm text-primary-foreground/60 leading-relaxed">
                  {bottomStep.description}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;