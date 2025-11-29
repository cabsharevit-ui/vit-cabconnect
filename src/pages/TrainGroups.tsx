import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CabGroupCard } from "@/components/CabGroupCard";
import { JoinGroupDialog } from "@/components/JoinGroupDialog";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { GroupMembers } from "@/components/GroupMembers";
import { GroupComments } from "@/components/GroupComments";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Train, Calendar, Clock, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface CabGroup {
  id: string;
  train_number: string;
  travel_date: string;
  departure_time: string;
  max_capacity: number;
  current_count: number;
  meeting_point: string;
  direction: string;
  created_by_name: string | null;
  created_by_phone: string | null;
}

interface TrainData {
  id: string;
  train_number: string;
  train_name: string;
  departure_time: string;
  destination_station: string;
}

const TrainGroups = () => {
  const { trainNumber, date, direction } = useParams();
  const navigate = useNavigate();
  const [train, setTrain] = useState<TrainData | null>(null);
  const [groups, setGroups] = useState<CabGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchTrainAndGroups = async () => {
    if (!trainNumber || !date || !direction) return;

    try {
      // Fetch train details
      const { data: trainData, error: trainError } = await supabase
        .from("trains")
        .select("*")
        .eq("train_number", trainNumber)
        .single();

      if (trainError) throw trainError;
      setTrain(trainData);

      // Fetch groups for this train, date, and direction
      const { data: groupsData, error: groupsError } = await supabase
        .from("cab_groups")
        .select("*")
        .eq("train_number", trainNumber)
        .eq("travel_date", date)
        .eq("direction", direction)
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (groupsError) throw groupsError;
      setGroups(groupsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainAndGroups();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("train_groups_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cab_groups",
        },
        () => {
          fetchTrainAndGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trainNumber, date, direction]);

  const handleJoinGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setJoinDialogOpen(true);
  };

  const handleCreateNew = () => {
    setCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!train) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Train not found</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Train className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {train.train_name}
                  </h1>
                  <p className="text-white/80">Train #{train.train_number}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-white/10 rounded-lg px-4 py-2 text-white">
                  <div className="flex items-center gap-2 text-sm opacity-80">
                    <Calendar className="w-4 h-4" />
                    <span>Travel Date</span>
                  </div>
                  <div className="font-semibold mt-1">
                    {format(new Date(date!), "MMM dd, yyyy")}
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg px-4 py-2 text-white">
                  <div className="flex items-center gap-2 text-sm opacity-80">
                    <Clock className="w-4 h-4" />
                    <span>Departure</span>
                  </div>
                  <div className="font-semibold mt-1">
                    {train.departure_time}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 text-sm text-white/80">
              <div>
                <div className="font-medium text-white">
                  {direction === "to_station" ? "VIT Vellore" : "Katpadi Junction"}
                </div>
                <div>{direction === "to_station" ? "Starting Point" : "Arrival"}</div>
              </div>
              <div className="flex-1 mx-4 flex items-center justify-center gap-2">
                <div className="flex-1 border-t-2 border-dashed border-white/30"></div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {direction === "to_station" ? "To Station" : "To College"}
                </Badge>
                <ArrowRight className="w-4 h-4 text-white" />
                <div className="flex-1 border-t-2 border-dashed border-white/30"></div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">
                  {direction === "to_station" ? "Katpadi Junction" : "VIT Vellore"}
                </div>
                <div>{direction === "to_station" ? "Destination" : "Destination"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Available Cab Groups
            </h2>
            <Button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent transition-all duration-300 shadow-[var(--shadow-soft)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Group
            </Button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg mb-6">
                No groups yet for this train. Be the first to create one!
              </p>
              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Group
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {groups.map((group) => (
                <div key={group.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <CabGroupCard group={group} onJoin={handleJoinGroup} />
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GroupMembers groupId={group.id} creatorPhone={group.created_by_phone} />
                    <GroupComments groupId={group.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <JoinGroupDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        groupId={selectedGroupId}
        trainNumber={trainNumber!}
        travelDate={date!}
        direction={direction!}
        onSuccess={fetchTrainAndGroups}
      />

      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        train={train}
        travelDate={date!}
        direction={direction!}
        onSuccess={fetchTrainAndGroups}
      />
    </div>
  );
};

export default TrainGroups;
