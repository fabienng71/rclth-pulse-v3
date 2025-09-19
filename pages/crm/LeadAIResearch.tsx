
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MenuResearchPanel from "@/components/crm/lead-research/MenuResearchPanel";
import ContactResearchPanel from "@/components/crm/lead-research/ContactResearchPanel";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LeadAIResearch = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: lead, isLoading: isLoadingLead } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("id, customer_name")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  return (
    <>
      <Navigation />
      <div className="container py-8 max-w-4xl mx-auto">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => navigate(`/crm/leads/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lead Details
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>
              🧠 AI Research for {isLoadingLead ? <Loader2 className="inline-block animate-spin h-5 w-5" /> : lead?.customer_name || "Lead"}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm">
              Research and collect business intelligence for this lead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="menu" className="w-full">
              <TabsList>
                <TabsTrigger value="menu">Menu Research</TabsTrigger>
                <TabsTrigger value="contact">Contact Research</TabsTrigger>
              </TabsList>
              <TabsContent value="menu">
                <MenuResearchPanel lead={lead} isLoadingLead={isLoadingLead} />
              </TabsContent>
              <TabsContent value="contact">
                <ContactResearchPanel />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LeadAIResearch;
