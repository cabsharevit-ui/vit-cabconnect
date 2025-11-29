import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Users, MapPin } from "lucide-react";

interface Train {
  id: string;
  train_number: string;
  train_name: string;
  departure_time: string;
  destination_station: string;
}

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  train: Train | null;
  travelDate: string;
  direction: string;
  onSuccess: () => void;
}

export const CreateGroupDialog = ({ open, onOpenChange, train, travelDate, direction, onSuccess }: CreateGroupDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("4");
  const [meetingPoint, setMeetingPoint] = useState("VIT Main Gate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!train) return;

    setIsSubmitting(true);

    try {
      // Check if user already has a group for this train
      const { data: existingMembership, error: memberCheckError } = await supabase
        .from("cab_members")
        .select("id, group_id, cab_groups!inner(train_number, travel_date, direction)")
        .eq("phone_number", phone.trim())
        .eq("cab_groups.train_number", train.train_number)
        .eq("cab_groups.travel_date", travelDate)
        .eq("cab_groups.direction", direction)
        .maybeSingle();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') throw memberCheckError;

      if (existingMembership) {
        toast({
          title: "Already in a group",
          description: "You already have a cab group for this train. Only one booking per train allowed.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create new group with creator info
      const { data: newGroup, error: createError } = await supabase
        .from("cab_groups")
        .insert({
          train_number: train.train_number,
          travel_date: travelDate,
          departure_time: train.departure_time,
          max_capacity: parseInt(maxCapacity),
          meeting_point: meetingPoint,
          direction: direction,
          created_by_name: name.trim(),
          created_by_phone: phone.trim(),
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add the creator as a member
      const { error: memberError } = await supabase
        .from("cab_members")
        .insert({
          group_id: newGroup.id,
          member_name: name.trim(),
          phone_number: phone.trim(),
        });

      if (memberError) throw memberError;

      toast({
        title: "Success!",
        description: "Group created! As the creator, you're responsible for booking the cab.",
      });

      // Reset form
      setName("");
      setPhone("");
      setMaxCapacity("4");
      setMeetingPoint("VIT Main Gate");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Create/join error:", error);
      toast({
        title: "Failed to create group",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!train) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Cab Group</DialogTitle>
          <DialogDescription>
            Create a new group for {train.train_name} on {new Date(travelDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="transition-all duration-300 focus:shadow-[0_0_0_3px_hsla(var(--primary),0.1)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
              className="transition-all duration-300 focus:shadow-[0_0_0_3px_hsla(var(--primary),0.1)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Max Capacity
            </Label>
            <Input
              id="capacity"
              type="number"
              min="2"
              max="6"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              required
              className="transition-all duration-300 focus:shadow-[0_0_0_3px_hsla(var(--primary),0.1)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Meeting Point
            </Label>
            <Input
              id="meeting"
              type="text"
              placeholder="e.g., VIT Main Gate"
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              required
              className="transition-all duration-300 focus:shadow-[0_0_0_3px_hsla(var(--primary),0.1)]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent transition-all duration-300"
          >
            {isSubmitting ? "Creating..." : "Create & Join Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
