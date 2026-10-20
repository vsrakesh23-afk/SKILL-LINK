// frontend/supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Fixed: Added the missing second slash 'https://'
const SUPABASE_URL = 'https://pwlbgglgdhwbyxkaewgw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bGJnZ2xnZGh3Ynl4a2Fld2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTUzMTUsImV4cCI6MjEwNzk3MTMxNX0.oEJEjiCQ1jkqPDjmyKR3Y83XPDmBsws45KDWol9ZJf0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);