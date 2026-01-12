import { createClient } from '@supabase/supabase-js'

// Supabase dashboard nundi copy cheyi
const supabaseUrl = 'https://icaaswuzmzalcaxufzym.supabase.co'
const supabaseKey = 'sb_publishable_SvTZjdSWxDZBT3493Da0fA_ZiTelv3F'

export const supabase = createClient(supabaseUrl, supabaseKey)