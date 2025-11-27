import { useState } from "react";
import { Hero } from "@/components/Hero";
import { TrainSearch } from "@/components/TrainSearch";
import { ActiveGroups } from "@/components/ActiveGroups";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";

interface Train {
  id: string;
  train_number: string;
  train_name: string;
  departure_time: string;
  destination_station: string;
}

const Index = () => {
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [travelDate, setTravelDate] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleTrainSelect = (train: Train, date: string) => {
    setSelectedTrain(train);
    setTravelDate(date);
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    // Refresh the active groups list (handled by ActiveGroups component's realtime subscription)
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <TrainSearch onTrainSelect={handleTrainSelect} />
      <ActiveGroups />
      
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        train={selectedTrain}
        travelDate={travelDate}
        onSuccess={handleCreateSuccess}
      />

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
