import { Users, MapPin, Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CabGroupCardProps {
  group: {
    id: string;
    train_number: string;
    travel_date: string;
    departure_time: string;
    max_capacity: number;
    current_count: number;
    meeting_point: string;
  };
  onJoin: (groupId: string) => void;
}

export const CabGroupCard = ({ group, onJoin }: CabGroupCardProps) => {
  const spotsLeft = group.max_capacity - group.current_count;
  const isFull = spotsLeft === 0;
  const fillPercentage = (group.current_count / group.max_capacity) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-background border-border hover:shadow-[var(--shadow-medium)] transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold">
              {group.train_number.slice(-2)}
            </div>
            <div>
              <h3 className="font-bold text-foreground">Train #{group.train_number}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {format(new Date(group.travel_date), "MMM dd, yyyy")}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
          <Clock className="w-4 h-4" />
          {group.departure_time}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-accent" />
          <span>Meeting Point: <span className="font-medium text-foreground">{group.meeting_point}</span></span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>Seats filled</span>
            </div>
            <span className="font-bold text-foreground">
              {group.current_count}/{group.max_capacity}
            </span>
          </div>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
          
          {!isFull && (
            <p className="text-xs text-accent font-medium">
              {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left!
            </p>
          )}
        </div>
      </div>

      <Button 
        onClick={() => onJoin(group.id)}
        disabled={isFull}
        className={`w-full transition-all duration-300 ${
          isFull 
            ? "bg-muted text-muted-foreground cursor-not-allowed" 
            : "bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent shadow-[var(--shadow-soft)]"
        }`}
      >
        {isFull ? "Group Full" : "Join This Group"}
      </Button>
    </Card>
  );
};
