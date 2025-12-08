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
      staggerChildren: 0.12,
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
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary opacity-100" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      <div className="mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
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
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="relative group"
                >
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/10 hover:border-primary-foreground/20 transition-all duration-300 h-full">
                    {/* Step number badge */}
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-lg font-bold text-accent-foreground">
                        {step.number}
                      </span>
                    </div>
                    
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-lg bg-primary-foreground/10 flex items-center justify-center mb-4 group-hover:bg-primary-foreground/15 transition-colors duration-300">
                      <IconComponent className="w-7 h-7 text-primary-foreground" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-primary-foreground/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow connector - desktop only */}
                  {step.number < 5 && (
                    <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-4 h-4 rotate-45 border-t-2 border-r-2 border-primary-foreground/30" />
                    </div>
                  )}
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
