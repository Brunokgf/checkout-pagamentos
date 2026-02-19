import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, customer, productName } = await req.json();

    if (!amount || !customer?.name || !customer?.email || !customer?.cpf) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: amount, customer.name, customer.email, customer.cpf" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretKey = Deno.env.get("MEDUSAPAY_SECRET_KEY");
    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: "Chave da MedusaPay não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authToken = btoa(`${secretKey}:x`);

    const response = await fetch("https://api.v2.medusapay.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify({
        amount,
        paymentMethod: "pix",
        items: [
          {
            title: productName || "Slepp",
            unitPrice: amount,
            quantity: 1,
            tangible: true,
          },
        ],
        customer: {
          name: customer.name,
          email: customer.email,
          document: {
            number: customer.cpf,
            type: customer.cpf.length <= 11 ? "cpf" : "cnpj",
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("MedusaPay error:", data);
      return new Response(
        JSON.stringify({ error: "Erro ao criar transação PIX", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
