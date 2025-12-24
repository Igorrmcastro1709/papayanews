import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Eye, 
  Sparkles, 
  Loader2,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  ArrowLeft,
  Clock,
  User,
  FolderOpen,
  Brain,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Document = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  category: string | null;
  tags: string | null;
  aiSummary: string | null;
  aiContext: string | null;
  aiOutcomes: string | null;
  aiProcessedAt: Date | null;
  downloadCount: number;
  isPublic: number;
  chatMessageId: number | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
};

const CATEGORIES = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'artigos', label: 'Artigos' },
  { value: 'pesquisas', label: 'Pesquisas' },
  { value: 'apresentacoes', label: 'Apresentações' },
  { value: 'relatorios', label: 'Relatórios' },
  { value: 'tutoriais', label: 'Tutoriais' },
  { value: 'outros', label: 'Outros' },
];

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-8 w-8 text-red-500" />,
  document: <FileText className="h-8 w-8 text-blue-500" />,
  image: <ImageIcon className="h-8 w-8 text-green-500" />,
  spreadsheet: <FileSpreadsheet className="h-8 w-8 text-emerald-500" />,
  presentation: <Presentation className="h-8 w-8 text-orange-500" />,
  text: <FileText className="h-8 w-8 text-gray-500" />,
  other: <File className="h-8 w-8 text-gray-400" />,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function Library() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    isPublic: true,
    analyzeWithAI: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Queries
  const { data: documents, isLoading: isLoadingDocs, refetch: refetchDocs } = trpc.documents.list.useQuery({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    limit: 50,
  });

  const { data: searchResults, isLoading: isSearching } = trpc.documents.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 }
  );

  const { data: stats } = trpc.documents.getStats.useQuery();

  // Mutations
  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Documento enviado com sucesso!");
      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadForm({
        title: "",
        description: "",
        category: "",
        tags: "",
        isPublic: true,
        analyzeWithAI: true,
      });
      refetchDocs();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar documento");
    },
  });

  const analyzeMutation = trpc.documents.analyzeDocument.useMutation({
    onSuccess: () => {
      toast.success("Documento analisado com sucesso!");
      refetchDocs();
      if (selectedDoc) {
        // Refresh selected doc
        setSelectedDoc(null);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao analisar documento");
    },
  });

  const downloadMutation = trpc.documents.registerDownload.useMutation();

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Documento excluído");
      setSelectedDoc(null);
      refetchDocs();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir documento");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Arquivo deve ter no máximo 15MB");
        return;
      }
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        await uploadMutation.mutateAsync({
          title: uploadForm.title,
          description: uploadForm.description || undefined,
          fileName: selectedFile.name,
          fileData: base64,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          category: uploadForm.category || undefined,
          tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : undefined,
          isPublic: uploadForm.isPublic,
          analyzeWithAI: uploadForm.analyzeWithAI,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (doc: Document) => {
    downloadMutation.mutate({ documentId: doc.id });
    window.open(doc.fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const displayedDocs = searchQuery.length >= 2 ? searchResults : documents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-orange-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Biblioteca de Documentos</h1>
                  <p className="text-sm text-muted-foreground">
                    {stats?.total || 0} documentos • {formatFileSize(stats?.totalSize || 0)} total
                  </p>
                </div>
              </div>
            </div>
            
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Enviar Documento</DialogTitle>
                  <DialogDescription>
                    Faça upload de documentos para a biblioteca. PDFs e imagens serão analisados automaticamente pela IA.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Arquivo (máx. 15MB)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                    />
                    <Button
                      variant="outline"
                      className="w-full mt-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedFile ? selectedFile.name : "Selecionar arquivo"}
                    </Button>
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome do documento"
                    />
                  </div>
                  
                  <div>
                    <Label>Descrição (opcional)</Label>
                    <Textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descrição do conteúdo"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Categoria</Label>
                      <Select
                        value={uploadForm.category}
                        onValueChange={(v) => setUploadForm(prev => ({ ...prev, category: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Tags (separadas por vírgula)</Label>
                      <Input
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="IA, startups, pesquisa"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadForm.isPublic}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Público para a comunidade</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadForm.analyzeWithAI}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, analyzeWithAI: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-orange-500" />
                        Analisar com IA
                      </span>
                    </label>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={!selectedFile || !uploadForm.title || isUploading || uploadMutation.isPending}
                  >
                    {isUploading || uploadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Documento
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, descrição ou resumo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents Grid */}
        {isLoadingDocs || isSearching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : displayedDocs && displayedDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDocs.map((doc) => (
              <Card 
                key={doc.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedDoc(doc as Document)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {FILE_TYPE_ICONS[doc.fileType] || FILE_TYPE_ICONS.other}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {doc.fileName} • {formatFileSize(doc.fileSize)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {doc.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {doc.description}
                    </p>
                  )}
                  
                  {doc.aiSummary && (
                    <div className="bg-orange-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-1 text-xs text-orange-600 font-medium mb-1">
                        <Brain className="h-3 w-3" />
                        Resumo IA
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-3">{doc.aiSummary}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {doc.category && (
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {'downloadCount' in doc && (
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {(doc as Document).downloadCount}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(doc.createdAt), "dd/MM/yy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "Nenhum documento encontrado" : "Biblioteca vazia"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Tente buscar com outros termos" 
                : "Seja o primeiro a compartilhar um documento com a comunidade!"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Documento
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Document Detail Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDoc && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  {FILE_TYPE_ICONS[selectedDoc.fileType] || FILE_TYPE_ICONS.other}
                  <div>
                    <DialogTitle className="text-xl">{selectedDoc.title}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedDoc.fileName} • {formatFileSize(selectedDoc.fileSize)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedDoc.userName || 'Anônimo'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(selectedDoc.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {selectedDoc.downloadCount} downloads
                  </span>
                </div>
                
                {selectedDoc.category && (
                  <Badge variant="secondary">{selectedDoc.category}</Badge>
                )}
                
                {selectedDoc.description && (
                  <div>
                    <h4 className="font-medium mb-1">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{selectedDoc.description}</p>
                  </div>
                )}
                
                {/* AI Analysis */}
                {selectedDoc.aiSummary ? (
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-orange-600 font-medium">
                      <Brain className="h-5 w-5" />
                      Análise da IA
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">📝 Resumo</h5>
                      <p className="text-sm text-gray-600">{selectedDoc.aiSummary}</p>
                    </div>
                    
                    {selectedDoc.aiContext && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">📌 Contexto</h5>
                        <p className="text-sm text-gray-600">{selectedDoc.aiContext}</p>
                      </div>
                    )}
                    
                    {selectedDoc.aiOutcomes && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">🎯 Principais Conclusões</h5>
                        <p className="text-sm text-gray-600">{selectedDoc.aiOutcomes}</p>
                      </div>
                    )}
                    
                    {selectedDoc.aiProcessedAt && (
                      <p className="text-xs text-muted-foreground">
                        Analisado em {format(new Date(selectedDoc.aiProcessedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                ) : ['pdf', 'image'].includes(selectedDoc.fileType) ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Este documento ainda não foi analisado pela IA
                    </p>
                    {selectedDoc.userId === user?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => analyzeMutation.mutate({ documentId: selectedDoc.id })}
                        disabled={analyzeMutation.isPending}
                      >
                        {analyzeMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Analisar com IA
                      </Button>
                    )}
                  </div>
                ) : null}
                
                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1" onClick={() => handleDownload(selectedDoc)}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Documento
                  </Button>
                  
                  <Button variant="outline" onClick={() => window.open(selectedDoc.fileUrl, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  
                  {selectedDoc.userId === user?.id && (
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este documento?')) {
                          deleteMutation.mutate({ documentId: selectedDoc.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
