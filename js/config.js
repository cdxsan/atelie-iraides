const SUPABASE_URL = 'https://jfyeowqksutlyljsowuw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vHzW806XnkRD4xznD-XWxQ_gk9MBy2z';

// Número da Iraides no WhatsApp com código do país (sem + nem espaços)
const IRAIDES_WHATSAPP = '5524981371956';

const VALOR_FRETE = 1200; // R$ 12,00 em centavos

window.__sb = typeof window.supabase !== 'undefined'
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
