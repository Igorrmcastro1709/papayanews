import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Search, 
  Calendar,
  FileText,
  Video,
  Headphones,
  Link as LinkIcon,
  Lock,
  Unlock,
  Sparkles,
  Filter,
  Clock,
  Eye,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  podcast: <Headphones className="h-4 w-4" />,
  link: <LinkIcon className="h-4 w-4" />,
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: "Artigo",
  video: "Vídeo",
  podcast: "Podcast",
  link: "Link",
};

const CATEGORY_OPTIONS = [
  { value: "all", label: "Todas as categorias" },
  { value: "ia", label: "Inteligência Artificial" },
  { value: "startups", label: "Startups" },
  { value: "inovacao", label: "Inovação" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "negocios", label: "Negócios" },
];

type Content = {
  id: number;
  title: string;
  description: string;
  link: string;
  category: string;
  order: number;
  active: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function Archive() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Buscar todos os conteúdos
  const { data: allContent = [], isLoading } = trpc.content.list.useQuery();

  // Filtrar conteúdos
  const filteredContent = allContent.filter((content: Content) => {
    const matchesSearch = !search || 
      content.title.toLowerCase().includes(search.toLowerCase()) ||
      content.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === "all" || 
      content.category?.toLowerCase() === category.toLowerCase();
    
    // Determinar tipo baseado na categoria
    const getTypeFromCategory = (cat: string) => {
      const c = cat.toLowerCase();
      if (c.includes('vídeo') || c.includes('video')) return 'video';
      if (c.includes('podcast')) return 'podcast';
      if (c.includes('link') || c.includes('canal')) return 'link';
      return 'article';
    };
    const matchesType = contentType === "all" || getTypeFromCategory(content.category) === contentType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Separar conteúdos: últimos 5 para todos, resto apenas para membros
  const FREE_CONTENT_LIMIT = 5;
  const freeContent = filteredContent.slice(0, FREE_CONTENT_LIMIT);
  const lockedContent = filteredContent.slice(FREE_CONTENT_LIMIT);
  const totalLockedCount = allContent.length - FREE_CONTENT_LIMIT;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setContentType("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={isAuthenticated ? "/dashboard" : "/"}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Arquivo de Conteúdos
                </h1>
                <p className="text-sm text-gray-500">
                  {allContent.length} publicações no acervo
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-primary/10" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button>
                    <Unlock className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="article">Artigos</SelectItem>
                      <SelectItem value="video">Vídeos</SelectItem>
                      <SelectItem value="podcast">Podcasts</SelectItem>
                      <SelectItem value="link">Links</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Banner para não logados */}
        {!isAuthenticated && totalLockedCount > 0 && (
          <Card className="mb-8 border-primary/30 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold text-gray-900">
                    Desbloqueie {totalLockedCount > 0 ? `+${totalLockedCount}` : "mais"} conteúdos exclusivos
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Cadastre-se gratuitamente para ter acesso completo ao nosso acervo de artigos, 
                    vídeos e podcasts sobre IA, Startups e Inovação.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="gap-2">
                      <Unlock className="h-5 w-5" />
                      Cadastrar Grátis
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nenhum conteúdo encontrado</p>
            <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <>
            {/* Conteúdos gratuitos (últimos 5) */}
            <div className="space-y-4">
              {freeContent.map((content: Content) => (
                <ContentCard key={content.id} content={content} isLocked={false} />
              ))}
            </div>

            {/* Conteúdos bloqueados para não membros */}
            {lockedContent.length > 0 && (
              <div className="mt-8">
                {!isAuthenticated ? (
                  <>
                    {/* Divisor com CTA */}
                    <div className="relative py-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Lock className="h-4 w-4" />
                            <span className="font-medium">
                              +{lockedContent.length} conteúdos exclusivos para membros
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview dos conteúdos bloqueados (blur) */}
                    <div className="relative">
                      <div className="space-y-4 opacity-50 blur-sm pointer-events-none">
                        {lockedContent.slice(0, 3).map((content: Content) => (
                          <ContentCard key={content.id} content={content} isLocked={true} />
                        ))}
                      </div>
                      
                      {/* Overlay com CTA */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent">
                        <Card className="max-w-md mx-4 shadow-xl border-primary/20">
                          <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              Conteúdo Exclusivo
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Cadastre-se para desbloquear {lockedContent.length} artigos, 
                              vídeos e podcasts do nosso acervo completo.
                            </p>
                            <a href={getLoginUrl()}>
                              <Button className="w-full gap-2">
                                <Unlock className="h-4 w-4" />
                                Desbloquear Acervo
                              </Button>
                            </a>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Membros veem todos os conteúdos */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Unlock className="h-4 w-4 text-green-500" />
                      <span>Você tem acesso completo ao acervo</span>
                    </div>
                    {lockedContent.map((content: Content) => (
                      <ContentCard key={content.id} content={content} isLocked={false} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ContentCard({ content, isLocked }: { content: Content; isLocked: boolean }) {
  // Determinar o tipo baseado na categoria
  const getTypeFromCategory = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('vídeo') || cat.includes('video')) return 'video';
    if (cat.includes('podcast')) return 'podcast';
    if (cat.includes('link') || cat.includes('canal')) return 'link';
    return 'article';
  };
  
  const contentType = getTypeFromCategory(content.category);
  
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${isLocked ? 'opacity-60' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Conteúdo */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="gap-1">
                    {CONTENT_TYPE_ICONS[contentType]}
                    {CONTENT_TYPE_LABELS[contentType] || content.category}
                  </Badge>
                  <Badge variant="outline">{content.category}</Badge>
                </div>

                {/* Título */}
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {content.title}
                </h3>

                {/* Descrição */}
                {content.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {content.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(content.createdAt), "dd MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Ação */}
              <div className="flex-shrink-0">
                {isLocked ? (
                  <div className="p-2 rounded-full bg-gray-100">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                ) : content.link ? (
                  <a href={content.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
