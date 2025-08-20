
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

const Tools = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Wrench className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white volter-font"
                      style={{
                        textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                      }}>
                    🔧 Ferramentas
                  </h1>
                </div>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Ferramentas úteis para a comunidade Habbo
                </p>
              </div>
              
              <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-2 border-black">
                <CardHeader>
                  <CardTitle className="volter-font text-2xl text-gray-900">Ferramentas em desenvolvimento...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 volter-font">
                    Ferramentas úteis para a comunidade serão adicionadas em breve. Aguarde novidades!
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Tools;
