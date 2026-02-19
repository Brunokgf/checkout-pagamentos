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
      <header className="border-b border-primary bg-primary">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <img src={logo} alt="PagSeguro" className="h-8 sm:h-10" />
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-primary-foreground/80">
            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Pagamento Seguro</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-8">
        {pixData ? (
          <PixResult data={pixData} product={PRODUCT} onBack={() => setPixData(null)} />
        ) : (
          <div className="flex flex-col gap-4 sm:gap-8 lg:grid lg:grid-cols-5">
            {/* Summary first on mobile */}
            <div className="order-first lg:order-last lg:col-span-2">
              <OrderSummary product={PRODUCT} />
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <CheckoutForm product={PRODUCT} onPixSuccess={setPixData} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-accent bg-accent py-4 sm:py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-1.5 px-3 sm:px-4 text-xs sm:text-sm text-accent-foreground">
          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Seus dados estão protegidos com criptografia SSL</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
