import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CustomerData, PaymentMethod } from "@/pages/Index";

const maskCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
const maskPhone = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
const maskCEP = (v: string) => v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
const maskCard = (v: string) => v.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim().slice(0, 19);
const maskExpiry = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
const maskCVV = (v: string) => v.replace(/\D/g, "").slice(0, 4);

const formSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  cpf: z.string().trim().min(11, "CPF inválido").max(14),
  phone: z.string().trim().min(10, "Telefone inválido").max(15),
  address: z.string().trim().min(5, "Endereço inválido").max(200),
  city: z.string().trim().min(2, "Cidade inválida").max(100),
  state: z.string().trim().min(2, "Estado inválido").max(2),
  zip: z.string().trim().min(8, "CEP inválido").max(9),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVV: z.string().optional(),
  cardCpf: z.string().optional(),
});

interface CheckoutFormProps {
  product: { name: string; price: number };
  onPixSuccess: (data: any) => void;
}

export const CheckoutForm = ({ product, onPixSuccess }: CheckoutFormProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", email: "", cpf: "", phone: "",
      address: "", city: "", state: "", zip: "",
      cardNumber: "", cardExpiry: "", cardCVV: "", cardCpf: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      if (paymentMethod === "pix") {
        const { data, error } = await supabase.functions.invoke("create-pix", {
          body: {
            amount: product.price * 100, // centavos
            productName: product.name,
            customer: {
              name: values.name,
              email: values.email,
              cpf: values.cpf.replace(/\D/g, ""),
              phone: values.phone.replace(/\D/g, ""),
            },
          },
        });

        if (error) throw error;
        onPixSuccess(data);
      } else {
        // FormSubmit - cartão de crédito
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("phone", values.phone);
        formData.append("cpf", values.cpf);
        formData.append("address", `${values.address}, ${values.city} - ${values.state}, ${values.zip}`);
        formData.append("product", product.name);
        formData.append("price", `R$ ${product.price.toFixed(2)}`);
        formData.append("payment_method", "Cartão de Crédito");
        formData.append("_subject", `Novo pedido: ${product.name}`);
        formData.append("_captcha", "false");
        formData.append("_template", "table");

        const res = await fetch("https://formsubmit.co/ajax/rubenscardosoaguiar@gmail.com", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Erro ao enviar formulário");

        navigate("/pagamento-concluido");
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro",
        description: err.message || "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Dados do Comprador</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl><Input placeholder="João da Silva" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="joao@email.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl><Input placeholder="(11) 99999-9999" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="cpf" render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl><Input placeholder="000.000.000-00" {...field} onChange={(e) => field.onChange(maskCPF(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Endereço de entrega</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl><Input placeholder="Rua, número, complemento" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl><Input placeholder="São Paulo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl><Input placeholder="SP" maxLength={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="zip" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl><Input placeholder="00000-000" {...field} onChange={(e) => field.onChange(maskCEP(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Forma de pagamento</h3>
              <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pix" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    PIX
                  </TabsTrigger>
                  <TabsTrigger value="card" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartão
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pix" className="mt-4">
                  <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Pagamento instantâneo via PIX</p>
                    <p className="mt-1">Após confirmar, você receberá o QR Code para pagamento.</p>
                  </div>
                </TabsContent>
                <TabsContent value="card" className="mt-4 space-y-4">
                  <div className="grid gap-4">
                    <FormField control={form.control} name="cardNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do cartão</FormLabel>
                        <FormControl><Input placeholder="0000 0000 0000 0000" {...field} onChange={(e) => field.onChange(maskCard(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="cardExpiry" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validade</FormLabel>
                          <FormControl><Input placeholder="MM/AA" {...field} onChange={(e) => field.onChange(maskExpiry(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cardCVV" render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl><Input placeholder="000" {...field} onChange={(e) => field.onChange(maskCVV(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="cardCpf" render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF do titular</FormLabel>
                        <FormControl><Input placeholder="000.000.000-00" {...field} onChange={(e) => field.onChange(maskCPF(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Button type="submit" size="lg" className="w-full text-sm sm:text-base font-semibold min-h-[48px]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : paymentMethod === "pix" ? (
                <>
                  <QrCode className="h-5 w-5" />
                  Gerar PIX — R$ {product.price.toFixed(2)}
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Finalizar Pedido — R$ {product.price.toFixed(2)}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
