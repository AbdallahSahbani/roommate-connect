import { ReactNode } from "react";

type CityKey = "nyc" | "suburban" | "downtown";

interface CityHeroProps {
  cityKey?: CityKey;
  children: ReactNode;
}

const cityVideoMap: Record<CityKey, string> = {
  nyc: "/videos/nyc.mp4",
  suburban: "/videos/suburban.mp4",
  downtown: "/videos/downtown.mp4",
};

export const CityHero = ({ cityKey = "nyc", children }: CityHeroProps) => {
  const videoSrc = cityVideoMap[cityKey] || cityVideoMap.nyc;

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-black/80 min-h-[700px] md:h-[600px] flex items-center">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/nyc-skyline.png"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Burgundy Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#5B1020]/80 via-black/40 to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
};
