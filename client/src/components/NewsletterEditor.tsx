import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code, Send } from "lucide-react";

interface NewsletterEditorProps {
  initialTitle?: string;
  initialSubject?: string;
  initialContent?: string;
  onSave: (data: { title: string; subject: string; content: string }) => void;
  onSend?: () => void;
  loading?: boolean;
}

export default function NewsletterEditor({
  initialTitle = "",
  initialSubject = "",
  initialContent = "",
  onSave,
  onSend,
  loading = false,
}: NewsletterEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const handleSave = () => {
    onSave({ title, subject, content });
  };

  const insertTemplate = (template: string) => {
    setContent(template);
  };

  const templates = {
    welcome: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Bem-vindo à PapayaNews!</h1>
  </div>
  
  <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Olá, [NOME]!</h2>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Estamos muito felizes em ter você como parte da nossa comunidade! A PapayaNews é o seu shot diário de inovação, startups e IA.
    </p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
      <h3 style="color: #f97316; margin-top: 0;">O que você vai encontrar:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Conteúdos exclusivos sobre IA e inovação</li>
        <li>Eventos e workshops práticos</li>
        <li>Networking com profissionais da área</li>
        <li>Sistema de gamificação e badges</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="[LINK_DASHBOARD]" style="background-color: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Acessar Dashboard
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
      Até breve! 👋<br>
      Equipe PapayaNews
    </p>
  </div>
</div>`,
    
    weekly: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #1f2937; margin: 0;">📰 Destaques da Semana</h1>
    <p style="color: #6b7280; margin: 10px 0 0 0;">Sua dose semanal de inovação</p>
  </div>
  
  <div style="padding: 20px;">
    <!-- Artigo Principal -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
      <h2 style="color: white; margin: 0 0 10px 0;">🚀 [TÍTULO PRINCIPAL]</h2>
      <p style="color: white; opacity: 0.95; line-height: 1.6;">
        [RESUMO DO ARTIGO PRINCIPAL]
      </p>
      <a href="[LINK]" style="color: white; font-weight: bold; text-decoration: underline;">Ler mais →</a>
    </div>
    
    <!-- Outros Destaques -->
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
      <h3 style="color: #1f2937; margin: 0 0 10px 0;">💡 [TÍTULO 2]</h3>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 10px 0;">
        [RESUMO]
      </p>
      <a href="[LINK]" style="color: #f97316; font-weight: bold; text-decoration: none;">Ler mais →</a>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
      <h3 style="color: #1f2937; margin: 0 0 10px 0;">🎯 [TÍTULO 3]</h3>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 10px 0;">
        [RESUMO]
      </p>
      <a href="[LINK]" style="color: #f97316; font-weight: bold; text-decoration: none;">Ler mais →</a>
    </div>
    
    <!-- Próximos Eventos -->
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #fbbf24; margin-top: 30px;">
      <h3 style="color: #92400e; margin: 0 0 10px 0;">📅 Próximos Eventos</h3>
      <p style="color: #78350f; line-height: 1.6; margin: 0;">
        [LISTA DE EVENTOS]
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
      Você está recebendo este email porque é membro da comunidade PapayaNews.<br>
      <a href="[LINK_UNSUBSCRIBE]" style="color: #6b7280;">Cancelar inscrição</a>
    </p>
  </div>
</div>`,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Newsletter</CardTitle>
          <CardDescription>Título e assunto do email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título Interno</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Newsletter Semanal - Janeiro 2025"
            />
          </div>
          <div>
            <Label htmlFor="subject">Assunto do Email</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: 🚀 Destaques da Semana - PapayaNews"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates Prontos</CardTitle>
          <CardDescription>Comece com um template profissional</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => insertTemplate(templates.welcome)}
              className="h-auto py-4 flex-col gap-2"
            >
              <span className="text-2xl">👋</span>
              <span className="font-semibold">Boas-vindas</span>
              <span className="text-xs text-gray-600">Para novos membros</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => insertTemplate(templates.weekly)}
              className="h-auto py-4 flex-col gap-2"
            >
              <span className="text-2xl">📰</span>
              <span className="font-semibold">Semanal</span>
              <span className="text-xs text-gray-600">Destaques da semana</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conteúdo da Newsletter</span>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
              <TabsList>
                <TabsTrigger value="edit" className="gap-2">
                  <Code className="w-4 h-4" />
                  Editar
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
          <CardDescription>
            Use HTML para criar newsletters personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === "edit" ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cole ou edite o HTML da sua newsletter aqui..."
              className="font-mono text-sm min-h-[400px]"
            />
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={loading || !title || !subject || !content}
        >
          Salvar Rascunho
        </Button>
        {onSend && (
          <Button
            onClick={onSend}
            disabled={loading || !title || !subject || !content}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Newsletter
          </Button>
        )}
      </div>
    </div>
  );
}
