import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Phone } from "lucide-react";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string | null;
  trainNumber: string;
  travelDate: string;
  direction: string;
  onSuccess: () => void;
}

export const JoinGroupDialog = ({ open, onOpenChange, groupId, trainNumber, travelDate, direction, onSuccess }: JoinGroupDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;

    setIsSubmitting(true);

    try {
      // Check if user already has a group for this train
      const { data: existingMembership, error: memberCheckError } = await supabase
        .from("cab_members")
        .select("id, group_id, cab_groups!inner(train_number, travel_date, direction)")
        .eq("phone_number", phone.trim())
        .eq("cab_groups.train_number", trainNumber)
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

      const { error } = await supabase
        .from("cab_members")
        .insert({
          group_id: groupId,
          member_name: name.trim(),
          phone_number: phone.trim(),
        });

      if (error) throw error;

      toast({
        title: "Successfully joined!",
        description: "You've been added to the cab group. Safe travels!",
      });

      setName("");
      setPhone("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Join error:", error);
      toast({
        title: "Failed to join",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Join Cab Group</DialogTitle>
          <DialogDescription>
            Enter your details to join this cab sharing group
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
            <p className="text-xs text-muted-foreground">
              Your phone number will be shared with other group members
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent transition-all duration-300"
          >
            {isSubmitting ? "Joining..." : "Join Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
