import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  Youtube, 
  Linkedin, 
  Instagram, 
  Mail, 
  Sparkles,
  CheckCircle2,
  Loader2,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Signup form states
  const [signupStep, setSignupStep] = useState<"form" | "verify">("form");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [devCode, setDevCode] = useState("");

  const requestCodeMutation = trpc.signup.requestCode.useMutation();
  const verifyCodeMutation = trpc.signup.verifyCode.useMutation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    setLocation("/dashboard");
    return null;
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await requestCodeMutation.mutateAsync(formData);
      toast.success(result.message);
      setDevCode(result.devCode || "");
      setSignupStep("verify");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar código");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await verifyCodeMutation.mutateAsync({
        email: formData.email,
        code: verificationCode,
      });
      toast.success(result.message);
      
      // Redirecionar para login OAuth após 2 segundos
      setTimeout(() => {
        window.location.href = getLoginUrl();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Código inválido");
    }
  };

  const socialLinks = [
    { icon: Youtube, label: "YouTube", href: "https://youtube.com/@papayanews", gradient: "from-red-500 to-red-600" },
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/papaya-news-ai/", gradient: "from-blue-600 to-blue-700" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com/papayanews", gradient: "from-pink-500 to-purple-600" },
    { icon: Mail, label: "Substack", href: "https://papayanews.substack.com", gradient: "from-orange-500 to-yellow-500" },
  ];

  const benefits = [
    { icon: Sparkles, title: "Conteúdo Exclusivo", description: "Acesso a análises aprofundadas e insights únicos" },
    { icon: Youtube, title: "Vídeos Premium", description: "Entrevistas com líderes e especialistas em IA" },
    { icon: Mail, title: "Newsletter Semanal", description: "Resumos curados das principais notícias" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                <p className="hidden sm:block text-xs text-muted-foreground">Inovação & IA</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#beneficios" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Benefícios
              </a>
              <a href="#cadastro" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Cadastrar
              </a>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Já sou membro
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
              <a 
                href="#beneficios" 
                className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefícios
              </a>
              <a 
                href="#cadastro" 
                className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cadastrar
              </a>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Já sou membro
              </Button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-transparent to-purple-100/50" />
        
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-sm font-medium text-orange-700">
                <Sparkles className="h-4 w-4" />
                Comunidade Exclusiva
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 bg-clip-text text-transparent">
                  PapayaNews
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground/90">
                IA, startups e notícias rápidas — direto ao ponto.
              </p>
              
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Junte-se a uma comunidade de inovadores e tenha acesso a conteúdos exclusivos sobre 
                inteligência artificial, startups e o futuro da tecnologia.
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${social.gradient} text-white text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                  >
                    <social.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Right Column - Logo */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 blur-3xl opacity-30 animate-pulse" />
                <img 
                  src="/papaya-logo.png" 
                  alt="PapayaNews Logo" 
                  className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-12 md:py-20 bg-white/50 backdrop-blur-sm">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que fazer parte?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Acesso exclusivo a conteúdos premium sobre IA e inovação
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section id="cadastro" className="py-12 md:py-20">
        <div className="container max-w-md">
          <Card className="border-2 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl">
                {signupStep === "form" ? "Cadastre-se Agora" : "Verifique seu Email"}
              </CardTitle>
              <CardDescription className="text-base">
                {signupStep === "form" 
                  ? "Preencha seus dados para receber o código de verificação" 
                  : `Enviamos um código para ${formData.email}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signupStep === "form" ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    disabled={requestCodeMutation.isPending}
                  >
                    {requestCodeMutation.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...</>
                    ) : (
                      <>Enviar Código <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {devCode && (
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-1">🔧 Modo Desenvolvimento</p>
                      <p className="text-xs text-yellow-700">Código: <span className="font-mono font-bold text-lg">{devCode}</span></p>
                    </div>
                  )}
                  
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código de Verificação</Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                        maxLength={6}
                        className="h-12 text-center text-2xl font-mono tracking-widest"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      disabled={verifyCodeMutation.isPending || verificationCode.length !== 6}
                    >
                      {verifyCodeMutation.isPending ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...</>
                      ) : (
                        <><CheckCircle2 className="mr-2 h-5 w-5" /> Verificar Código</>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setSignupStep("form");
                        setVerificationCode("");
                        setDevCode("");
                      }}
                    >
                      Voltar
                    </Button>
                  </form>
                </div>
              )}

              <div className="mt-6 pt-6 border-t space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Já tem cadastro?
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  Login com Manus OAuth
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t bg-white/80 backdrop-blur-sm">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 PapayaNews. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Sua fonte diária de inovação, startups e IA
          </p>
        </div>
      </footer>
    </div>
  );
}
