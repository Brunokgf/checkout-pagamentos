import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border shadow-sm text-center">
        <CardContent className="space-y-6 pt-10 pb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Pagamento Concluído!</h1>
            <p className="text-muted-foreground">
              Seu pedido foi recebido com sucesso. Você receberá um email com os detalhes.
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
