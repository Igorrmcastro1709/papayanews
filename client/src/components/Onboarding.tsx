import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Star, 
  Flame, 
  Trophy, 
  MessageSquare, 
  Target,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
  userName?: string;
}

const steps = [
  {
    icon: Sparkles,
    title: "Bem-vindo à Comunidade PapayaNews! 🎉",
    description: "Você agora faz parte de uma comunidade exclusiva focada em IA, startups e inovação. Vamos te mostrar como aproveitar ao máximo!",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Star,
    title: "Sistema de Pontos ⭐",
    description: "Ganhe pontos ao interagir com a plataforma! Cada visualização de conteúdo vale 5 pontos e cada comentário vale 10 pontos. Acumule pontos para subir no ranking!",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Trophy,
    title: "Conquiste Badges 🏆",
    description: "Existem 6 badges para conquistar: Iniciante (0pts), Curioso (50pts), Ativo (100pts), Engajado (250pts), Expert (500pts) e Líder (1000pts). Cada badge mostra seu nível de engajamento!",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Flame,
    title: "Mantenha seu Streak 🔥",
    description: "Acesse a plataforma todos os dias para manter seu streak ativo! Quanto maior seu streak, mais você mostra seu comprometimento com a comunidade.",
    color: "from-red-500 to-orange-500"
  },
  {
    icon: Target,
    title: "Complete Desafios 🎯",
    description: "Toda semana temos novos desafios com recompensas em pontos extras. Acesse a página de Desafios para ver os desafios ativos e seu progresso!",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: MessageSquare,
    title: "Participe da Comunidade 💬",
    description: "Comente nos conteúdos, compartilhe nas redes sociais e interaja com outros membros. Quanto mais você participa, mais pontos ganha e mais badges conquista!",
    color: "from-blue-500 to-cyan-500"
  }
];

export default function Onboarding({ onComplete, userName }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("papaya_onboarding_complete", "true");
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg relative overflow-hidden">
        {/* Skip button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Progress dots */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-orange-500 w-6' 
                  : index < currentStep 
                    ? 'bg-orange-300' 
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <CardContent className="pt-12 pb-6 px-6">
          {/* Icon */}
          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center mb-6 shadow-lg`}>
            <CurrentIcon className="h-10 w-10 text-white" />
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">
              {currentStep === 0 && userName 
                ? `Bem-vindo, ${userName}! 🎉` 
                : steps[currentStep].title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} de {steps.length}
            </span>

            <Button 
              onClick={handleNext}
              className="gap-1 bg-orange-500 hover:bg-orange-600"
            >
              {currentStep === steps.length - 1 ? 'Começar!' : 'Próximo'}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para verificar se deve mostrar onboarding
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("papaya_onboarding_complete");
    if (!completed) {
      // Pequeno delay para não aparecer imediatamente
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("papaya_onboarding_complete");
    setShowOnboarding(true);
  };

  return { showOnboarding, completeOnboarding, resetOnboarding };
}
