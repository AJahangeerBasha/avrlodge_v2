import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://gyscskrvuxpgysletrvz.supabase.co'
const supabaseAnonKey = (
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : process.env.VITE_SUPABASE_ANON_KEY
) || 'YOUR_SUPABASE_ANON_KEY_HERE'

// Validate configuration before creating client
if (supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.warn('⚠️ Supabase client initialized with placeholder key. Some features may not work properly.')
}

// Create Supabase client with error handling
let supabase: any
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
  // Create a minimal mock client to prevent app crashes
  supabase = {
    auth: { getSession: () => Promise.resolve({ data: { session: null }, error: null }) },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        createSignedUrl: () => Promise.resolve({ error: new Error('Supabase not configured') })
      })
    }
  }
}

export { supabase }

// Enhanced debugging information
const isDev = (
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.DEV
    : process.env.NODE_ENV === 'development'
)

if (isDev) {
  console.log('🗄️ Supabase initialized in development mode')
  console.log('📊 Supabase URL:', supabaseUrl)
  console.log('🔑 Anon Key:', supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' ? '***configured***' : '***missing***')
}

export default supabase