const SUPABASE_URL = 'https://jfyeowqksutlyljsowuw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vHzW806XnkRD4xznD-XWxQ_gk9MBy2z';

window.__sb = typeof window.supabase !== 'undefined'
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
