import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Calendar, Link as LinkIcon, ShoppingBag, Package } from "lucide-react";
import NewsletterEditor from "@/components/NewsletterEditor";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"content" | "events" | "analytics" | "newsletter" | "shop">("content");

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
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    category: "physical" as "physical" | "digital" | "experience" | "badge",
    pointsPrice: 100,
    cashPrice: 0,
    stock: 10,
    minLevel: 1,
    isLimited: false,
  });
  const [newsletterForm, setNewsletterForm] = useState<{
    editing: boolean;
    id: number | null;
    title: string;
    subject: string;
    content: string;
  }>({
    editing: false,
    id: null,
    title: "",
    subject: "",
    content: "",
  });

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

  const { data: newsletters, refetch: refetchNewsletters } = trpc.newsletter.list.useQuery(undefined, {
    enabled: user?.role === "admin" && activeTab === "newsletter",
  });

  const { data: products, refetch: refetchProducts } = trpc.shop.getProducts.useQuery(undefined, {
    enabled: user?.role === "admin" && activeTab === "shop",
  });

  const { data: shopOrders } = trpc.shop.getAllOrders.useQuery(undefined, {
    enabled: user?.role === "admin" && activeTab === "shop",
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

  // Mutations - Newsletters
  const createNewsletterMutation = trpc.newsletter.create.useMutation({
    onSuccess: () => {
      toast.success("Newsletter criada com sucesso!");
      refetchNewsletters();
      setNewsletterForm({ editing: false, id: null, title: "", subject: "", content: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar newsletter");
    },
  });

  const updateNewsletterMutation = trpc.newsletter.update.useMutation({
    onSuccess: () => {
      toast.success("Newsletter atualizada com sucesso!");
      refetchNewsletters();
      setNewsletterForm({ editing: false, id: null, title: "", subject: "", content: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar newsletter");
    },
  });

  const deleteNewsletterMutation = trpc.newsletter.delete.useMutation({
    onSuccess: () => {
      toast.success("Newsletter removida com sucesso!");
      refetchNewsletters();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover newsletter");
    },
  });

  // Mutations - Produtos
  const createProduct = trpc.shop.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      refetchProducts();
      setProductForm({ name: "", description: "", imageUrl: "", category: "physical", pointsPrice: 100, cashPrice: 0, stock: 10, minLevel: 1, isLimited: false });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar produto");
    },
  });

  const updateProduct = trpc.shop.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      refetchProducts();
      setEditingProduct(null);
      setProductForm({ name: "", description: "", imageUrl: "", category: "physical", pointsPrice: 100, cashPrice: 0, stock: 10, minLevel: 1, isLimited: false });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar produto");
    },
  });

  const deleteProduct = trpc.shop.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto removido com sucesso!");
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover produto");
    },
  });

  const updateOrderStatus = trpc.shop.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
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

  const handleCreateProduct = () => {
    if (!productForm.name) {
      toast.error("Preencha o nome do produto");
      return;
    }

    const data = {
      ...productForm,
      isLimited: productForm.isLimited,
      isActive: true,
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct, ...data });
    } else {
      createProduct.mutate(data);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      category: product.category,
      pointsPrice: product.pointsPrice,
      cashPrice: product.cashPrice || 0,
      stock: product.stock,
      minLevel: product.minLevel,
      isLimited: product.isLimited === 1,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <Button
              variant={activeTab === "newsletter" ? "default" : "outline"}
              onClick={() => setActiveTab("newsletter")}
            >
              Newsletter
            </Button>
            <Button
              variant={activeTab === "shop" ? "default" : "outline"}
              onClick={() => setActiveTab("shop")}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Loja
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

        {/* Shop Tab */}
        {activeTab === "shop" && (
          <div className="space-y-8">
            {/* Formulário de Produto */}
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</CardTitle>
                <CardDescription>
                  Adicione produtos para a Papaya Shop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Nome *</Label>
                    <Input
                      id="product-name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Categoria</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value: any) => setProductForm({ ...productForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Físico</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="experience">Experiência</SelectItem>
                        <SelectItem value="badge">Badge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">Descrição</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Descrição do produto"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-image">URL da Imagem</Label>
                  <Input
                    id="product-image"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-points">Preço (Pontos)</Label>
                    <Input
                      id="product-points"
                      type="number"
                      value={productForm.pointsPrice}
                      onChange={(e) => setProductForm({ ...productForm, pointsPrice: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Estoque</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-level">Nível Mínimo</Label>
                    <Input
                      id="product-level"
                      type="number"
                      value={productForm.minLevel}
                      onChange={(e) => setProductForm({ ...productForm, minLevel: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isLimited}
                        onChange={(e) => setProductForm({ ...productForm, isLimited: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Edição Limitada</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateProduct} disabled={createProduct.isPending || updateProduct.isPending}>
                    {createProduct.isPending || updateProduct.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {editingProduct ? "Atualizar" : "Adicionar"}
                  </Button>
                  {editingProduct && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({ name: "", description: "", imageUrl: "", category: "physical", pointsPrice: 100, cashPrice: 0, stock: 10, minLevel: 1, isLimited: false });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos Cadastrados</CardTitle>
                <CardDescription>{products?.length || 0} produtos na loja</CardDescription>
              </CardHeader>
              <CardContent>
                {products && products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-12 w-12 text-muted-foreground/30" />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-primary">{product.pointsPrice} pts</span>
                            <span className="text-sm text-muted-foreground">Estoque: {product.stock}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                              <Pencil className="h-3 w-3 mr-1" /> Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Remover este produto?")) {
                                  deleteProduct.mutate({ id: product.id });
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Nenhum produto cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pedidos */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>Gerencie os pedidos da loja</CardDescription>
              </CardHeader>
              <CardContent>
                {shopOrders && shopOrders.length > 0 ? (
                  <div className="space-y-4">
                    {shopOrders.map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{order.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.userName} - {order.pointsSpent} pontos
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Select
                            value={order.status}
                            onValueChange={(value: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") => updateOrderStatus.mutate({ orderId: order.id, status: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="confirmed">Confirmado</SelectItem>
                              <SelectItem value="shipped">Enviado</SelectItem>
                              <SelectItem value="delivered">Entregue</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {order.shippingAddress && (
                          <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            <strong>Endereço:</strong> {order.shippingAddress}, {order.shippingCity} - {order.shippingState}, {order.shippingZip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum pedido ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === "newsletter" && (
          <div className="space-y-6">
            {!newsletterForm.editing ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Newsletters</CardTitle>
                        <CardDescription>
                          {newsletters?.length || 0} newsletters criadas
                        </CardDescription>
                      </div>
                      <Button onClick={() => setNewsletterForm({ editing: true, id: null, title: "", subject: "", content: "" })}>
                        Nova Newsletter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {newsletters && newsletters.length > 0 ? (
                      <div className="space-y-4">
                        {newsletters.map((newsletter: any) => (
                          <div key={newsletter.id} className="p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold">{newsletter.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{newsletter.subject}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray-500">
                                    Criada em {new Date(newsletter.createdAt).toLocaleDateString("pt-BR")}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    newsletter.status === "sent" ? "bg-green-100 text-green-700" :
                                    newsletter.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                                    "bg-gray-100 text-gray-700"
                                  }`}>
                                    {newsletter.status === "sent" ? "Enviada" :
                                     newsletter.status === "scheduled" ? "Agendada" : "Rascunho"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setNewsletterForm({
                                    editing: true,
                                    id: newsletter.id,
                                    title: newsletter.title,
                                    subject: newsletter.subject,
                                    content: newsletter.content,
                                  })}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteNewsletterMutation.mutate({ id: newsletter.id })}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">📧</div>
                        <p>Nenhuma newsletter criada ainda</p>
                        <p className="text-sm mt-2">Clique em "Nova Newsletter" para começar</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {newsletterForm.id ? "Editar Newsletter" : "Nova Newsletter"}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setNewsletterForm({ editing: false, id: null, title: "", subject: "", content: "" })}
                  >
                    Voltar
                  </Button>
                </div>
                <NewsletterEditor
                  initialTitle={newsletterForm.title}
                  initialSubject={newsletterForm.subject}
                  initialContent={newsletterForm.content}
                  onSave={(data) => {
                    if (newsletterForm.id) {
                      updateNewsletterMutation.mutate({ id: newsletterForm.id, ...data });
                    } else {
                      createNewsletterMutation.mutate(data);
                    }
                  }}
                  loading={createNewsletterMutation.isPending || updateNewsletterMutation.isPending}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
