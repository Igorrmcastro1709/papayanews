import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Gift, Star, Sparkles, Package, Award, Coins, ArrowLeft, Check, Loader2, ShoppingCart, History } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: "physical" | "digital" | "experience" | "badge";
  pointsPrice: number;
  cashPrice: number;
  stock: number;
  minLevel: number;
  isLimited: number;
  isActive: number;
  totalSold: number;
};

const categoryIcons = {
  physical: Package,
  digital: Sparkles,
  experience: Star,
  badge: Award,
};

const categoryLabels = {
  physical: "Físico",
  digital: "Digital",
  experience: "Experiência",
  badge: "Badge",
};

const categoryColors = {
  physical: "bg-blue-500/10 text-blue-500",
  digital: "bg-purple-500/10 text-purple-500",
  experience: "bg-amber-500/10 text-amber-500",
  badge: "bg-green-500/10 text-green-500",
};

export default function Shop() {
  const { user, isLoading: authLoading } = useAuth() as any;
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Brasil",
    notes: "",
  });

  const { data: products, isLoading } = trpc.shop.getProducts.useQuery(
    selectedCategory !== "all" ? { category: selectedCategory } : undefined
  );
  const { data: userProfile } = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: myOrders } = trpc.shop.getMyOrders.useQuery(undefined, {
    enabled: !!user,
  });

  const redeemMutation = trpc.shop.redeemWithPoints.useMutation({
    onSuccess: () => {
      toast.success("Resgate realizado com sucesso! 🎉");
      setShowRedeemDialog(false);
      setSelectedProduct(null);
      setShippingInfo({
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "Brasil",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const userPoints = userProfile?.points?.totalPoints || 0;
  const userLevel = userProfile?.points?.level || 1;

  const handleRedeem = () => {
    if (!selectedProduct) return;

    const data: any = {
      productId: selectedProduct.id,
      quantity: 1,
    };

    // Adicionar dados de entrega para produtos físicos
    if (selectedProduct.category === "physical") {
      data.shippingName = shippingInfo.name;
      data.shippingAddress = shippingInfo.address;
      data.shippingCity = shippingInfo.city;
      data.shippingState = shippingInfo.state;
      data.shippingZip = shippingInfo.zip;
      data.shippingCountry = shippingInfo.country;
      data.notes = shippingInfo.notes;
    }

    redeemMutation.mutate(data);
  };

  const canRedeem = (product: Product) => {
    if (!user) return false;
    if (userPoints < product.pointsPrice) return false;
    if (userLevel < product.minLevel) return false;
    if (product.stock === 0) return false;
    return true;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500" },
      confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-500" },
      shipped: { label: "Enviado", color: "bg-purple-500/10 text-purple-500" },
      delivered: { label: "Entregue", color: "bg-green-500/10 text-green-500" },
      cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500" },
    };
    return statusMap[status] || { label: status, color: "bg-gray-500/10 text-gray-500" };
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Papaya Shop</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOrdersDialog(true)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Meus Pedidos
                  </Button>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Coins className="h-5 w-5 text-primary" />
                    <span className="font-bold text-primary">{userPoints} pontos</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Gift className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Troque seus pontos por recompensas</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Loja de Recompensas</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Acumule pontos participando da comunidade e troque por produtos exclusivos,
            experiências incríveis e badges especiais!
          </p>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="physical">Físicos</TabsTrigger>
            <TabsTrigger value="digital">Digitais</TabsTrigger>
            <TabsTrigger value="experience">Experiências</TabsTrigger>
            <TabsTrigger value="badge">Badges</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const CategoryIcon = categoryIcons[product.category];
              const canUserRedeem = canRedeem(product);

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="aspect-square bg-muted relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CategoryIcon className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                      <Badge className={categoryColors[product.category]}>
                        {categoryLabels[product.category]}
                      </Badge>
                      {product.isLimited === 1 && (
                        <Badge variant="destructive">Edição Limitada</Badge>
                      )}
                    </div>
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Esgotado</span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description || "Sem descrição"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-primary font-bold text-xl">
                        <Coins className="h-5 w-5" />
                        {product.pointsPrice}
                      </div>
                      {product.minLevel > 1 && (
                        <Badge variant="outline">Nível {product.minLevel}+</Badge>
                      )}
                    </div>
                    {product.stock > 0 && product.stock < 10 && (
                      <p className="text-xs text-destructive mt-2">
                        Apenas {product.stock} restantes!
                      </p>
                    )}
                  </CardContent>

                  <CardFooter>
                    {user ? (
                      <Button
                        className="w-full"
                        disabled={!canUserRedeem}
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowRedeemDialog(true);
                        }}
                      >
                        {!canUserRedeem ? (
                          userPoints < product.pointsPrice ? (
                            "Pontos insuficientes"
                          ) : userLevel < product.minLevel ? (
                            `Requer nível ${product.minLevel}`
                          ) : (
                            "Indisponível"
                          )
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Resgatar
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <a href={getLoginUrl()}>Faça login para resgatar</a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto disponível</h3>
            <p className="text-muted-foreground">
              Em breve teremos novos produtos para você resgatar!
            </p>
          </div>
        )}
      </main>

      {/* Redeem Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
            <DialogDescription>
              Você está prestes a resgatar este produto com seus pontos.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {selectedProduct.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {(() => {
                        const Icon = categoryIcons[selectedProduct.category];
                        return <Icon className="h-8 w-8 text-muted-foreground/30" />;
                      })()}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedProduct.name}</h4>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <Coins className="h-4 w-4" />
                    {selectedProduct.pointsPrice} pontos
                  </div>
                </div>
              </div>

              {/* Shipping info for physical products */}
              {selectedProduct.category === "physical" && (
                <div className="space-y-4 border-t pt-4">
                  <h5 className="font-medium">Dados de Entrega</h5>
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        placeholder="Rua, número, complemento"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zip">CEP</Label>
                      <Input
                        id="zip"
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Textarea
                        id="notes"
                        value={shippingInfo.notes}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                        placeholder="Instruções especiais de entrega..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Seus pontos:</span>
                  <span className="font-medium">{userPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Custo:</span>
                  <span className="font-medium text-destructive">-{selectedProduct.pointsPrice}</span>
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between items-center">
                  <span className="font-medium">Saldo após resgate:</span>
                  <span className="font-bold text-primary">
                    {userPoints - selectedProduct.pointsPrice}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRedeemDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={redeemMutation.isPending || (selectedProduct?.category === "physical" && !shippingInfo.name)}
            >
              {redeemMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Resgate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Orders Dialog */}
      <Dialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meus Pedidos</DialogTitle>
            <DialogDescription>
              Histórico de resgates realizados na Papaya Shop
            </DialogDescription>
          </DialogHeader>

          {myOrders && myOrders.length > 0 ? (
            <div className="space-y-4">
              {myOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {order.productImage ? (
                          <img
                            src={order.productImage}
                            alt={order.productName || "Produto"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{order.productName}</h4>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            {order.pointsSpent} pontos
                          </span>
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Você ainda não fez nenhum resgate</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
