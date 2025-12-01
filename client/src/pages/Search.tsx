import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Search as SearchIcon, ArrowLeft, ExternalLink, Calendar, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Search() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'content' | 'events' | 'members'>('all');
  
  const { data: results, isLoading, refetch } = trpc.search.global.useQuery(
    { query, filter },
    { enabled: query.length >= 2 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length >= 2) {
      refetch();
    }
  };

  const totalResults = (results?.contents?.length || 0) + 
                       (results?.events?.length || 0) + 
                       (results?.members?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="/papaya-logo.png" 
                alt="PapayaNews" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                PapayaNews
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        {/* Search Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="w-6 h-6 text-primary" />
              Buscar na Comunidade
            </CardTitle>
            <CardDescription>
              Encontre conteúdos, eventos e membros da PapayaNews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite sua busca..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={query.length < 2}>
                <SearchIcon className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {query.length >= 2 && (
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Buscando...</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''} para "{query}"
                  </p>
                </div>

                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="all">
                      Todos ({totalResults})
                    </TabsTrigger>
                    <TabsTrigger value="content">
                      Conteúdos ({results?.contents?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="events">
                      Eventos ({results?.events?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="members">
                      Membros ({results?.members?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-8">
                    {/* Contents */}
                    {results?.contents && results.contents.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">Conteúdos</h3>
                        <div className="grid gap-4">
                          {results.contents.map((content: any) => (
                            <Card key={content.id} className="hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="secondary">{content.category}</Badge>
                                    </div>
                                    <CardTitle className="text-lg">{content.title}</CardTitle>
                                    <CardDescription className="mt-2">
                                      {content.description}
                                    </CardDescription>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => window.open(content.link, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {results?.events && results.events.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">Eventos</h3>
                        <div className="grid gap-4">
                          {results.events.map((event: any) => (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <CardTitle className="text-lg">{event.title}</CardTitle>
                                <CardDescription className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(event.eventDate), "PPP 'às' HH:mm", { locale: ptBR })}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                  <p className="mt-2">{event.description}</p>
                                </CardDescription>
                              </CardHeader>
                              {event.link && (
                                <CardContent>
                                  <Button
                                    size="sm"
                                    onClick={() => window.open(event.link, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Mais Informações
                                  </Button>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Members */}
                    {results?.members && results.members.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">Membros</h3>
                        <div className="grid gap-4">
                          {results.members.map((member: any) => (
                            <Card key={member.id} className="hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                                    <User className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{member.name || member.email}</CardTitle>
                                    <CardDescription>
                                      Membro desde {format(new Date(member.createdAt), "MMMM 'de' yyyy", { locale: ptBR })}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {totalResults === 0 && (
                      <div className="text-center py-12">
                        <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-lg font-medium mb-2">Nenhum resultado encontrado</p>
                        <p className="text-muted-foreground">
                          Tente usar palavras-chave diferentes ou mais gerais
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="content">
                    {/* Same as contents section above */}
                    {results?.contents && results.contents.length > 0 ? (
                      <div className="grid gap-4">
                        {results.contents.map((content: any) => (
                          <Card key={content.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary">{content.category}</Badge>
                                  </div>
                                  <CardTitle className="text-lg">{content.title}</CardTitle>
                                  <CardDescription className="mt-2">
                                    {content.description}
                                  </CardDescription>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => window.open(content.link, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Nenhum conteúdo encontrado</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="events">
                    {results?.events && results.events.length > 0 ? (
                      <div className="grid gap-4">
                        {results.events.map((event: any) => (
                          <Card key={event.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(event.eventDate), "PPP 'às' HH:mm", { locale: ptBR })}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </div>
                                <p className="mt-2">{event.description}</p>
                              </CardDescription>
                            </CardHeader>
                            {event.link && (
                              <CardContent>
                                <Button
                                  size="sm"
                                  onClick={() => window.open(event.link, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Mais Informações
                                </Button>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Nenhum evento encontrado</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="members">
                    {results?.members && results.members.length > 0 ? (
                      <div className="grid gap-4">
                        {results.members.map((member: any) => (
                          <Card key={member.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                                  <User className="w-6 h-6" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{member.name || member.email}</CardTitle>
                                  <CardDescription>
                                    Membro desde {format(new Date(member.createdAt), "MMMM 'de' yyyy", { locale: ptBR })}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Nenhum membro encontrado</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}

        {query.length < 2 && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">Digite pelo menos 2 caracteres para buscar</p>
            <p className="text-muted-foreground">
              Busque por conteúdos, eventos ou membros da comunidade
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-white/80 backdrop-blur-sm mt-12">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 PapayaNews. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
