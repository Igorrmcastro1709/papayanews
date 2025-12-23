import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Send, Sparkles, MessageCircle, Bot, ArrowLeft, Info, Paperclip, X, FileText, Image as ImageIcon, Film, Music, File, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { toast } from "sonner";
import { EmojiPicker } from "@/components/EmojiPicker";

type Attachment = {
  id?: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
};

type ChatMessage = {
  id: number;
  userId: number;
  message: string;
  isAiResponse: number;
  replyToId: number | null;
  createdAt: Date;
  userName?: string;
  userEmail?: string;
  attachments?: Attachment[];
};

type PendingAttachment = {
  file: File;
  preview?: string;
};

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar mensagens com anexos
  const { data: messages, refetch, isLoading: messagesLoading } = trpc.chat.getMessagesWithAttachments.useQuery(
    { limit: 100 },
    { 
      refetchInterval: 5000,
      enabled: !!user,
    }
  );

  // Buscar contexto da comunidade
  const { data: context } = trpc.chat.getCommunityContext.useQuery(undefined, {
    enabled: !!user,
  });

  // Mutation para enviar mensagem com anexos
  const sendMessageWithAttachments = trpc.chat.sendMessageWithAttachments.useMutation({
    onSuccess: () => {
      refetch();
      setInput("");
      setPendingAttachments([]);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar mensagem");
    },
  });

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover o prefixo "data:...;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if ((!trimmedInput && pendingAttachments.length === 0) || sendMessageWithAttachments.isPending) return;

    try {
      // Converter anexos para base64
      const attachmentsData = await Promise.all(
        pendingAttachments.map(async (pa) => ({
          fileName: pa.file.name,
          fileData: await fileToBase64(pa.file),
          fileType: pa.file.type,
          fileSize: pa.file.size,
        }))
      );

      sendMessageWithAttachments.mutate({
        message: trimmedInput,
        attachments: attachmentsData.length > 0 ? attachmentsData : undefined,
      });
    } catch (error) {
      toast.error("Erro ao processar arquivos");
    }

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} é muito grande. Máximo: 10MB`);
        return false;
      }
      return true;
    });

    const newAttachments: PendingAttachment[] = validFiles.map(file => {
      const attachment: PendingAttachment = { file };
      
      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        attachment.preview = URL.createObjectURL(file);
      }
      
      return attachment;
    });

    setPendingAttachments(prev => [...prev, ...newAttachments]);
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => {
      const newAttachments = [...prev];
      // Revogar URL de preview se existir
      if (newAttachments[index].preview) {
        URL.revokeObjectURL(newAttachments[index].preview!);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Film className="h-5 w-5" />;
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const renderAttachment = (attachment: Attachment, isOwnMessage: boolean) => {
    const isImage = attachment.fileType.startsWith('image/');
    const isVideo = attachment.fileType.startsWith('video/');
    const isAudio = attachment.fileType.startsWith('audio/');

    if (isImage) {
      return (
        <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
          <img 
            src={attachment.fileUrl} 
            alt={attachment.fileName}
            className="max-w-[250px] max-h-[200px] rounded-lg object-cover hover:opacity-90 transition-opacity"
          />
        </a>
      );
    }

    if (isVideo) {
      return (
        <video 
          src={attachment.fileUrl} 
          controls 
          className="max-w-[300px] rounded-lg"
        />
      );
    }

    if (isAudio) {
      return (
        <audio src={attachment.fileUrl} controls className="max-w-[250px]" />
      );
    }

    // Outros arquivos
    return (
      <a 
        href={attachment.fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-colors",
          isOwnMessage 
            ? "bg-white/20 hover:bg-white/30" 
            : "bg-gray-100 hover:bg-gray-200"
        )}
      >
        {getFileIcon(attachment.fileType)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.fileName}</p>
          <p className={cn("text-xs", isOwnMessage ? "text-white/70" : "text-muted-foreground")}>
            {formatFileSize(attachment.fileSize)}
          </p>
        </div>
        <Download className="h-4 w-4 shrink-0" />
      </a>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <CardTitle>Chat da Comunidade</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Faça login para participar do chat da comunidade PapayaNews.
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
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Chat da Comunidade</h1>
                <p className="text-xs text-muted-foreground">
                  {messages?.length || 0} mensagens • Use @papaya para falar com o assistente
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Principal */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              {/* Área de Mensagens */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg: ChatMessage) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3",
                          msg.isAiResponse === 1 ? "justify-start" : 
                          msg.userId === user.id ? "justify-end" : "justify-start"
                        )}
                      >
                        {/* Avatar (não mostrar para mensagens próprias à direita) */}
                        {(msg.isAiResponse === 1 || msg.userId !== user.id) && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback 
                              className={cn(
                                msg.isAiResponse === 1 
                                  ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white"
                                  : "bg-gray-200"
                              )}
                            >
                              {msg.isAiResponse === 1 ? (
                                <Bot className="h-4 w-4" />
                              ) : (
                                getInitials(msg.userName || "U")
                              )}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {/* Mensagem */}
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2",
                            msg.isAiResponse === 1
                              ? "bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200"
                              : msg.userId === user.id
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                              : "bg-white border shadow-sm"
                          )}
                        >
                          {/* Nome do usuário (apenas para mensagens de outros) */}
                          {msg.isAiResponse !== 1 && msg.userId !== user.id && (
                            <p className="text-xs font-medium text-orange-600 mb-1">
                              {msg.userName}
                            </p>
                          )}
                          {msg.isAiResponse === 1 && (
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-700">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Papaya
                              </Badge>
                            </div>
                          )}
                          
                          {/* Anexos */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-2 mb-2">
                              {msg.attachments.map((attachment, idx) => (
                                <div key={idx}>
                                  {renderAttachment(attachment, msg.userId === user.id)}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Conteúdo */}
                          {msg.message && msg.message !== '[📎 Arquivo anexado]' && (
                            msg.isAiResponse === 1 ? (
                              <div className="prose prose-sm max-w-none text-gray-800">
                                <Streamdown>{msg.message}</Streamdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            )
                          )}
                          
                          {/* Hora */}
                          <p className={cn(
                            "text-xs mt-1",
                            msg.isAiResponse === 1 
                              ? "text-orange-600/60"
                              : msg.userId === user.id 
                              ? "text-white/70" 
                              : "text-muted-foreground"
                          )}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>

                        {/* Avatar próprio (à direita) */}
                        {msg.isAiResponse !== 1 && msg.userId === user.id && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                              {getInitials(user.name || "U")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {sendMessageWithAttachments.isPending && (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200 rounded-2xl px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-16 w-16 text-orange-200 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Bem-vindo ao Chat!</h3>
                    <p className="text-muted-foreground max-w-md">
                      Converse com outros membros da comunidade ou use <strong>@papaya</strong> para 
                      perguntar sobre novidades, artigos e eventos.
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Preview de anexos pendentes */}
              {pendingAttachments.length > 0 && (
                <div className="px-4 py-2 border-t bg-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map((pa, index) => (
                      <div 
                        key={index} 
                        className="relative group bg-white rounded-lg border p-2 flex items-center gap-2"
                      >
                        {pa.preview ? (
                          <img src={pa.preview} alt="" className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                            {getFileIcon(pa.file.type)}
                          </div>
                        )}
                        <div className="max-w-[120px]">
                          <p className="text-xs font-medium truncate">{pa.file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(pa.file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t bg-white/50">
                <div className="flex items-end gap-2">
                  {/* Botão de anexo */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>

                  {/* Emoji Picker */}
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />

                  {/* Textarea */}
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem... (use @papaya para falar com o assistente)"
                    className="flex-1 min-h-[44px] max-h-32 resize-none"
                    rows={1}
                  />

                  {/* Botão de enviar */}
                  <Button
                    type="submit"
                    size="icon"
                    disabled={(!input.trim() && pendingAttachments.length === 0) || sendMessageWithAttachments.isPending}
                    className="h-[44px] w-[44px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shrink-0"
                  >
                    {sendMessageWithAttachments.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar - Contexto da Comunidade */}
          <div className="hidden lg:block space-y-4">
            {/* Dicas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-orange-500" />
                  Como usar o chat
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Converse livremente com outros membros</p>
                <p>• Use <strong className="text-orange-600">@papaya</strong> para perguntar ao assistente</p>
                <p>• Envie fotos, vídeos e documentos 📎</p>
                <p>• Use emojis para expressar suas reações 😊</p>
              </CardContent>
            </Card>

            {/* Conteúdos Recentes */}
            {context?.recentContent && context.recentContent.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Conteúdos Recentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {context.recentContent.slice(0, 3).map((content) => (
                    <a
                      key={content.id}
                      href={content.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-1">{content.title}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {content.category}
                      </Badge>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Próximos Eventos */}
            {context?.upcomingEvents && context.upcomingEvents.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {context.upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-2 rounded-lg bg-orange-50">
                      <p className="text-sm font-medium line-clamp-1">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.eventDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sugestões de Perguntas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pergunte ao Papaya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "@papaya quais são as novidades?",
                  "@papaya tem algum evento próximo?",
                  "@papaya o que é a PapayaNews?",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="w-full text-left p-2 text-sm rounded-lg border hover:bg-orange-50 hover:border-orange-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
