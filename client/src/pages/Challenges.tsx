import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  Gift,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Eye,
  MessageSquare,
  Share2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Challenges() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: challenges = [], isLoading } = trpc.engagement.getChallenges.useQuery(undefined, {
    enabled: isAuthenticated
  });
  const { data: streak } = trpc.engagement.getStreak.useQuery(undefined, { enabled: isAuthenticated });
  const { data: badgeProgress } = trpc.engagement.getBadgeProgress.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
        <div className="animate-pulse text-xl text-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    setLocation("/");
    return null;
  }

  const getChallengeIcon = (action: string) => {
    switch (action) {
      case 'view_content': return Eye;
      case 'comment': return MessageSquare;
      case 'share': return Share2;
      default: return Target;
    }
  };

  const getChallengeColor = (action: string) => {
    switch (action) {
      case 'view_content': return 'from-blue-500 to-cyan-500';
      case 'comment': return 'from-purple-500 to-pink-500';
      case 'share': return 'from-green-500 to-emerald-500';
      default: return 'from-orange-500 to-amber-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-orange-600">Desafios</h1>
                <p className="text-xs text-muted-foreground">Complete para ganhar pontos extras</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                <Star className="h-3 w-3 mr-1" />
                {badgeProgress?.currentPoints || 0} pts
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Streak Card */}
          <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-4">
              <Flame className="h-10 w-10 text-yellow-300" />
              <div>
                <div className="text-3xl font-bold">{streak?.currentStreak || 0}</div>
                <div className="text-orange-100 text-sm">dias de streak</div>
              </div>
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-4">
              <Star className="h-10 w-10 text-yellow-300" />
              <div>
                <div className="text-3xl font-bold">{badgeProgress?.currentPoints || 0}</div>
                <div className="text-purple-100 text-sm">pontos totais</div>
              </div>
            </CardContent>
          </Card>

          {/* Next Badge Card */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-4">
              <Trophy className="h-10 w-10 text-yellow-300" />
              <div>
                <div className="text-lg font-bold">{badgeProgress?.nextBadge?.name || 'Máximo!'}</div>
                <div className="text-green-100 text-sm">
                  {badgeProgress?.pointsNeeded ? `Faltam ${badgeProgress.pointsNeeded} pts` : 'Todos conquistados'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Challenges */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-foreground">Desafios da Semana</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando desafios...</div>
          ) : challenges.length === 0 ? (
            <Card className="border-dashed border-2 border-orange-200">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-orange-300 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum desafio ativo</h3>
                <p className="text-muted-foreground">Novos desafios serão adicionados em breve!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge: any) => {
                const IconComponent = getChallengeIcon(challenge.targetAction);
                const colorClass = getChallengeColor(challenge.targetAction);
                const progress = Math.min((challenge.currentProgress / challenge.targetCount) * 100, 100);
                const isCompleted = challenge.currentProgress >= challenge.targetCount;
                const daysLeft = differenceInDays(new Date(challenge.endDate), new Date());

                return (
                  <Card key={challenge.id} className={`relative overflow-hidden ${isCompleted ? 'ring-2 ring-green-500' : ''}`}>
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-2`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">
                              {challenge.currentProgress} / {challenge.targetCount}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {/* Reward */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm">
                            <Gift className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-orange-600">+{challenge.pointsReward} pts</span>
                          </div>
                          {!isCompleted && daysLeft > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {daysLeft} dias restantes
                            </div>
                          )}
                        </div>

                        {isCompleted && (
                          <Badge className="w-full justify-center bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Desafio Completado!
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Tips Section */}
        <section>
          <Card className="bg-gradient-to-r from-orange-100 to-amber-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 rounded-full p-3">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Dicas para ganhar mais pontos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Acesse a plataforma todos os dias para manter seu streak</li>
                    <li>• Comente nos conteúdos para ganhar 10 pontos cada</li>
                    <li>• Compartilhe conteúdos nas redes sociais</li>
                    <li>• Complete os desafios semanais para bônus extras</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
