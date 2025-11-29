import { Hero } from "@/components/Hero";
import { TrainSearch } from "@/components/TrainSearch";
import { ActiveGroups } from "@/components/ActiveGroups";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <Button onClick={() => navigate("/auth")} variant="outline">
          Sign In
        </Button>
      </div>
      <Hero />
      <TrainSearch />
      <ActiveGroups />

      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            VIT Cab Share - Making travel easier for VITians
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Share responsibly and travel safely
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
