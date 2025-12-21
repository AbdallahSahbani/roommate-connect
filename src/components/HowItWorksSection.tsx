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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-primary">
      {/* Spline particle animation background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          src="https://my.spline.design/particlesforwebsite-O7wvRpDGjTPGSNAOZLSAKZeC/"
          className="w-full h-full pointer-events-none"
          frameBorder="0"
          aria-hidden="true"
          title="Decorative particle animation"
        />
      </div>
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-primary/60 z-[1]" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 border border-primary-foreground/20 text-primary-foreground/80 text-xs font-medium tracking-widest uppercase mb-4">
            Process
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
            From profile to move-in, we've streamlined every step
          </p>
        </motion.div>

        {/* Steps container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative"
        >
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-px bg-primary-foreground/15 z-0" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="relative group"
                >
                  <div className="flex flex-col items-center text-center p-6 bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/8 hover:border-primary-foreground/20 transition-all duration-200 h-full">
                    {/* Step number badge */}
                    <div className="w-10 h-10 bg-accent flex items-center justify-center mb-4 shadow-sm">
                      <span className="text-sm font-semibold text-accent-foreground">
                        {step.number}
                      </span>
                    </div>
                    
                    {/* Icon */}
                    <div className="w-14 h-14 border border-primary-foreground/15 flex items-center justify-center mb-4 group-hover:border-primary-foreground/25 transition-colors duration-200">
                      <IconComponent className="w-6 h-6 text-primary-foreground/80" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base font-medium text-primary-foreground mb-2 tracking-wide">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-primary-foreground/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
