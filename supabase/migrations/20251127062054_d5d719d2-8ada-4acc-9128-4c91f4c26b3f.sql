-- Create trains table to store train information
CREATE TABLE IF NOT EXISTS public.trains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  train_number TEXT NOT NULL UNIQUE,
  train_name TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  source_station TEXT NOT NULL DEFAULT 'Katpadi Junction',
  destination_station TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cab_groups table for organizing cab sharing
CREATE TABLE IF NOT EXISTS public.cab_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  train_number TEXT NOT NULL,
  travel_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  max_capacity INTEGER DEFAULT 4,
  current_count INTEGER DEFAULT 0,
  meeting_point TEXT DEFAULT 'VIT Main Gate',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_train_date UNIQUE(train_number, travel_date)
);

-- Create cab_members table to track who joined which group
CREATE TABLE IF NOT EXISTS public.cab_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.cab_groups(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cab_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cab_members ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (students can view all data)
CREATE POLICY "Anyone can view trains" ON public.trains
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view cab groups" ON public.cab_groups
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view cab members" ON public.cab_members
  FOR SELECT USING (true);

-- Create policies for inserting data
CREATE POLICY "Anyone can create cab groups" ON public.cab_groups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can join cab groups" ON public.cab_members
  FOR INSERT WITH CHECK (true);

-- Create policy for updating cab group count
CREATE POLICY "Anyone can update cab groups" ON public.cab_groups
  FOR UPDATE USING (true);

-- Insert some sample train data for VIT Vellore to major destinations
INSERT INTO public.trains (train_number, train_name, departure_time, arrival_time, destination_station) VALUES
('12296', 'Sanghamitra Express', '08:15', '22:30', 'Bangalore'),
('12640', 'Brindavan Express', '16:00', '19:30', 'Chennai'),
('12008', 'Shatabdi Express', '06:20', '11:45', 'Coimbatore'),
('16724', 'Anantapuri Express', '13:40', '06:15', 'Tirupati'),
('12664', 'Howrah Express', '20:10', '10:30', 'Kolkata'),
('12290', 'Nagpur Duronto', '22:45', '14:20', 'Nagpur')
ON CONFLICT (train_number) DO NOTHING;

-- Create function to update cab group count
CREATE OR REPLACE FUNCTION update_cab_group_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.cab_groups
  SET current_count = (
    SELECT COUNT(*) FROM public.cab_members WHERE group_id = NEW.group_id
  )
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update count when member joins
CREATE TRIGGER update_group_count_on_join
  AFTER INSERT ON public.cab_members
  FOR EACH ROW
  EXECUTE FUNCTION update_cab_group_count();