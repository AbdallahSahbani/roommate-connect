import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import founderPhoto from "@/assets/founder-photo.png";

const boardMembers = [
  {
    name: "Abdallah Tawfik Sahbani II",
    role: "Founder",
    initials: "AT",
    photo: founderPhoto
  },
  {
    name: "Chief Executive Officer",
    role: "CEO",
    initials: "?",
    vacant: true
  },
  {
    name: "Chief Digital Operations",
    role: "CDO",
    initials: "?",
    vacant: true
  },
  {
    name: "Machine Learning Engineer",
    role: "ML Engineer",
    initials: "?",
    vacant: true
  },
  {
    name: "Software Developer",
    role: "Developer",
    initials: "?",
    vacant: true
  }
];

export default function Board() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Board of Directors</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Meet the team building the future of housing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardMembers.map((member, index) => (
              <Card key={index} className={`p-6 ${member.vacant ? 'opacity-60' : ''}`}>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    {member.photo && <AvatarImage src={member.photo} alt={member.name} />}
                    <AvatarFallback className={member.vacant ? 'bg-muted' : 'bg-primary text-primary-foreground'}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                  
                  {member.vacant && (
                    <p className="text-xs text-muted-foreground italic">
                      Position open - Join our team!
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-12 p-8 bg-primary/5">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Join Our Board</h3>
              <p className="text-muted-foreground">
                Interested in contributing to LiveBigger's mission? We're always looking for talented 
                individuals to join our leadership team. Visit our <a href="/careers" className="text-primary hover:underline">Careers page</a> to learn more.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
