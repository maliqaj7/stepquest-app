import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jngxlfabrccnpmzudvwf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZ3hsZmFicmNjbnBtenVkdndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk1MzMsImV4cCI6MjA4MDI2NTUzM30.p_nQaeC2Ffp8zddLC9rEAv1QWPwic7LhamXEEKc44Ew";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
