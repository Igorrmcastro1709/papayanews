import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";

type Event = {
  id: number;
  title: string;
  description: string;
  eventDate: Date;
  location: string | null;
  link: string | null;
  imageUrl: string | null;
  active: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function Calendar() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events = [], isLoading } = trpc.events.list.useQuery();

  // Obter primeiro e último dia do mês
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Dia da semana do primeiro dia (0 = Domingo)
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Total de dias no mês
  const daysInMonth = lastDayOfMonth.getDate();

  // Gerar array de dias para o calendário
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    
    // Adicionar dias vazios antes do primeiro dia
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }, [startingDayOfWeek, daysInMonth]);

  // Verificar se um dia tem eventos
  const getEventsForDay = (day: number) => {
    return events.filter((event: Event) => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  // Eventos do dia selecionado
  const selectedDayEvents = selectedDate
    ? events.filter((event: Event) => {
        const eventDate = new Date(event.eventDate);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  // Próximos eventos (ordenados por data)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event: Event) => new Date(event.eventDate) >= now)
      .sort((a: Event, b: Event) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 5);
  }, [events]);

  // Navegação do mês
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Verificar se é hoje
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Calcular dias até o evento
  const getDaysUntil = (eventDate: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje!";
    if (diffDays === 1) return "Amanhã";
    if (diffDays < 0) return "Passou";
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    if (diffDays <= 30) return `Em ${Math.ceil(diffDays / 7)} semanas`;
    return `Em ${Math.ceil(diffDays / 30)} meses`;
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 flex items-center justify-center">
        <div className="animate-pulse text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <CardTitle>Calendário de Eventos</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Faça login para ver o calendário de eventos da comunidade PapayaNews.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                Voltar para Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Calendário de Eventos</h1>
                <p className="text-xs text-muted-foreground">
                  {events.length} eventos cadastrados
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendário Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Hoje
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dayEvents = getEventsForDay(day);
                    const hasEvents = dayEvents.length > 0;
                    const isSelected =
                      selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === currentDate.getMonth() &&
                      selectedDate?.getFullYear() === currentDate.getFullYear();

                    return (
                      <button
                        key={day}
                        onClick={() =>
                          setSelectedDate(
                            new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                          )
                        }
                        className={`
                          aspect-square rounded-lg flex flex-col items-center justify-center relative
                          transition-all hover:bg-orange-100
                          ${isToday(day) ? "bg-orange-500 text-white hover:bg-orange-600" : ""}
                          ${isSelected && !isToday(day) ? "bg-orange-200 ring-2 ring-orange-500" : ""}
                          ${!isToday(day) && !isSelected ? "hover:bg-orange-50" : ""}
                        `}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        {hasEvents && (
                          <div className="flex gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isToday(day) ? "bg-white" : "bg-orange-500"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Eventos do dia selecionado */}
                {selectedDate && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-3">
                      Eventos em {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </h3>
                    {selectedDayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDayEvents.map((event: Event) => (
                          <div
                            key={event.id}
                            className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{event.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                  {event.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {event.link && (
                                <a
                                  href={event.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0"
                                >
                                  <Button size="sm" variant="outline">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Nenhum evento neste dia.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Próximos Eventos */}
          <div className="space-y-4">
            {/* Data e hora atual */}
            <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm opacity-90">Hoje</p>
                  <p className="text-2xl font-bold">
                    {new Date().toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-lg mt-1">
                    {new Date().toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Próximos eventos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-orange-500" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event: Event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-orange-50 border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
                      onClick={() => {
                        const eventDate = new Date(event.eventDate);
                        setCurrentDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
                        setSelectedDate(eventDate);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm truncate">{event.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.eventDate).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 text-xs ${
                            getDaysUntil(new Date(event.eventDate)) === "Hoje!"
                              ? "bg-orange-500 text-white"
                              : getDaysUntil(new Date(event.eventDate)) === "Amanhã"
                              ? "bg-amber-500 text-white"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {getDaysUntil(new Date(event.eventDate))}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum evento próximo
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Legenda */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Legenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-500" />
                  <span>Hoje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-200 ring-2 ring-orange-500" />
                  <span>Dia selecionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  </div>
                  <span>Dia com eventos</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
