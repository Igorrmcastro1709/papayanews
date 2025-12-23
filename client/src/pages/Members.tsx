import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Users, 
  MapPin, 
  Briefcase,
  UserPlus,
  UserCheck,
  Clock,
  Filter,
  X
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
];

type Member = {
  id: number;
  name: string | null;
  email: string | null;
  createdAt: Date;
  profile: {
    avatarUrl: string | null;
    headline: string | null;
    company: string | null;
    location: string | null;
    interests: string | null;
  } | null;
  totalPoints: number;
  level: number;
};

export default function Members() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: members, isLoading } = trpc.profile.listMembers.useQuery({
    limit: 100,
    search: search || undefined,
    interests: selectedInterests.length > 0 ? selectedInterests : undefined,
  });

  const { data: pendingRequests } = trpc.connections.getPendingRequests.useQuery(
    undefined,
    { enabled: !!user }
  );

  const sendConnectionRequest = trpc.connections.sendRequest.useMutation();
  const respondToRequest = trpc.connections.respondToRequest.useMutation();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedInterests([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Membros da Comunidade
                </h1>
                <p className="text-sm text-gray-500">
                  {members?.length || 0} membros encontrados
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary/10" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {selectedInterests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedInterests.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, empresa ou cargo..."
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Filtrar por interesses</h3>
                {(selectedInterests.length > 0 || search) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Pending Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Solicitações de Conexão Pendentes ({pendingRequests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.connectionId}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold overflow-hidden">
                      {request.requester?.profile?.avatarUrl ? (
                        <img 
                          src={request.requester.profile.avatarUrl} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        request.requester?.name?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.requester?.name}</p>
                      {request.message && (
                        <p className="text-sm text-gray-500 truncate">"{request.message}"</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => respondToRequest.mutate({ 
                          connectionId: request.connectionId, 
                          accept: true 
                        })}
                        disabled={respondToRequest.isPending}
                      >
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToRequest.mutate({ 
                          connectionId: request.connectionId, 
                          accept: false 
                        })}
                        disabled={respondToRequest.isPending}
                      >
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : members && members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member: Member) => (
              <MemberCard 
                key={member.id} 
                member={member} 
                currentUserId={user?.id}
                onConnect={() => sendConnectionRequest.mutate({ receiverId: member.id })}
                isConnecting={sendConnectionRequest.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nenhum membro encontrado</p>
            <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </main>
    </div>
  );
}

function MemberCard({ 
  member, 
  currentUserId,
  onConnect,
  isConnecting
}: { 
  member: Member;
  currentUserId?: number;
  onConnect: () => void;
  isConnecting: boolean;
}) {
  const isOwnProfile = member.id === currentUserId;
  const interests = member.profile?.interests 
    ? JSON.parse(member.profile.interests) 
    : [];

  const { data: connectionStatus } = trpc.connections.getConnectionStatus.useQuery(
    { userId: member.id },
    { enabled: !isOwnProfile && !!currentUserId }
  );

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Cover */}
        <div className="h-20 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500" />
        
        <div className="p-4 -mt-10">
          {/* Avatar */}
          <Link href={`/user/${member.id}`}>
            <div className="w-20 h-20 rounded-full border-4 border-white bg-white overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform">
              {member.profile?.avatarUrl ? (
                <img 
                  src={member.profile.avatarUrl} 
                  alt={member.name || ""} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="mt-3">
            <Link href={`/user/${member.id}`}>
              <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                {member.name || "Usuário"}
                {isOwnProfile && (
                  <Badge variant="secondary" className="ml-2 text-xs">Você</Badge>
                )}
              </h3>
            </Link>
            
            {member.profile?.headline && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {member.profile.headline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
              {member.profile?.company && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {member.profile.company}
                </span>
              )}
              {member.profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {member.profile.location}
                </span>
              )}
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                Nível {member.level}
              </Badge>
              <span className="text-xs text-gray-500">
                {member.totalPoints} pontos
              </span>
            </div>

            {/* Interests */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {interests.slice(0, 3).map((interest: string) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {interests.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{interests.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Connection Button */}
            {!isOwnProfile && currentUserId && (
              <div className="mt-4">
                {connectionStatus?.status === "accepted" ? (
                  <Button variant="secondary" size="sm" className="w-full" disabled>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Conectados
                  </Button>
                ) : connectionStatus?.status === "pending" ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    {connectionStatus.isRequester ? "Aguardando" : "Responder"}
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={onConnect}
                    disabled={isConnecting}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Conectar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
