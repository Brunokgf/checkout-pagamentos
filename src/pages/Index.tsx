import { useState } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PixResult } from "@/components/checkout/PixResult";
import { Shield, Lock } from "lucide-react";
import logo from "@/assets/logo.png";

export interface CustomerData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export type PaymentMethod = "pix" | "card";

const PRODUCT = {
  name: "Slepp",
  description: "Descrição do seu produto aqui",
  price: 99.0,
  image: "/placeholder.svg",
};

const Index = () => {
  const [pixData, setPixData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-accent">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <img src={logo} alt="PagSeguro" className="h-10" />
          <div className="flex items-center gap-2 text-sm text-accent-foreground/80">
            <Lock className="h-4 w-4" />
            <span>Pagamento Seguro</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {pixData ? (
          <PixResult data={pixData} product={PRODUCT} onBack={() => setPixData(null)} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form - 3 cols */}
            <div className="lg:col-span-3">
              <CheckoutForm product={PRODUCT} onPixSuccess={setPixData} />
            </div>

            {/* Summary - 2 cols */}
            <div className="lg:col-span-2">
              <OrderSummary product={PRODUCT} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-4 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Seus dados estão protegidos com criptografia SSL</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
