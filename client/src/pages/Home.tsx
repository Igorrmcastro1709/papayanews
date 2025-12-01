import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ArrowRight, Youtube, Linkedin, Instagram, Mail, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50">
        <div className="animate-pulse text-xl text-foreground">Carregando...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    setLocation("/dashboard");
    return null;
  }

  const socialLinks = [
    { icon: Youtube, label: "YouTube", href: "https://youtube.com/@papayanews", color: "hover:text-red-600" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/papayanews", color: "hover:text-blue-600" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com/papayanews", color: "hover:text-pink-600" },
    { icon: Mail, label: "Substack", href: "https://papayanews.substack.com", color: "hover:text-orange-600" },
  ];

  const featuredContent = [
    {
      title: "Yann Le Cun – Os novos desafios da IA",
      description: "Diretor científico de IA da Meta compartilha insights sobre o futuro da inteligência artificial",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      link: "https://youtube.com",
    },
    {
      title: "Fei-Fei Li - From Words to Worlds",
      description: "Pioneira em visão computacional explora a evolução da IA generativa",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      link: "https://youtube.com",
    },
    {
      title: "PapayaNews: Principais novidades da Semana",
      description: "Resumo semanal com as principais notícias de IA, startups e inovação",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      link: "https://papayanews.substack.com",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-blue-300/20 to-orange-300/20" />
        
        <div className="container relative py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 blur-3xl opacity-30 animate-pulse" />
              <img 
                src="/papaya-logo.png" 
                alt="PapayaNews Logo" 
                className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
              />
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 bg-clip-text text-transparent animate-gradient">
                PapayaNews
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-foreground/90">
                IA, startups e notícias rápidas — direto ao ponto.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Junte-se à nossa comunidade exclusiva e tenha acesso a conteúdos sobre inteligência artificial, 
                inovação e o futuro da tecnologia.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Entrar na Comunidade
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-6 pt-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-muted-foreground transition-colors ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Preview */}
      <section className="py-16 bg-background/50 backdrop-blur-sm">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Conteúdo em Destaque
            </h2>
            <p className="text-lg text-muted-foreground">
              Faça login para acessar todo o conteúdo exclusivo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredContent.map((content, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/50">
                <div className="relative h-48 bg-gradient-to-br from-orange-200 to-purple-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                      <ExternalLink className="h-4 w-4" />
                      Conteúdo Exclusivo
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {content.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {content.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <Card className="border-2 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-foreground">
                Sobre a Comunidade
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  A <span className="font-semibold text-primary">PapayaNews</span> é sua fonte diária de inovação, 
                  trazendo as últimas novidades sobre inteligência artificial, startups e tecnologia de forma 
                  rápida e objetiva.
                </p>
                <p>
                  Nossa comunidade exclusiva oferece acesso a análises aprofundadas, entrevistas com líderes 
                  do setor, resumos semanais e conteúdos educacionais cuidadosamente selecionados.
                </p>
                <p className="font-medium text-foreground">
                  Cadastre-se agora e faça parte dessa jornada de conhecimento e inovação!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 PapayaNews. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
