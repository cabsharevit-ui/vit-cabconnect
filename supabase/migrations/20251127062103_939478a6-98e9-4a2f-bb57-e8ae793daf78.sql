-- Fix function search path security warning
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;