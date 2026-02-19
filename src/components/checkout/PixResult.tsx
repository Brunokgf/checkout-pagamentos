import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PixResultProps {
  data: any;
  product: { name: string; price: number };
  onBack: () => void;
}

export const PixResult = ({ data, product, onBack }: PixResultProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const pixCode = data?.pix?.qr_code || data?.qr_code || data?.pix_code || "";
  const pixQrCodeUrl = data?.pix?.qr_code_url || data?.qr_code_url || "";

  const handleCopy = async () => {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({ title: "Código PIX copiado!" });
    setTimeout(() => setCopied(false), 3000);
  };

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card className="border-border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Pague via PIX</CardTitle>
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code ou copie o código para pagar {formattedPrice}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          {pixQrCodeUrl ? (
            <div className="flex justify-center">
              <img
                src={pixQrCodeUrl}
                alt="QR Code PIX"
                className="h-56 w-56 rounded-lg border border-border"
              />
            </div>
          ) : (
            <div className="flex h-56 w-56 mx-auto items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
              <span className="text-sm text-muted-foreground">QR Code</span>
            </div>
          )}

          {/* Copy code */}
          {pixCode && (
            <div className="space-y-2">
              <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Código PIX Copia e Cola
              </p>
              <div className="flex gap-2">
                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-border bg-muted px-3 py-2 text-xs">
                  {pixCode}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted/50 border border-border p-4 text-center text-sm text-muted-foreground">
            <p>Após o pagamento, a confirmação é automática em alguns segundos.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
