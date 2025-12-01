import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Award, TrendingUp, Trophy } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile } = trpc.gamification.getProfile.useQuery();
  const { data: leaderboard } = trpc.gamification.getLeaderboard.useQuery();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const userRank = leaderboard?.findIndex(u => u.userId === user.id) ?? -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <img src="/1763037007428.png" alt="PapayaNews" className="h-8" />
            <span className="font-bold text-xl text-gray-900">PapayaNews</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Perfil do Usuário */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="w-3 h-3" />
                    Nível {profile?.points.level || 1}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {profile?.points.totalPoints || 0} pontos
                  </Badge>
                  {userRank >= 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Award className="w-3 h-3" />
                      #{userRank + 1} no ranking
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Badges Conquistados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Badges Conquistados
              </CardTitle>
              <CardDescription>
                {profile?.badges.length || 0} de 6 badges desbloqueados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.badges && profile.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {profile.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {badge.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Conquistado em{" "}
                        {new Date(badge.earnedAt!).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum badge conquistado ainda</p>
                  <p className="text-sm mt-1">
                    Continue participando para desbloquear badges!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top 10 Membros
              </CardTitle>
              <CardDescription>Os membros mais ativos da comunidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard?.map((member, index) => (
                  <div
                    key={member.userId}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      member.userId === user.id
                        ? "bg-orange-100 border-2 border-orange-300"
                        : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-400 text-yellow-900"
                          : index === 1
                          ? "bg-gray-300 text-gray-700"
                          : index === 2
                          ? "bg-orange-300 text-orange-900"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {member.userName || "Usuário"}
                        {member.userId === user.id && (
                          <span className="text-orange-600 ml-1">(Você)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        Nível {member.level} • {member.totalPoints} pontos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Como Ganhar Pontos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como Ganhar Pontos</CardTitle>
            <CardDescription>
              Participe ativamente da comunidade e ganhe recompensas!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-2xl mb-2">📖</div>
                <div className="font-semibold text-sm">Visualizar Conteúdos</div>
                <div className="text-xs text-gray-600 mt-1">+5 pontos por conteúdo</div>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold text-sm">Visualizar Eventos</div>
                <div className="text-xs text-gray-600 mt-1">+5 pontos por evento</div>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold text-sm">Comentar</div>
                <div className="text-xs text-gray-600 mt-1">+10 pontos por comentário</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
