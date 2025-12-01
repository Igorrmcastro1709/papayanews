import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Share2, Linkedin, Instagram, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

export default function SocialShare({ title, description, url, imageUrl }: SocialShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkedInPost, setLinkedInPost] = useState(
    `${title}\n\n${description}\n\n🔗 Leia mais: ${url}\n\n#PapayaNews #Inovação #IA #Startups`
  );
  const [instagramCaption, setInstagramCaption] = useState(
    `${title}\n\n${description}\n\n🔗 Link na bio\n\n#PapayaNews #Inovação #IA #Startups #Tech`
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    // LinkedIn Share URL
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=600");
    toast.success("Abrindo LinkedIn...");
  };

  const handleCopyLinkedInPost = () => {
    navigator.clipboard.writeText(linkedInPost);
    toast.success("Post do LinkedIn copiado!");
  };

  const handleCopyInstagramCaption = () => {
    navigator.clipboard.writeText(instagramCaption);
    toast.success("Legenda do Instagram copiada!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compartilhar nas Redes Sociais</DialogTitle>
          <DialogDescription>
            Compartilhe este conteúdo nas suas redes sociais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Link Direto */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Link Direto</Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline" className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Linkedin className="w-5 h-5 text-blue-600" />
              <Label className="text-base font-semibold">LinkedIn</Label>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">
                  Post sugerido (edite se desejar):
                </Label>
                <Textarea
                  value={linkedInPost}
                  onChange={(e) => setLinkedInPost(e.target.value)}
                  className="min-h-[120px] font-sans"
                  placeholder="Escreva seu post..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dica: Posts concisos focados em aspectos de negócios têm mais engajamento
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleShareLinkedIn} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Linkedin className="w-4 h-4" />
                  Compartilhar no LinkedIn
                </Button>
                <Button onClick={handleCopyLinkedInPost} variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copiar Post
                </Button>
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Instagram className="w-5 h-5 text-pink-600" />
              <Label className="text-base font-semibold">Instagram</Label>
            </div>
            <div className="space-y-3">
              {imageUrl && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview da imagem:</p>
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full max-h-60 object-cover rounded-lg"
                  />
                </div>
              )}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">
                  Legenda sugerida (edite se desejar):
                </Label>
                <Textarea
                  value={instagramCaption}
                  onChange={(e) => setInstagramCaption(e.target.value)}
                  className="min-h-[120px] font-sans"
                  placeholder="Escreva sua legenda..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dica: Use hashtags relevantes e mencione o link na bio
                </p>
              </div>
              <Button onClick={handleCopyInstagramCaption} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copiar Legenda
              </Button>
              <p className="text-xs text-gray-500">
                💡 Após copiar, abra o Instagram e cole a legenda ao criar um novo post
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
