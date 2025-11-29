-- Add direction column to cab_groups
ALTER TABLE public.cab_groups 
ADD COLUMN direction text NOT NULL DEFAULT 'to_station' CHECK (direction IN ('to_station', 'to_college'));

-- Add creator info to track who books the cab
ALTER TABLE public.cab_groups
ADD COLUMN created_by_name text,
ADD COLUMN created_by_phone text;

-- Create comments table for cab groups
CREATE TABLE public.cab_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.cab_groups(id) ON DELETE CASCADE,
  member_name text NOT NULL,
  member_phone text NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.cab_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view comments
CREATE POLICY "Anyone can view comments"
ON public.cab_comments
FOR SELECT
USING (true);

-- Allow anyone to add comments
CREATE POLICY "Anyone can add comments"
ON public.cab_comments
FOR INSERT
WITH CHECK (true);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.cab_comments;