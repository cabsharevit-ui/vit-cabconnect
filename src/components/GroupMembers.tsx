import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { User, Phone, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  member_name: string;
  phone_number: string;
}

interface GroupMembersProps {
  groupId: string;
  creatorPhone: string | null;
}

export const GroupMembers = ({ groupId, creatorPhone }: GroupMembersProps) => {
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("cab_members")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMembers(data);
    }
  };

  useEffect(() => {
    fetchMembers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`members_${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cab_members",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-primary" />
        Group Members ({members.length})
      </h3>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{member.member_name}</p>
                  {member.phone_number === creatorPhone && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Cab Booker
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {member.phone_number}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
