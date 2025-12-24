import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Gift, 
  Star,
  CheckCircle,
  Sparkles,
  Users,
  BookOpen,
  MessageCircle,
  Trophy,
  ArrowRight
} from "lucide-react";

export default function JoinReferral() {
  const { code } = useParams<{ code: string }>();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [registering, setRegistering] = useState(false);

  // Validar código de referral
  const { data: referralData, isLoading: validatingCode } = trpc.referral.validateCode.useQuery(
    { code: code || '' },
    { enabled: !!code }
  );

  // Mutation para registrar indicação
  const registerMutation = trpc.referral.registerReferral.useMutation({
    onSuccess: () => {
      toast.success("🎉 Parabéns! Você ganhou 200 pontos de bônus!");
      // Salvar no localStorage que já usou o código
      localStorage.setItem('referral_used', 'true');
      setLocation('/dashboard');
    },
    onError: (error) => {
      // Se já foi indicado, apenas redireciona
      if (error.message.includes('já foi indicado')) {
        setLocation('/dashboard');
      } else {
        console.error('Erro ao registrar indicação:', error);
        setLocation('/dashboard');
      }
    }
  });

  // Se usuário está logado, registrar indicação automaticamente
  useEffect(() => {
    if (user && code && referralData?.valid && !registering) {
      const alreadyUsed = localStorage.getItem('referral_used');
      if (!alreadyUsed) {
        setRegistering(true);
        registerMutation.mutate({ code });
      } else {
        // Usuário já usou um código, mostrar mensagem e redirecionar
        toast.info('Você já utilizou um código de indicação anteriormente.');
        setTimeout(() => setLocation('/dashboard'), 2000);
      }
    }
  }, [user, code, referralData]);

  // Loading state
  if (authLoading || validatingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-orange-200 rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se código inválido
  if (!referralData?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Código Inválido</CardTitle>
            <CardDescription>
              O código de indicação não é válido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Ir para a página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se usuário já está logado e estamos processando
  if (user && registering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-medium text-gray-700">Registrando seu bônus...</p>
        </div>
      </div>
    );
  }

  // Página de convite para visitantes não logados
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header simples */}
      <header className="py-4 px-4">
        <div className="container mx-auto flex items-center justify-center">
          <img 
            src="/papaya-logo.png" 
            alt="PapayaNews" 
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-2xl font-bold text-orange-600 ml-2">PapayaNews</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Card Principal de Convite */}
        <Card className="border-2 border-orange-200 shadow-xl overflow-hidden">
          {/* Banner de Bônus */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6" />
              <span className="text-lg font-medium">Convite Especial</span>
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Você foi convidado!
            </h1>
            <p className="text-orange-100">
              por <span className="font-semibold text-white">{referralData.referrerName}</span>
            </p>
          </div>

          <CardContent className="p-6 md:p-8">
            {/* Destaque do Bônus */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Gift className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-green-700">+200 PONTOS</span>
              </div>
              <p className="text-green-600 font-medium">
                Bônus de boas-vindas exclusivo para você!
              </p>
              <p className="text-sm text-green-500 mt-1">
                Use seus pontos para trocar por produtos e experiências na Papaya Shop
              </p>
            </div>

            {/* Benefícios */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                O que você ganha ao entrar:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Conteúdo Exclusivo</p>
                    <p className="text-sm text-gray-600">Artigos, vídeos e análises sobre IA e startups</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Chat da Comunidade</p>
                    <p className="text-sm text-gray-600">Conecte-se com outros entusiastas de tecnologia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Networking</p>
                    <p className="text-sm text-gray-600">Conheça profissionais e empreendedores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Gamificação</p>
                    <p className="text-sm text-gray-600">Ganhe pontos, badges e troque por prêmios</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA de Cadastro */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg py-6 gap-2"
                onClick={() => {
                  // Salvar código no localStorage para usar após login
                  localStorage.setItem('pending_referral_code', code || '');
                  window.location.href = getLoginUrl();
                }}
              >
                <Star className="h-5 w-5" />
                Criar Minha Conta e Ganhar 200 Pontos
                <ArrowRight className="h-5 w-5" />
              </Button>
              
              <p className="text-center text-sm text-gray-500">
                Cadastro rápido com Google, LinkedIn ou Email
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100% gratuito</span>
                <span className="mx-2">•</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Sem spam</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Já tem uma conta?{' '}
            <a href={getLoginUrl()} className="text-orange-600 hover:underline font-medium">
              Fazer login
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
