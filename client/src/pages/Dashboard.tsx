import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Home as HomeIcon
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
        <div className="animate-pulse text-xl text-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    setLocation("/");
    return null;
  }

  const featuredContent = [
    {
      title: "Yann Le Cun – Os novos desafios da IA",
      description: "Diretor científico de IA da Meta compartilha insights sobre o futuro da inteligência artificial",
      link: "https://www.youtube.com/watch?v=example1",
      category: "Vídeo",
      icon: Youtube,
    },
    {
      title: "Fei-Fei Li - From Words to Worlds",
      description: "Pioneira em visão computacional explora a evolução da IA generativa",
      link: "https://www.youtube.com/watch?v=example2",
      category: "Vídeo",
      icon: Youtube,
    },
    {
      title: "Luciano Digiampietri - Ciência de dados",
      description: "Canal dedicado ao compartilhamento de videoaulas sobre computação",
      link: "https://www.youtube.com/@LucianoDigiampietri",
      category: "Canal",
      icon: Youtube,
    },
    {
      title: "PapayaNews: Novidades da Semana",
      description: "Foco especial: Google puxa a nova fronteira da IA generativa",
      link: "https://papayanews.substack.com",
      category: "Newsletter",
      icon: Mail,
    },
  ];

  const socialLinks = [
    { 
      icon: Youtube, 
      label: "YouTube", 
      href: "https://youtube.com/@papayanews", 
      color: "bg-red-500",
      description: "Vídeos exclusivos"
    },
    { 
      icon: Linkedin, 
      label: "LinkedIn", 
      href: "https://www.linkedin.com/company/papaya-news-ai/", 
      color: "bg-blue-600",
      description: "Artigos profissionais"
    },
    { 
      icon: Instagram, 
      label: "Instagram", 
      href: "https://instagram.com/papayanews", 
      color: "bg-pink-500",
      description: "Conteúdo visual"
    },
    { 
      icon: Mail, 
      label: "Substack", 
      href: "https://papayanews.substack.com", 
      color: "bg-orange-500",
      description: "Newsletter semanal"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/papaya-logo.png" 
                alt="PapayaNews" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  PapayaNews
                </h1>
                <p className="hidden sm:block text-xs text-muted-foreground">Área de Membros</p>
              </div>
            </div>
            
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {user.name?.split(' ')[0] || user.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {user.name || user.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container py-6 md:py-10 space-y-8">
        {/* Welcome Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 overflow-hidden">
          <CardHeader className="relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-3">
              <div className="p-3 bg-white rounded-full shadow-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl mb-2">
                  Bem-vindo(a), {user.name?.split(' ')[0] || 'Membro'}! 👋
                </CardTitle>
                <CardDescription className="text-base text-foreground/70">
                  Explore os conteúdos exclusivos sobre IA, startups e inovação
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Featured Content Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Conteúdo em Destaque</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {featuredContent.map((content, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer"
                onClick={() => window.open(content.link, '_blank')}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <content.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary">{content.category}</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {content.title}
                      </CardTitle>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  <CardDescription className="text-sm line-clamp-2">
                    {content.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <HomeIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Nossas Redes</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {socialLinks.map((social) => (
              <Card 
                key={social.label} 
                className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => window.open(social.href, '_blank')}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`p-4 rounded-full ${social.color} text-white transition-transform group-hover:scale-110 shadow-lg`}>
                    <social.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1">{social.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {social.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Special Content */}
        <section>
          <Card className="border-2 border-secondary/50 bg-gradient-to-br from-green-50 to-teal-50 overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <CardTitle className="text-xl">Conteúdo Especial</CardTitle>
              </div>
              <CardDescription>
                Criações exclusivas da comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border-2 hover:border-secondary/50 transition-all cursor-pointer"
                onClick={() => window.open('https://suno.ai', '_blank')}
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">PapayaSong - L'Algorithme du Rêve</h4>
                  <p className="text-sm text-muted-foreground">Música gerada por IA sobre o futuro da tecnologia</p>
                </div>
                <Button 
                  variant="secondary"
                  size="sm"
                  className="gap-2 w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvir
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-white/80 backdrop-blur-sm mt-12">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 PapayaNews. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Comunidade exclusiva para membros
          </p>
        </div>
      </footer>
    </div>
  );
}
