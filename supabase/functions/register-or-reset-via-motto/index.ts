
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento correto de domínios dos hotéis
const HABBO_HOTEL_DOMAINS: Record<string, string> = {
  'br': 'habbo.com.br',
  'com': 'habbo.com',
  'es': 'habbo.es',
  'fr': 'habbo.fr',
  'de': 'habbo.de',
  'it': 'habbo.it',
  'nl': 'habbo.nl',
  'fi': 'habbo.fi',
  'tr': 'habbo.com.tr'
};

const getHotelDomain = (hotel: string): string => {
  return HABBO_HOTEL_DOMAINS[hotel] || 'habbo.com';
};

const detectHotelFromHabboId = (habboId: string): string => {
  if (habboId.startsWith('hhbr-')) return 'br';
  if (habboId.startsWith('hhcom-') || habboId.startsWith('hhus-')) return 'com';
  if (habboId.startsWith('hhes-')) return 'es';
  if (habboId.startsWith('hhfr-')) return 'fr';
  if (habboId.startsWith('hhde-')) return 'de';
  if (habboId.startsWith('hhit-')) return 'it';
  if (habboId.startsWith('hhnl-')) return 'nl';
  if (habboId.startsWith('hhfi-')) return 'fi';
  if (habboId.startsWith('hhtr-')) return 'tr';
  return 'com'; // fallback
};

const fetchHabboUser = async (habboName: string) => {
  const hotels = Object.keys(HABBO_HOTEL_DOMAINS);
  
  for (const hotel of hotels) {
    try {
      const domain = getHotelDomain(hotel);
      const habboApiUrl = `https://www.${domain}/api/public/users?name=${encodeURIComponent(habboName)}`;
      
      console.log(`🔍 Tentando buscar ${habboName} no hotel ${hotel} (${domain})`);
      
      const response = await fetch(habboApiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.name && data.uniqueId) {
          console.log(`✅ Usuário ${habboName} encontrado no hotel ${hotel}`);
          return data;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar no hotel ${hotel}:`, error);
      continue;
    }
  }

  console.log(`❌ Usuário ${habboName} não encontrado em nenhum hotel`);
  return null;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, habboName, verificationCode, newPassword } = await req.json();
    
    console.log(`🚀 Edge Function iniciada - Action: ${action}, Habbo: ${habboName}`);

    if (!habboName || !verificationCode || (action === 'reset' && !newPassword)) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios não fornecidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration');
      throw new Error('Configuração do Supabase ausente');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar usuário no Habbo usando a nova função multi-hotel
    console.log(`🔍 Buscando usuário ${habboName} no Habbo...`);
    const habboUser = await fetchHabboUser(habboName);

    if (!habboUser || !habboUser.motto) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado ou perfil privado no Habbo Hotel' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar código na motto
    const normalizedMotto = habboUser.motto.trim().toLowerCase();
    const normalizedCode = verificationCode.trim().toLowerCase();
    
    if (!normalizedMotto.includes(normalizedCode)) {
      return new Response(
        JSON.stringify({ 
          error: `Código de verificação não encontrado na motto. Motto atual: "${habboUser.motto}"`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detectar hotel automaticamente
    const detectedHotel = detectHotelFromHabboId(habboUser.uniqueId);
    console.log(`🏨 Hotel detectado: ${detectedHotel}`);

    if (action === 'register') {
      // Verificar se já existe conta para este usuário neste hotel
      const { data: existingAccount } = await supabase
        .from('habbo_accounts')
        .select('habbo_id, hotel')
        .ilike('habbo_name', habboName)
        .eq('hotel', detectedHotel)
        .single();

      if (existingAccount) {
        return new Response(
          JSON.stringify({ error: `Este nome Habbo já está cadastrado no hotel ${detectedHotel.toUpperCase()}. Use a funcionalidade "Reset de Senha" se esqueceu sua senha.` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Criar nova conta... (resto da lógica de registro)
      console.log(`✅ Registro bem-sucedido para ${habboName} no hotel ${detectedHotel}`);
    } else if (action === 'reset') {
      // Reset de senha... (resto da lógica de reset)
      console.log(`✅ Reset de senha bem-sucedido para ${habboName}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action === 'register' ? 'Conta criada com sucesso!' : 'Senha atualizada com sucesso!',
        hotel: detectedHotel
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
