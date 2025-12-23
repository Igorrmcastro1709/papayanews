import { useState, useRef } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Camera, 
  Edit2, 
  Save, 
  X, 
  MapPin, 
  Briefcase, 
  Link as LinkIcon,
  Linkedin,
  Github,
  Globe,
  Trophy,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  MessageCircle
} from "lucide-react";

const INTEREST_OPTIONS = [
  "Inteligência Artificial",
  "Machine Learning",
  "Data Science",
  "Startups",
  "Empreendedorismo",
  "Inovação",
  "Tecnologia",
  "Produto",
  "Design",
  "Marketing Digital",
  "Investimentos",
  "Blockchain",
  "Web3",
  "Cloud Computing",
  "DevOps",
];

export default function UserProfile() {
  const { user } = useAuth();
  const [, params] = useRoute("/user/:id");
  const userId = params?.id ? parseInt(params.id) : user?.id;
  const isOwnProfile = !params?.id || userId === user?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: "",
    headline: "",
    company: "",
    position: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: "",
    interests: [] as string[],
    isPublic: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: profileData, isLoading, refetch } = trpc.profile.getUserProfile.useQuery(
    { userId: userId! },
    { enabled: !!userId }
  );

  const { data: gamificationData } = trpc.gamification.getProfile.useQuery(
    undefined,
    { enabled: isOwnProfile && !!user }
  );

  const { data: connections } = trpc.connections.getMyConnections.useQuery(
    undefined,
    { enabled: isOwnProfile && !!user }
  );

  const { data: connectionStatus } = trpc.connections.getConnectionStatus.useQuery(
    { userId: userId! },
    { enabled: !isOwnProfile && !!user && !!userId }
  );

  // Mutations
  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditing(false);
    },
  });

  const uploadAvatar = trpc.profile.uploadAvatar.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const sendConnectionRequest = trpc.connections.sendRequest.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleStartEdit = () => {
    if (profileData?.profile) {
      const interests = profileData.profile.interests 
        ? JSON.parse(profileData.profile.interests) 
        : [];
      setEditData({
        bio: profileData.profile.bio || "",
        headline: profileData.profile.headline || "",
        company: profileData.profile.company || "",
        position: profileData.profile.position || "",
        location: profileData.profile.location || "",
        linkedinUrl: profileData.profile.linkedinUrl || "",
        githubUrl: profileData.profile.githubUrl || "",
        websiteUrl: profileData.profile.websiteUrl || "",
        interests,
        isPublic: profileData.profile.isPublic === 1,
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(editData);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      await uploadAvatar.mutateAsync({
        imageData: base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const profile = profileData?.profile;
  const userInfo = profileData;
  const interests = profile?.interests ? JSON.parse(profile.interests) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              {isOwnProfile ? "Meu Perfil" : "Perfil"}
            </h1>
          </div>
          {isOwnProfile && !isEditing && (
            <Button onClick={handleStartEdit} variant="outline">
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {isOwnProfile && isEditing && (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(false)} variant="ghost">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={updateProfile.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header Card */}
        <Card className="mb-6 overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500" />
          
          <CardContent className="relative pt-0 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                  {profile?.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white text-4xl font-bold">
                      {userInfo?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="pt-20 pl-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userInfo?.name || "Usuário"}
                  </h2>
                  {isEditing ? (
                    <Input
                      value={editData.headline}
                      onChange={(e) => setEditData(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="Ex: Engenheiro de IA na Startup X"
                      className="mt-2 max-w-md"
                    />
                  ) : (
                    profile?.headline && (
                      <p className="text-gray-600 mt-1">{profile.headline}</p>
                    )
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    {(isEditing ? editData.company : profile?.company) && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {isEditing ? editData.company : profile?.company}
                      </span>
                    )}
                    {(isEditing ? editData.location : profile?.location) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {isEditing ? editData.location : profile?.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Connection Button */}
                {!isOwnProfile && user && (
                  <div>
                    {connectionStatus?.status === "accepted" ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        Conectados
                      </Badge>
                    ) : connectionStatus?.status === "pending" ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {connectionStatus.isRequester ? "Solicitação enviada" : "Solicitação recebida"}
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => sendConnectionRequest.mutate({ receiverId: userId! })}
                        disabled={sendConnectionRequest.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Conectar
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-6 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {gamificationData?.points?.totalPoints || 0}
                  </div>
                  <div className="text-sm text-gray-500">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {gamificationData?.points?.level || 1}
                  </div>
                  <div className="text-sm text-gray-500">Nível</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {connections?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Conexões</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {gamificationData?.badges?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Badges</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="badges">Conquistas</TabsTrigger>
            <TabsTrigger value="connections">Conexões</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você..."
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-600">
                    {profile?.bio || "Nenhuma descrição adicionada."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Work Info */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Profissionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Empresa</Label>
                      <Input
                        value={editData.company}
                        onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div>
                      <Label>Cargo</Label>
                      <Input
                        value={editData.position}
                        onChange={(e) => setEditData(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Seu cargo"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Localização</Label>
                    <Input
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Cidade, País"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-blue-600" />
                        LinkedIn
                      </Label>
                      <Input
                        value={editData.linkedinUrl}
                        onChange={(e) => setEditData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/seu-perfil"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        GitHub
                      </Label>
                      <Input
                        value={editData.githubUrl}
                        onChange={(e) => setEditData(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/seu-usuario"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        Website
                      </Label>
                      <Input
                        value={editData.websiteUrl}
                        onChange={(e) => setEditData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                        placeholder="https://seu-site.com"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile?.linkedinUrl && (
                      <a 
                        href={profile.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Linkedin className="h-5 w-5" />
                        LinkedIn
                      </a>
                    )}
                    {profile?.githubUrl && (
                      <a 
                        href={profile.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-700 hover:underline"
                      >
                        <Github className="h-5 w-5" />
                        GitHub
                      </a>
                    )}
                    {profile?.websiteUrl && (
                      <a 
                        href={profile.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:underline"
                      >
                        <Globe className="h-5 w-5" />
                        Website
                      </a>
                    )}
                    {!profile?.linkedinUrl && !profile?.githubUrl && !profile?.websiteUrl && (
                      <p className="text-gray-500">Nenhum link adicionado.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interesses</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => (
                      <Badge
                        key={interest}
                        variant={editData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer transition-all"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {interests.length > 0 ? (
                      interests.map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">Nenhum interesse adicionado.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Privacidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Perfil Público</p>
                      <p className="text-sm text-gray-500">
                        Outros membros podem ver seu perfil no diretório
                      </p>
                    </div>
                    <Switch
                      checked={editData.isPublic}
                      onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isPublic: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gamificationData?.badges && gamificationData.badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gamificationData.badges.map((badge) => (
                      <div 
                        key={badge.id}
                        className="p-4 rounded-lg border text-center"
                        style={{ borderColor: badge.color || '#e5e7eb' }}
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <h3 className="font-semibold">{badge.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma conquista ainda.</p>
                    <p className="text-sm">Continue participando para ganhar badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Conexões ({connections?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connections && connections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connections.map((connection) => (
                      <Link 
                        key={connection.id} 
                        href={`/user/${connection.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold overflow-hidden">
                          {connection.profile?.avatarUrl ? (
                            <img 
                              src={connection.profile.avatarUrl} 
                              alt={connection.name || ""} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            connection.name?.charAt(0).toUpperCase() || "?"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{connection.name}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {connection.profile?.headline || connection.email}
                          </p>
                        </div>
                        <MessageCircle className="h-5 w-5 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma conexão ainda.</p>
                    <Link href="/members">
                      <Button variant="outline" className="mt-4">
                        Explorar Membros
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
