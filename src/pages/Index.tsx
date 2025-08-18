
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, Home, Users, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  const { isLoggedIn, loading, habboAccount } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-lg font-bold text-white">Carregando...</div>
      </div>
    );
  }

  // Se logado, redirecionar para console
  if (isLoggedIn && habboAccount) {
    return <Navigate to="/console" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-900 to-purple-900">
        <NewAppSidebar />
        <main className="flex-1 ml-64">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-32 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">HH</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Bem-vindo ao Habbo Hub
              </h1>
              <p className="text-xl text-white/90 mb-8">
                A plataforma definitiva para a comunidade Habbo
              </p>
            </div>

            {/* Main Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Habbo Homes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-gray-700 text-sm mb-3">
                    Crie e personalize sua própria Habbo Home com widgets arrastáveis e stickers!
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">
                    Personalização Total
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Comunidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-gray-700 text-sm mb-3">
                    Conecte-se com outros Habbos, participe de eventos e forums da comunidade.
                  </p>
                  <Badge className="bg-green-100 text-green-800">
                    Social
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Ferramentas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-gray-700 text-sm mb-3">
                    Acesse ferramentas exclusivas, marketplace e muito mais!
                  </p>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Exclusivo
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle className="text-2xl">
                    Conecte sua Conta Habbo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-gray-700 mb-6">
                    Entre com sua conta Habbo para acessar todas as funcionalidades do Hub:
                  </p>
                  <ul className="text-left text-gray-600 mb-8 space-y-2 text-sm">
                    <li>✅ Criar e personalizar sua Habbo Home</li>
                    <li>✅ Participar da comunidade e eventos</li>
                    <li>✅ Acessar ferramentas exclusivas</li>
                    <li>✅ Conectar com outros Habbos</li>
                  </ul>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    onClick={() => window.location.href = '/login'}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Conectar Agora
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-12">
              <p className="text-white/70 text-sm">
                Habbo Hub - Feito pela comunidade, para a comunidade 💙
              </p>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
