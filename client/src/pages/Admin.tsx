import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Calendar, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"content" | "events" | "analytics">("content");

  // Estados para formulários
  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    link: "",
    category: "video",
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    link: "",
  });

  const [editingContent, setEditingContent] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<number | null>(null);

  // Queries
  const { data: contents, refetch: refetchContents } = trpc.admin.listContent.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const { data: events, refetch: refetchEvents } = trpc.admin.listEvents.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const { data: analytics, isLoading: loadingAnalytics } = trpc.analytics.getStats.useQuery(undefined, {
    enabled: user?.role === "admin" && activeTab === "analytics",
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Mutations - Conteúdos
  const createContent = trpc.admin.createContent.useMutation({
    onSuccess: () => {
      toast.success("Conteúdo criado com sucesso!");
      refetchContents();
      setContentForm({ title: "", description: "", link: "", category: "video" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar conteúdo");
    },
  });

  const updateContent = trpc.admin.updateContent.useMutation({
    onSuccess: () => {
      toast.success("Conteúdo atualizado com sucesso!");
      refetchContents();
      setEditingContent(null);
      setContentForm({ title: "", description: "", link: "", category: "video" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar conteúdo");
    },
  });

  const deleteContent = trpc.admin.deleteContent.useMutation({
    onSuccess: () => {
      toast.success("Conteúdo removido com sucesso!");
      refetchContents();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover conteúdo");
    },
  });

  // Mutations - Eventos
  const createEvent = trpc.admin.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      refetchEvents();
      setEventForm({ title: "", description: "", eventDate: "", location: "", link: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar evento");
    },
  });

  const updateEvent = trpc.admin.updateEvent.useMutation({
    onSuccess: () => {
      toast.success("Evento atualizado com sucesso!");
      refetchEvents();
      setEditingEvent(null);
      setEventForm({ title: "", description: "", eventDate: "", location: "", link: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar evento");
    },
  });

  const deleteEvent = trpc.admin.deleteEvent.useMutation({
    onSuccess: () => {
      toast.success("Evento removido com sucesso!");
      refetchEvents();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover evento");
    },
  });

  // Handlers
  const handleCreateContent = () => {
    if (!contentForm.title || !contentForm.link) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingContent) {
      updateContent.mutate({ id: editingContent, ...contentForm });
    } else {
      createContent.mutate(contentForm);
    }
  };

  const handleEditContent = (content: any) => {
    setEditingContent(content.id);
    setContentForm({
      title: content.title,
      description: content.description,
      link: content.link,
      category: content.category,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateEvent = () => {
    if (!eventForm.title || !eventForm.eventDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const eventData = {
      ...eventForm,
      eventDate: new Date(eventForm.eventDate),
      link: eventForm.link || undefined,
    };

    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent, ...eventData });
    } else {
      createEvent.mutate(eventData);
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event.id);
    setEventForm({
      title: event.title,
      description: event.description,
      eventDate: new Date(event.eventDate).toISOString().split("T")[0],
      location: event.location,
      link: event.link || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/dashboard")} className="w-full">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-600">Gerencie conteúdos e eventos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === "content" ? "default" : "outline"}
            onClick={() => setActiveTab("content")}
          >
            Conteúdos Destacados
          </Button>
          <Button
            variant={activeTab === "events" ? "default" : "outline"}
            onClick={() => setActiveTab("events")}
          >
            Eventos
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "outline"}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </Button>
        </div>

        {/* Conteúdos Tab */}
        {activeTab === "content" && (
          <div className="space-y-8">
            {/* Formulário */}
            <Card>
              <CardHeader>
                <CardTitle>{editingContent ? "Editar Conteúdo" : "Novo Conteúdo"}</CardTitle>
                <CardDescription>
                  Adicione vídeos, artigos e outros conteúdos para a comunidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="content-title">Título *</Label>
                    <Input
                      id="content-title"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                      placeholder="Ex: Yann LeCun – Os novos desafios da IA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content-category">Categoria *</Label>
                    <Select
                      value={contentForm.category}
                      onValueChange={(value) => setContentForm({ ...contentForm, category: value })}
                    >
                      <SelectTrigger id="content-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="article">Artigo</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="canal">Canal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-link">Link *</Label>
                  <Input
                    id="content-link"
                    type="url"
                    value={contentForm.link}
                    onChange={(e) => setContentForm({ ...contentForm, link: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-description">Descrição</Label>
                  <Textarea
                    id="content-description"
                    value={contentForm.description}
                    onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                    placeholder="Breve descrição do conteúdo"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateContent}
                    disabled={createContent.isPending || updateContent.isPending}
                  >
                    {createContent.isPending || updateContent.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {editingContent ? "Atualizar" : "Criar"} Conteúdo
                      </>
                    )}
                  </Button>
                  {editingContent && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingContent(null);
                        setContentForm({ title: "", description: "", link: "", category: "video" });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Conteúdos */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Conteúdos Cadastrados</h2>
              {contents && contents.length > 0 ? (
                <div className="grid gap-4">
                  {contents.map((content: any) => (
                    <Card key={content.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {content.category}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{content.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                            <a
                              href={content.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <LinkIcon className="h-3 w-3" />
                              {content.link}
                            </a>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditContent(content)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja remover este conteúdo?")) {
                                  deleteContent.mutate({ id: content.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Nenhum conteúdo cadastrado ainda
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Eventos Tab */}
        {activeTab === "events" && (
          <div className="space-y-8">
            {/* Formulário */}
            <Card>
              <CardHeader>
                <CardTitle>{editingEvent ? "Editar Evento" : "Novo Evento"}</CardTitle>
                <CardDescription>Crie eventos para a comunidade PapayaNews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Título *</Label>
                    <Input
                      id="event-title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Ex: Workshop: IA Generativa na Prática"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Data *</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-location">Local *</Label>
                  <Input
                    id="event-location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Ex: Online via Zoom ou São Paulo - SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-link">Link (opcional)</Label>
                  <Input
                    id="event-link"
                    type="url"
                    value={eventForm.link}
                    onChange={(e) => setEventForm({ ...eventForm, link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-description">Descrição *</Label>
                  <Textarea
                    id="event-description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Descrição do evento"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateEvent}
                    disabled={createEvent.isPending || updateEvent.isPending}
                  >
                    {createEvent.isPending || updateEvent.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {editingEvent ? "Atualizar" : "Criar"} Evento
                      </>
                    )}
                  </Button>
                  {editingEvent && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingEvent(null);
                        setEventForm({
                          title: "",
                          description: "",
                          eventDate: "",
                          location: "",
                          link: "",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Eventos */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Eventos Cadastrados</h2>
              {events && events.length > 0 ? (
                <div className="grid gap-4">
                  {events.map((event: any) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                            <div className="space-y-1 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.eventDate).toLocaleDateString("pt-BR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                {event.location}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            {event.link && (
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline mt-2 inline-block"
                              >
                                Ver mais informações
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEditEvent(event)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja remover este evento?")) {
                                  deleteEvent.mutate({ id: event.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Nenhum evento cadastrado ainda
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics ? (
              <>
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total de Membros</CardDescription>
                      <CardTitle className="text-3xl">{analytics.totalMembers}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Membros Ativos (30 dias)</CardDescription>
                      <CardTitle className="text-3xl">{analytics.activeMembers}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Visualizações de Conteúdo</CardDescription>
                      <CardTitle className="text-3xl">{analytics.totalContentViews}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Visualizações de Eventos</CardDescription>
                      <CardTitle className="text-3xl">{analytics.totalEventViews}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Conteúdos Mais Acessados */}
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdos Mais Acessados</CardTitle>
                    <CardDescription>Top 5 conteúdos com mais visualizações</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.topContent && analytics.topContent.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.topContent.map((item: any, index: number) => {
                          const content = contents?.find((c: any) => c.id === item.contentId);
                          return (
                            <div key={item.contentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                <div>
                                  <p className="font-medium">{content?.title || `Conteúdo #${item.contentId}`}</p>
                                  <p className="text-sm text-gray-600">{content?.category}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{item.views}</p>
                                <p className="text-xs text-gray-600">visualizações</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Nenhuma visualização registrada ainda</p>
                    )}
                  </CardContent>
                </Card>

                {/* Eventos Mais Visualizados */}
                <Card>
                  <CardHeader>
                    <CardTitle>Eventos Mais Visualizados</CardTitle>
                    <CardDescription>Top 5 eventos com mais interesse</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.topEvents && analytics.topEvents.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.topEvents.map((item: any, index: number) => {
                          const event = events?.find((e: any) => e.id === item.eventId);
                          return (
                            <div key={item.eventId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                <div>
                                  <p className="font-medium">{event?.title || `Evento #${item.eventId}`}</p>
                                  <p className="text-sm text-gray-600">{event?.location}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{item.views}</p>
                                <p className="text-xs text-gray-600">visualizações</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Nenhuma visualização registrada ainda</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Erro ao carregar analytics
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
