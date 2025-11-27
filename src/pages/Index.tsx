import { Hero } from "@/components/Hero";
import { TrainSearch } from "@/components/TrainSearch";
import { ActiveGroups } from "@/components/ActiveGroups";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
