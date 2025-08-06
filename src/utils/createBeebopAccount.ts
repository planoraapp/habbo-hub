
import { supabase } from '@/integrations/supabase/client';
import { getUserByName } from '../services/habboApi';

// Função para criar a conta Beebop automaticamente
export const createBeebopAccount = async () => {
  try {
    console.log('🔧 Verificando conta Beebop...');

    // Verificar se a conta já existe na tabela habbo_accounts
    const { data: existingAccount } = await supabase
      .from('habbo_accounts')
      .select('*')
      .ilike('habbo_name', 'Beebop')
      .maybeSingle();

    if (existingAccount) {
      console.log('✅ Conta Beebop já existe na tabela habbo_accounts');
      return;
    }

    console.log('🔍 Conta Beebop não encontrada, tentando criar...');

    // Buscar dados do Habbo
    const habboUser = await getUserByName('Beebop');
    if (!habboUser) {
      console.error('❌ Usuário Beebop não encontrado no Habbo API');
      return;
    }

    console.log('📊 Dados do Beebop encontrados:', habboUser.name);

    // Verificar se já existe conta auth órfã
    const authEmail = `${habboUser.uniqueId}@habbohub.com`;
    
    // Tentar fazer signup primeiro
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: '290684',
      options: {
        data: { habbo_name: 'Beebop' },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('🔄 Conta auth já existe, tentando fazer login para vincular...');
        
        // Tentar fazer login para vincular
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: '290684'
        });

        if (loginError) {
          console.error('❌ Erro ao fazer login da conta existente:', loginError);
          return;
        }

        if (loginData.user) {
          // Criar registro na tabela habbo_accounts
          const { data: accountData, error: accountError } = await supabase
            .from('habbo_accounts')
            .insert({
              habbo_id: habboUser.uniqueId,
              habbo_name: 'Beebop',
              supabase_user_id: loginData.user.id,
              is_admin: true
            })
            .select()
            .single();

          if (accountError) {
            console.error('❌ Erro na criação da vinculação da conta:', accountError);
            return;
          }

          console.log('✅ Conta Beebop vinculada com sucesso:', accountData);
          
          // Fazer logout após criar a vinculação
          await supabase.auth.signOut();
          return;
        }
      } else {
        console.error('❌ Erro na criação do auth:', authError);
        return;
      }
    }

    if (authData?.user) {
      // Criar registro na tabela habbo_accounts
      const { data: accountData, error: accountError } = await supabase
        .from('habbo_accounts')
        .insert({
          habbo_id: habboUser.uniqueId,
          habbo_name: 'Beebop',
          supabase_user_id: authData.user.id,
          is_admin: true
        })
        .select()
        .single();

      if (accountError) {
        console.error('❌ Erro na criação da conta:', accountError);
        return;
      }

      console.log('✅ Conta Beebop criada com sucesso:', accountData);
      
      // Fazer logout após criar a conta (para não ficar logado automaticamente)
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('❌ Erro geral na criação da conta Beebop:', error);
  }
};
