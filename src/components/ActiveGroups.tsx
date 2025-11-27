import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CabGroupCard } from "./CabGroupCard";
import { JoinGroupDialog } from "./JoinGroupDialog";
import { Loader2 } from "lucide-react";

interface CabGroup {
  id: string;
  train_number: string;
  travel_date: string;
  departure_time: string;
  max_capacity: number;
  current_count: number;
  meeting_point: string;
}

export const ActiveGroups = () => {
  const [groups, setGroups] = useState<CabGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("cab_groups")
        .select("*")
        .eq("status", "active")
        .gte("travel_date", new Date().toISOString().split("T")[0])
        .order("travel_date", { ascending: true })
        .order("departure_time", { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("cab_groups_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cab_groups",
        },
        () => {
          fetchGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleJoinGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setDialogOpen(true);
  };

  const handleJoinSuccess = () => {
    fetchGroups();
  };

  if (isLoading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            Active Cab Groups
          </h2>

          {groups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No active groups yet. Be the first to create one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <CabGroupCard key={group.id} group={group} onJoin={handleJoinGroup} />
              ))}
            </div>
          )}
        </div>
      </section>

      <JoinGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        groupId={selectedGroupId}
        onSuccess={handleJoinSuccess}
      />
    </>
  );
};
