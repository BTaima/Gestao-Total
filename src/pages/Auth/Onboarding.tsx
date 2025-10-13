import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, Bell, ChevronRight } from 'lucide-react';

const slides = [
  {
    icon: Calendar,
    title: 'Organize sua Agenda',
    description: 'Nunca mais esqueça um compromisso. Gerencie todos os seus agendamentos em um só lugar.',
    gradient: 'gradient-primary',
  },
  {
    icon: Users,
    title: 'Gerencie seus Clientes',
    description: 'Mantenha todo o histórico de atendimentos, preferências e informações importantes.',
    gradient: 'gradient-secondary',
  },
  {
    icon: DollarSign,
    title: 'Controle Financeiro',
    description: 'Acompanhe receitas, despesas e tenha relatórios completos do seu negócio.',
    gradient: 'gradient-success',
  },
  {
    icon: Bell,
    title: 'Lembretes Inteligentes',
    description: 'Receba notificações automáticas de agendamentos e clientes inativos.',
    gradient: 'gradient-hero',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Marcar que viu o onboarding
      localStorage.setItem('gestao_total_onboarding_visto', 'true');
      navigate('/login');
    }
  };

  const handleSkip = () => {
    // Marcar que viu o onboarding
    localStorage.setItem('gestao_total_onboarding_visto', 'true');
    navigate('/login');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip button */}
      <div className="pt-safe px-6 py-4 flex justify-end">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Pular
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Icon */}
          <div className={`w-32 h-32 ${slide.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg`}>
            <Icon className="w-16 h-16 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-4">
            {slide.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground text-center mb-12">
            {slide.description}
          </p>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <Button
            onClick={handleNext}
            className="w-full btn-gradient h-14 text-lg"
          >
            {currentSlide < slides.length - 1 ? (
              <>
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              'Começar'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
