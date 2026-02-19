import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

interface OrderSummaryProps {
  product: {
    name: string;
    description: string;
    price: number;
    image: string;
  };
}

export const OrderSummary = ({ product }: OrderSummaryProps) => {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  return (
    <div className="space-y-4">
      <Card className="sticky top-8 border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="h-20 w-20 rounded-lg border border-border bg-muted object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formattedPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span className="text-accent font-medium">Grátis</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formattedPrice}</span>
          </div>
        </CardContent>
      </Card>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: ShieldCheck, text: "Compra Segura" },
          { icon: Truck, text: "Entrega Rápida" },
          { icon: RotateCcw, text: "7 dias garantia" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 text-center"
          >
            <Icon className="h-5 w-5 text-accent" />
            <span className="text-xs text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
