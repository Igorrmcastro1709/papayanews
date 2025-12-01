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
  User
} from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50">
        <div className="animate-pulse text-xl text-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    setLocation("/");
    return null;
  }

  const featuredVideos = [
    {
      title: "Yann Le Cun – Os novos desafios da IA",
      description: "Diretor científico de IA da Meta compartilha insights sobre o futuro da inteligência artificial",
      link: "https://www.youtube.com/watch?v=example1",
      platform: "YouTube",
    },
    {
      title: "Fei-Fei Li - From Words to Worlds",
      description: "Pioneira em visão computacional explora a evolução da IA generativa",
      link: "https://www.youtube.com/watch?v=example2",
      platform: "YouTube",
    },
    {
      title: "Luciano Digiampietri - Ciência de dados (UNIVESP/USP)",
      description: "Canal dedicado ao compartilhamento de videoaulas sobre computação e ciência de dados",
      link: "https://www.youtube.com/@LucianoDigiampietri",
      platform: "YouTube",
    },
  ];

  const weeklyHighlights = [
    {
      title: "PapayaNews: Principais novidades da Semana",
      description: "Foco especial: Google puxa a nova fronteira da IA generativa",
      link: "https://papayanews.substack.com",
      date: "24/11/2024",
    },
  ];

  const socialLinks = [
    { 
      icon: Youtube, 
      label: "YouTube", 
      href: "https://youtube.com/@papayanews", 
      color: "bg-red-500 hover:bg-red-600",
      description: "Vídeos e entrevistas exclusivas"
    },
    { 
      icon: Linkedin, 
      label: "LinkedIn", 
      href: "https://linkedin.com/company/papayanews", 
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Artigos profissionais e networking"
    },
    { 
      icon: Instagram, 
      label: "Instagram", 
      href: "https://instagram.com/papayanews", 
      color: "bg-pink-500 hover:bg-pink-600",
      description: "Conteúdo visual e stories"
    },
    { 
      icon: Mail, 
      label: "Substack", 
      href: "https://papayanews.substack.com", 
      color: "bg-orange-500 hover:bg-orange-600",
      description: "Newsletter semanal"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/papaya-logo.png" 
                alt="PapayaNews" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  PapayaNews
                </h1>
                <p className="text-sm text-muted-foreground">Comunidade Exclusiva</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{user.name || user.email}</span>
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
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Welcome Section */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">
                Bem-vindo(a), {user.name?.split(' ')[0] || 'Membro'}!
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Explore os conteúdos exclusivos da comunidade PapayaNews sobre IA, startups e inovação.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Featured Videos */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Youtube className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-foreground">Vídeos em Destaque</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVideos.map((video, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => window.open(video.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Assistir no {video.platform}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Weekly Highlights */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-6 w-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-foreground">Destaques da Semana</h2>
          </div>
          
          <div className="grid gap-6">
            {weeklyHighlights.map((highlight, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{highlight.title}</CardTitle>
                      <CardDescription className="text-base">
                        {highlight.description}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mt-2">
                        Publicado em {highlight.date}
                      </p>
                    </div>
                    <Button 
                      onClick={() => window.open(highlight.link, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ler no Substack
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Conecte-se Conosco</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialLinks.map((social) => (
              <Card 
                key={social.label} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                onClick={() => window.open(social.href, '_blank')}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`p-4 rounded-full ${social.color} text-white transition-transform group-hover:scale-110`}>
                    <social.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{social.label}</h3>
                    <p className="text-sm text-muted-foreground">
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
          <Card className="border-2 border-secondary/50 bg-gradient-to-br from-green-50 to-teal-50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                Conteúdo Especial
              </CardTitle>
              <CardDescription>
                Explore criações exclusivas da comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div>
                    <h4 className="font-semibold text-foreground">PapayaSong - L'Algorithme du Rêve</h4>
                    <p className="text-sm text-muted-foreground">Música gerada por IA sobre o futuro da tecnologia</p>
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={() => window.open('https://suno.ai', '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ouvir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-card mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 PapayaNews. Todos os direitos reservados.</p>
          <p className="mt-2">Comunidade exclusiva para membros</p>
        </div>
      </footer>
    </div>
  );
}
