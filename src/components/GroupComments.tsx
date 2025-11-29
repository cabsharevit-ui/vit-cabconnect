import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Comment {
  id: string;
  member_name: string;
  member_phone: string;
  comment: string;
  created_at: string;
}

interface GroupCommentsProps {
  groupId: string;
}

export const GroupComments = ({ groupId }: GroupCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("cab_comments")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`comments_${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "cab_comments",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim() || !userPhone.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("cab_comments").insert({
        group_id: groupId,
        member_name: userName.trim(),
        member_phone: userPhone.trim(),
        comment: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comment posted",
        description: "Your message has been shared with the group.",
      });
    } catch (error) {
      console.error("Comment error:", error);
      toast({
        title: "Failed to post",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        Group Chat ({comments.length})
      </h3>

      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-sm text-foreground">{comment.member_name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(comment.created_at), "MMM dd, h:mm a")}
                </p>
              </div>
              <p className="text-sm text-foreground">{comment.comment}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-xs">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              required
              pattern="[0-9]{10}"
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            className="min-h-[60px] text-sm"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="self-end"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};
