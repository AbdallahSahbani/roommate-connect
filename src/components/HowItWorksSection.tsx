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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary z-0" />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl z-[1]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl z-[1]" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-[1]"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            From profile to move-in, we've streamlined every step of your journey
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
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="relative group"
                >
                  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-md hover:bg-primary-foreground/10 hover:border-primary-foreground/20 transition-all duration-300 h-full hover:-translate-y-2 hover:shadow-xl">
                    {/* Step number badge */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-lg font-bold text-accent-foreground">
                        {step.number}
                      </span>
                    </div>
                    
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mb-4 group-hover:bg-primary-foreground/15 transition-colors duration-300">
                      <IconComponent className="w-8 h-8 text-primary-foreground" />
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
