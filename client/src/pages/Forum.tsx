import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { 
  MessageSquare, 
  Plus, 
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Clock,
  User,
  Send,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Forum() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: threads = [], isLoading } = trpc.forum.listThreads.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const { data: threadDetail, isLoading: loadingDetail } = trpc.forum.getThread.useQuery(
    { threadId: selectedThread?.id },
    { enabled: !!selectedThread?.id }
  );

  // Mutations
  const createThreadMutation = trpc.forum.createThread.useMutation({
    onSuccess: () => {
      toast.success("Discussão criada com sucesso!");
      setIsCreateOpen(false);
      setNewThreadTitle("");
      setNewThreadContent("");
      utils.forum.listThreads.invalidate();
    },
    onError: () => toast.error("Erro ao criar discussão")
  });

  const createReplyMutation = trpc.forum.createReply.useMutation({
    onSuccess: () => {
      toast.success("Resposta enviada!");
      setReplyContent("");
      utils.forum.getThread.invalidate({ threadId: selectedThread?.id });
    },
    onError: () => toast.error("Erro ao enviar resposta")
  });

  const upvoteMutation = trpc.forum.upvoteThread.useMutation({
    onSuccess: () => {
      utils.forum.listThreads.invalidate();
      if (selectedThread) {
        utils.forum.getThread.invalidate({ threadId: selectedThread.id });
      }
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
        <div className="animate-pulse text-xl text-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    setLocation("/");
    return null;
  }

  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    createThreadMutation.mutate({
      title: newThreadTitle,
      content: newThreadContent
    });
  };

  const handleReply = () => {
    if (!replyContent.trim() || !selectedThread) return;
    createReplyMutation.mutate({
      threadId: selectedThread.id,
      content: replyContent
    });
  };

  const handleUpvote = (threadId: number) => {
    upvoteMutation.mutate({ threadId });
  };

  // Thread Detail View
  if (selectedThread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedThread(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-bold text-foreground line-clamp-1">{selectedThread.title}</h1>
                  <p className="text-xs text-muted-foreground">Discussão</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-3xl">
          {loadingDetail ? (
            <div className="text-center py-8">Carregando...</div>
          ) : threadDetail ? (
            <div className="space-y-4">
              {/* Original Post */}
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{threadDetail.authorName || 'Membro'}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(threadDetail.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{threadDetail.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleUpvote(threadDetail.id)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {threadDetail.upvotes || 0}
                        </Button>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {threadDetail.replies?.length || 0} respostas
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Replies */}
              {threadDetail.replies && threadDetail.replies.length > 0 && (
                <div className="space-y-3 pl-4 border-l-2 border-orange-200">
                  {threadDetail.replies.map((reply: any) => (
                    <Card key={reply.id} className="border-gray-100">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{reply.authorName || 'Membro'}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Escreva sua resposta..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={handleReply}
                      disabled={createReplyMutation.isPending || !replyContent.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Discussão não encontrada</div>
          )}
        </main>
      </div>
    );
  }

  // Thread List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-orange-600">Fórum</h1>
                <p className="text-xs text-muted-foreground">Discussões da comunidade</p>
              </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova Discussão</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Discussão</DialogTitle>
                  <DialogDescription>
                    Inicie uma conversa com a comunidade sobre IA, startups ou inovação.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="Título da discussão"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Escreva sua mensagem..."
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={handleCreateThread}
                    disabled={createThreadMutation.isPending}
                  >
                    {createThreadMutation.isPending ? 'Criando...' : 'Criar Discussão'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando discussões...</div>
        ) : threads.length === 0 ? (
          <Card className="border-dashed border-2 border-orange-200">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-orange-300 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma discussão ainda</h3>
              <p className="text-muted-foreground mb-4">Seja o primeiro a iniciar uma conversa!</p>
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Criar Discussão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {threads.map((thread: any) => (
              <Card 
                key={thread.id} 
                className="hover:shadow-md transition-shadow cursor-pointer border-orange-100"
                onClick={() => setSelectedThread(thread)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-1">{thread.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{thread.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{thread.authorName || 'Membro'}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {thread.upvotes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {thread.replyCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
