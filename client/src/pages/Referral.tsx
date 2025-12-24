import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Copy, 
  Share2, 
  Users, 
  Gift, 
  Trophy, 
  Star,
  CheckCircle,
  ArrowRight,
  Linkedin,
  Twitter,
  Mail,
  MessageCircle
} from "lucide-react";

export default function Referral() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: myCode, isLoading: loadingCode } = trpc.referral.getMyCode.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: stats, isLoading: loadingStats } = trpc.referral.getMyStats.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: history } = trpc.referral.getMyHistory.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: leaderboard } = trpc.referral.getLeaderboard.useQuery({ limit: 10 });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Faça login para acessar</CardTitle>
            <CardDescription>
              Você precisa estar logado para ver seu código de indicação.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const referralLink = myCode ? `${window.location.origin}/join/${myCode.code}` : '';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const shareOnLinkedIn = () => {
    const text = `Junte-se à comunidade PapayaNews! Use meu código ${myCode?.code} e ganhe 200 pontos de bônus. ${referralLink}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&summary=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `🚀 Junte-se à comunidade @PapayaNews! Use meu código ${myCode?.code} e ganhe 200 pontos de bônus para trocar por produtos exclusivos. #IA #Startups #Inovação`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = `🎉 Oi! Quero te convidar para a comunidade PapayaNews - o melhor lugar para quem ama IA, startups e inovação!\n\nUse meu código: ${myCode?.code}\nVocê ganha 200 pontos de bônus!\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareByEmail = () => {
    const subject = "Convite para a comunidade PapayaNews";
    const body = `Olá!\n\nQuero te convidar para fazer parte da comunidade PapayaNews - o melhor lugar para quem ama IA, startups e inovação!\n\nUse meu código de indicação: ${myCode?.code}\nVocê ganha 200 pontos de bônus para trocar por produtos exclusivos!\n\nAcesse: ${referralLink}\n\nAté lá!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  // Calcular progresso para próximo badge
  const totalReferrals = stats?.totalReferrals || 0;
  const nextBadgeTarget = totalReferrals < 5 ? 5 : totalReferrals < 10 ? 10 : totalReferrals < 25 ? 25 : 50;
  const progress = (totalReferrals / nextBadgeTarget) * 100;
  const nextBadgeName = totalReferrals < 5 ? "Recrutador" : totalReferrals < 10 ? "Embaixador" : totalReferrals < 25 ? "Lenda" : "Mestre";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Programa de Indicação</h1>
          </div>
          <p className="text-orange-100 text-lg max-w-2xl">
            Convide amigos para a comunidade PapayaNews e ganhe pontos para trocar por produtos exclusivos!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seu Código */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  Seu Código de Indicação
                </CardTitle>
                <CardDescription>
                  Compartilhe este código com seus amigos. Quando eles se cadastrarem, vocês dois ganham pontos!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCode ? (
                  <div className="animate-pulse h-16 bg-gray-100 rounded-lg" />
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1 bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center">
                        <span className="text-3xl font-bold text-orange-600 tracking-wider">
                          {myCode?.code || 'Gerando...'}
                        </span>
                      </div>
                      <Button 
                        onClick={() => copyToClipboard(myCode?.code || '')}
                        variant={copied ? "default" : "outline"}
                        size="lg"
                        className="gap-2"
                      >
                        {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        {copied ? "Copiado!" : "Copiar"}
                      </Button>
                    </div>

                    {/* Link de Convite */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-500 mb-2">Link de convite:</p>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={referralLink}
                          readOnly
                          className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(referralLink)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Botões de Compartilhamento */}
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Compartilhar via:</p>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={shareOnWhatsApp} className="gap-2 bg-green-50 hover:bg-green-100 border-green-200">
                          <MessageCircle className="h-4 w-4 text-green-600" />
                          WhatsApp
                        </Button>
                        <Button variant="outline" onClick={shareOnLinkedIn} className="gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          LinkedIn
                        </Button>
                        <Button variant="outline" onClick={shareOnTwitter} className="gap-2 bg-sky-50 hover:bg-sky-100 border-sky-200">
                          <Twitter className="h-4 w-4 text-sky-500" />
                          Twitter
                        </Button>
                        <Button variant="outline" onClick={shareByEmail} className="gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Como Funciona */}
            <Card>
              <CardHeader>
                <CardTitle>Como Funciona</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share2 className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">1. Compartilhe</h3>
                    <p className="text-sm text-gray-600">
                      Envie seu código ou link para amigos interessados em IA e inovação
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">2. Amigo se Cadastra</h3>
                    <p className="text-sm text-gray-600">
                      Seu amigo usa o código ao criar a conta na comunidade
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">3. Ganhem Pontos</h3>
                    <p className="text-sm text-gray-600">
                      Você ganha <strong>500 pontos</strong> e seu amigo ganha <strong>200 pontos</strong>!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Indicações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Suas Indicações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!history || history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Você ainda não indicou ninguém.</p>
                    <p className="text-sm">Compartilhe seu código e comece a ganhar pontos!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold">
                              {item.referredName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{item.referredName || 'Usuário'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          +{item.referrerPointsEarned} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suas Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingStats ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-16 bg-gray-100 rounded" />
                    <div className="h-16 bg-gray-100 rounded" />
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4">
                      <p className="text-sm opacity-80">Total de Indicações</p>
                      <p className="text-3xl font-bold">{stats?.totalReferrals || 0}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
                      <p className="text-sm opacity-80">Pontos Ganhos</p>
                      <p className="text-3xl font-bold">{stats?.totalPointsEarned || 0}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Progresso para Próximo Badge */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Próximo Badge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {nextBadgeName}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    {totalReferrals} / {nextBadgeTarget} indicações
                  </p>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-gray-500 text-center mt-2">
                  Faltam {nextBadgeTarget - totalReferrals} indicações
                </p>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Badges de Indicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${totalReferrals >= 5 ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totalReferrals >= 5 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {totalReferrals >= 5 ? <CheckCircle className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">Recrutador</p>
                    <p className="text-xs text-gray-500">5 indicações</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${totalReferrals >= 10 ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totalReferrals >= 10 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {totalReferrals >= 10 ? <CheckCircle className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">Embaixador</p>
                    <p className="text-xs text-gray-500">10 indicações</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${totalReferrals >= 25 ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totalReferrals >= 25 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {totalReferrals >= 25 ? <CheckCircle className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">Lenda</p>
                    <p className="text-xs text-gray-500">25 indicações</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Indicadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!leaderboard || leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Seja o primeiro a indicar!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((item, index) => (
                      <div key={item.userId} className="flex items-center gap-3 p-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-orange-300 text-orange-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate">{item.userName || 'Usuário'}</span>
                        <span className="text-sm font-medium text-orange-600">
                          {item.totalReferrals}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
