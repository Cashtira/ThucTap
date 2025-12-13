import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yfgmcsbrqzrowxglkttc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ21jc2JycXpyb3d4Z2xrdHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzQ3OTAsImV4cCI6MjA4MDkxMDc5MH0.TI8IDjRwkyKjD64WyOX5hJg7p0l9U_uUhZC8FgGvr4Q'

console.log("Check URL:", supabaseUrl);
console.log("Check Key:", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Thiếu Supabase URL hoặc Key rồi bạn ơi!");
}

export const supabase = createClient(supabaseUrl, supabaseKey)