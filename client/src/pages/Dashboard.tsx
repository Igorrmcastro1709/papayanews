import { useAuth } from "@/_core/hooks/useAuth";
import { Search as SearchIcon, Flame, Trophy, Star, TrendingUp, Award, ChevronRight } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import SocialShare from "@/components/SocialShare";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { 
  Youtube, 
  Linkedin, 
  Instagram, 
  Mail, 
  ExternalLink, 
  BookOpen,
  Sparkles,
  LogOut,
  User,
  Menu,
  X,
  Home as HomeIcon,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Settings,
  MessageCircle,
  Users,
  Archive,
  FolderOpen,
  Gift,
  ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import Onboarding, { useOnboarding } from "@/components/Onboarding";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Buscar dados
  const { data: featuredContent = [], isLoading: loadingContent } = trpc.content.list.useQuery();
  const { data: events = [], isLoading: loadingEvents } = trpc.events.list.useQuery();
  const { data: streak } = trpc.engagement.getStreak.useQuery(undefined, { enabled: isAuthenticated });
  const { data: badgeProgress } = trpc.engagement.getBadgeProgress.useQuery(undefined, { enabled: isAuthenticated });
  const { data: topMembers = [] } = trpc.engagement.getTopMembers.useQuery();
  
  // Atualizar streak ao entrar
  const updateStreakMutation = trpc.engagement.updateStreak.useMutation();
  
  // Processar código de referral pendente
  const registerReferralMutation = trpc.referral.registerReferral.useMutation({
    onSuccess: () => {
      toast.success("🎉 Parabéns! Você ganhou 200 pontos de bônus por indicação!");
      localStorage.removeItem('pending_referral_code');
      localStorage.setItem('referral_used', 'true');
    },
    onError: () => {
      localStorage.removeItem('pending_referral_code');
    }
  });
  
  useEffect(() => {
    if (isAuthenticated && user) {
      updateStreakMutation.mutate();
      
      // Verificar se há código de referral pendente
      const pendingCode = localStorage.getItem('pending_referral_code');
      const alreadyUsed = localStorage.getItem('referral_used');
      if (pendingCode && !alreadyUsed) {
        registerReferralMutation.mutate({ code: pendingCode });
      }
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      toast.success("Logout realizado com sucesso");
      setLocation("/");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

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

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("vídeo") || categoryLower.includes("video")) return Youtube;
    if (categoryLower.includes("newsletter")) return Mail;
    if (categoryLower.includes("canal")) return Youtube;
    return BookOpen;
  };

  const socialLinks = [
    { icon: Youtube, label: "YouTube", href: "https://youtube.com/@papayanews", color: "bg-red-500" },
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/papaya-news-ai/", color: "bg-blue-600" },
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/papayanews2025/", color: "bg-pink-500" },
    { icon: Mail, label: "Substack", href: "https://ppapayanews.substack.com/", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding onComplete={completeOnboarding} userName={user.name?.split(' ')[0]} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/papaya-logo.png" alt="PapayaNews" className="h-10 w-10" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-orange-600">PapayaNews</h1>
                <p className="text-xs text-muted-foreground">Área de Membros</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/search")}>
                <SearchIcon className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/chat")}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/calendar")}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/members")}>
                <Users className="h-4 w-4 mr-2" />
                Membros
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/archive")}>
                <Archive className="h-4 w-4 mr-2" />
                Arquivo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/library")}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Biblioteca
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/shop")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Loja
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/referral")}>
                <Gift className="h-4 w-4 mr-2" />
                Indicar
              </Button>
              <NotificationBell />
              <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
                <User className="h-4 w-4 mr-2" />
                {user.name?.split(' ')[0] || 'Perfil'}
              </Button>
              {user.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-orange-100 py-4 px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/search"); setMobileMenuOpen(false); }}>
              <SearchIcon className="h-4 w-4 mr-2" /> Buscar
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/chat"); setMobileMenuOpen(false); }}>
              <MessageCircle className="h-4 w-4 mr-2" /> Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/calendar"); setMobileMenuOpen(false); }}>
              <CalendarIcon className="h-4 w-4 mr-2" /> Calendário
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/members"); setMobileMenuOpen(false); }}>
              <Users className="h-4 w-4 mr-2" /> Membros
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/archive"); setMobileMenuOpen(false); }}>
              <Archive className="h-4 w-4 mr-2" /> Arquivo
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/library"); setMobileMenuOpen(false); }}>
              <FolderOpen className="h-4 w-4 mr-2" /> Biblioteca
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/shop"); setMobileMenuOpen(false); }}>
              <ShoppingBag className="h-4 w-4 mr-2" /> Loja
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/referral"); setMobileMenuOpen(false); }}>
              <Gift className="h-4 w-4 mr-2" /> Indicar Amigos
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/profile"); setMobileMenuOpen(false); }}>
              <User className="h-4 w-4 mr-2" /> Meu Perfil
            </Button>
            {user.role === 'admin' && (
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setLocation("/admin"); setMobileMenuOpen(false); }}>
                <Settings className="h-4 w-4 mr-2" /> Admin
              </Button>
            )}
            <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome + Streak Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Welcome Card */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Olá, {user.name?.split(' ')[0] || 'Membro'}! 👋
                  </h2>
                  <p className="text-orange-100 mb-4">
                    Explore os conteúdos exclusivos sobre IA, startups e inovação
                  </p>
                  
                  {/* Badge Progress */}
                  {badgeProgress && badgeProgress.nextBadge && (
                    <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Próximo badge: {badgeProgress.nextBadge.name}</span>
                        <span className="text-sm">{badgeProgress.currentPoints} / {badgeProgress.nextBadge.pointsRequired} pts</span>
                      </div>
                      <Progress value={badgeProgress.progress} className="h-2 bg-white/30" />
                      <p className="text-xs text-orange-100 mt-1">
                        Faltam {badgeProgress.pointsNeeded} pontos para conquistar!
                      </p>
                    </div>
                  )}
                </div>
                <Sparkles className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white border-0 shadow-lg">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <Flame className="h-12 w-12 mb-2 text-yellow-300" />
              <div className="text-4xl font-bold">{streak?.currentStreak || 0}</div>
              <div className="text-orange-100 text-sm">dias de streak</div>
              {streak && streak.longestStreak > 0 && (
                <div className="text-xs text-orange-200 mt-2">
                  Recorde: {streak.longestStreak} dias
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content & Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Content */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange-500" />
                  Conteúdo em Destaque
                </h3>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingContent ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">Carregando...</div>
                ) : featuredContent.slice(0, 4).map((content: any) => {
                  const IconComponent = getCategoryIcon(content.category);
                  return (
                    <Card key={content.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-orange-100">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                            {content.category}
                          </Badge>
                          <IconComponent className="h-5 w-5 text-orange-400" />
                        </div>
                        <CardTitle className="text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {content.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {content.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600" asChild>
                            <a href={content.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" /> Acessar
                            </a>
                          </Button>
                          <SocialShare title={content.title} description={content.description} url={content.link} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Events */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-green-500" />
                  Próximos Eventos
                </h3>
              </div>
              
              <div className="space-y-3">
                {loadingEvents ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : events.length === 0 ? (
                  <Card className="border-dashed border-2 border-green-200">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhum evento programado no momento
                    </CardContent>
                  </Card>
                ) : events.slice(0, 3).map((event: any) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow border-green-100">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 rounded-lg p-3 text-center min-w-[60px]">
                          <div className="text-2xl font-bold text-green-600">
                            {format(new Date(event.eventDate), 'dd')}
                          </div>
                          <div className="text-xs text-green-700 uppercase">
                            {format(new Date(event.eventDate), 'MMM', { locale: ptBR })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(event.eventDate), 'HH:mm')}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                        {event.link && (
                          <Button size="sm" variant="outline" className="shrink-0" asChild>
                            <a href={event.link} target="_blank" rel="noopener noreferrer">
                              Inscrever
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Top Members */}
            <Card className="border-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Membros
                </CardTitle>
                <CardDescription>Ranking da semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topMembers.slice(0, 5).map((member: any, index: number) => (
                    <div key={member.userId} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {member.userName || 'Membro'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.totalPoints} pts
                        </div>
                      </div>
                      {index < 3 && (
                        <Award className={`h-4 w-4 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-500'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4 text-orange-600" onClick={() => setLocation("/profile")}>
                  Ver meu perfil
                </Button>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Siga a PapayaNews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((link) => (
                    <Button
                      key={link.label}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      asChild
                    >
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        <link.icon className="h-4 w-4 mr-2" />
                        {link.label}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-200" />
                  <div>
                    <div className="text-2xl font-bold">{badgeProgress?.currentPoints || 0}</div>
                    <div className="text-green-100 text-sm">Seus pontos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
