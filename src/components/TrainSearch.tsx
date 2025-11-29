import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Train {
  id: string;
  train_number: string;
  train_name: string;
  departure_time: string;
  destination_station: string;
}

export const TrainSearch = () => {
  const navigate = useNavigate();
  const [trainNumber, setTrainNumber] = useState("");
  const [travelDate, setTravelDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [direction, setDirection] = useState<"to_station" | "to_college">("to_station");
  const [searchResult, setSearchResult] = useState<Train | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      const { data, error } = await supabase
        .from("trains")
        .select("*")
        .eq("train_number", trainNumber.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSearchResult(data);
        toast({
          title: "Train found!",
          description: `${data.train_name} to ${data.destination_station}`,
        });
      } else {
        toast({
          title: "Train not found",
          description: "Please check the train number and try again.",
          variant: "destructive",
        });
        setSearchResult(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewGroups = () => {
    if (searchResult) {
      navigate(`/train/${searchResult.train_number}/${travelDate}/${direction}`);
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          Search Your Train
        </h2>

        <Card className="p-6 bg-gradient-to-br from-card to-background border-border shadow-[var(--shadow-medium)]">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  Train Number
                </label>
                <Input
                  type="text"
                  placeholder="e.g., 12640"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_hsla(var(--primary),0.1)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Travel Date
                </label>
                <Input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_hsla(var(--primary),0.1)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Direction
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setDirection("to_station")}
                    variant={direction === "to_station" ? "default" : "outline"}
                    className="flex-1"
                  >
                    To Station
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setDirection("to_college")}
                    variant={direction === "to_college" ? "default" : "outline"}
                    className="flex-1"
                  >
                    To College
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-[var(--shadow-soft)]"
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search Train"}
            </Button>
          </form>

          {searchResult && (
            <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{searchResult.train_name}</h3>
                  <p className="text-sm text-muted-foreground">Train #{searchResult.train_number}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  {searchResult.departure_time}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
                <div>
                  <div className="font-medium text-foreground">Katpadi Junction</div>
                  <div>Departure</div>
                </div>
                <div className="flex-1 mx-4 border-t-2 border-dashed border-primary/30"></div>
                <div className="text-right">
                  <div className="font-medium text-foreground">{searchResult.destination_station}</div>
                  <div>Destination</div>
                </div>
              </div>

              <Button 
                onClick={handleViewGroups}
                className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent transition-all duration-300"
              >
                View Cab Groups
              </Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
