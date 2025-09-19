
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Save, CheckCircle, ExternalLink, Search, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Lead = { id: string; customer_name: string; } | null | undefined;

interface MenuResearchPanelProps {
  lead?: Lead;
  isLoadingLead?: boolean;
}

type MenuResult = {
  label: string;
  url: string;
  type: string;
  source: 'website' | 'instagram' | 'facebook' | 'delivery_platform' | 'review_site' | 'food_blog';
};

type SavedMenu = {
  id: string;
  label: string;
  url: string;
  type: string;
  source: string;
  storage_path: string | null;
  created_at: string;
}

type ResearchResponse = {
  step1_general_research?: string;
  step2_targeted_search?: string;
  results: MenuResult[];
  debug_info?: {
    step1_completed: boolean;
    step2_completed: boolean;
    results_found?: number;
    reason?: string;
    error?: string;
  };
};

const MenuResearchPanel = ({ lead }: MenuResearchPanelProps) => {
  const { id: leadId } = useParams<{ id: string }>();
  const [criteria, setCriteria] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MenuResult[]>([]);
  const [researchData, setResearchData] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [useIterativeSearch, setUseIterativeSearch] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedMenus, isLoading: isLoadingSavedMenus } = useQuery({
    queryKey: ['savedMenus', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const { data, error } = await supabase
        .from('menu_research_results')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!leadId,
  });

  useEffect(() => {
    if (lead?.customer_name && !criteria) {
      setCriteria(lead.customer_name);
    }
  }, [lead]);

  const handleResearch = async () => {
    setLoading(true);
    setResults([]);
    setResearchData(null);
    setError(null);
    
    try {
      const action = useIterativeSearch ? 'research_iterative' : 'research';
      const { data, error: fnError } = await supabase.functions.invoke("menu-research", {
        body: { action, query: criteria },
      });

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);
      
      if (useIterativeSearch) {
        setResearchData(data as ResearchResponse);
        setResults(data.results || []);
      } else {
        if (!data || !data.results) throw new Error("No menu results found in the response.");
        setResults(data.results);
      }

      if ((data.results || []).length === 0) {
        const message = data.debug_info?.reason === "Limited online presence found" 
          ? "Limited online presence found for this business."
          : "No menus could be found for this business. Try a more specific query.";
        
        toast({
          title: "No Menus Found",
          description: message,
        });
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Research failed.";
      setError(errorMessage);
      toast({
        title: "Menu Research Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSaveMenu = async (result: MenuResult, index: number) => {
    if (!leadId) return;
    setSavingStates(prev => ({ ...prev, [index]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("menu-research", {
        body: { action: 'save', lead_id: leadId, result }
      });
      if (error || data.error) throw new Error(error?.message || data.error);
      toast({
        title: "Menu Saved!",
        description: `${result.label} has been saved to this lead.`,
      });
      queryClient.invalidateQueries({ queryKey: ['savedMenus', leadId] });
    } catch (e: unknown) {
      toast({
        title: "Save Failed",
        description: e instanceof Error ? e.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const isMenuSaved = (url: string) => savedMenus?.some(m => m.url === url);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('menus').getPublicUrl(path);
    return data.publicUrl;
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'website': return 'bg-blue-100 text-blue-800';
      case 'instagram': return 'bg-pink-100 text-pink-800';
      case 'facebook': return 'bg-blue-100 text-blue-800';
      case 'delivery_platform': return 'bg-green-100 text-green-800';
      case 'review_site': return 'bg-yellow-100 text-yellow-800';
      case 'food_blog': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Enter business name, e.g., 'Iode Bangkok' or 'Gaggan Anand'"
          value={criteria}
          onChange={e => setCriteria(e.target.value)}
          disabled={loading}
        />
        <div className="flex gap-2 mt-2">
          <Button size="sm" disabled={loading || !criteria} onClick={handleResearch}>
            <Search className={loading ? "hidden" : "mr-1 h-4 w-4"} />
            <Loader2 className={loading ? "animate-spin mr-1 h-4 w-4" : "hidden"} />
            {useIterativeSearch ? "Smart Research" : "Quick Research"}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setUseIterativeSearch(!useIterativeSearch)}
            disabled={loading}
          >
            {useIterativeSearch ? "Switch to Quick" : "Switch to Smart"}
          </Button>
        </div>
        {useIterativeSearch && (
          <p className="text-xs text-muted-foreground mt-1">
            Smart research performs a two-step process for better results
          </p>
        )}
      </div>
      
      {error && <div className="text-destructive mb-2 text-sm">{error}</div>}
      
      {loading && (
        <div className="flex items-center gap-2 my-4 text-muted-foreground">
          <Loader2 className="animate-spin" />
          {useIterativeSearch ? "Conducting smart research... This may take a moment." : "Searching for menus... This can take a moment."}
        </div>
      )}

      {/* Debug Information for Iterative Research */}
      {researchData && useIterativeSearch && (
        <div className="mb-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Research Process Debug
                <Badge variant={researchData.debug_info?.step1_completed ? "default" : "destructive"}>
                  Step 1: {researchData.debug_info?.step1_completed ? "✓" : "✗"}
                </Badge>
                <Badge variant={researchData.debug_info?.step2_completed ? "default" : "destructive"}>
                  Step 2: {researchData.debug_info?.step2_completed ? "✓" : "✗"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {researchData.step1_general_research && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Step 1: General Research</h4>
                  <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                    {researchData.step1_general_research}
                  </div>
                </div>
              )}
              
              {researchData.step2_targeted_search && researchData.step2_targeted_search !== "Skipped due to limited online presence" && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Step 2: Targeted Menu Search</h4>
                  <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                    {researchData.step2_targeted_search}
                  </div>
                </div>
              )}

              {researchData.debug_info && (
                <div className="text-xs text-muted-foreground">
                  Results found: {researchData.debug_info.results_found || 0}
                  {researchData.debug_info.reason && ` • ${researchData.debug_info.reason}`}
                  {researchData.debug_info.error && ` • Error: ${researchData.debug_info.error}`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Research Results:</h3>
          <div className="space-y-3">
            {results.map((result, i) => (
              <div key={i} className="p-3 rounded border flex flex-col sm:flex-row sm:items-center gap-4 bg-muted/90">
                <div className="flex-1 min-w-0">
                  <div className="font-medium flex items-center gap-2 mb-1">
                    <span>{result.label}</span>
                    <Badge className={getSourceBadgeColor(result.source)}>
                      {result.source.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{result.type}</Badge>
                  </div>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-muted-foreground hover:underline">{result.url}</a>
                </div>
                <div className="flex gap-2">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline"><ExternalLink className="w-4 h-4 mr-1" />View</Button>
                  </a>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={savingStates[i] || isMenuSaved(result.url)}
                    onClick={() => handleSaveMenu(result, i)}
                  >
                    {isMenuSaved(result.url) ? <CheckCircle className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    {savingStates[i] ? "Saving..." : isMenuSaved(result.url) ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoadingSavedMenus && (
        <div className="flex items-center gap-2 my-4 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Loading saved menus…
        </div>
      )}

      {savedMenus && savedMenus.length > 0 && (
         <div className="mt-6 pt-4 border-t">
          <h3 className="font-semibold mb-2">Saved Menus:</h3>
          <div className="space-y-3">
            {savedMenus.map((menu: SavedMenu) => (
              <div key={menu.id} className="p-3 rounded border flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium flex items-center gap-2 mb-1">
                    {menu.label}
                    <Badge className={getSourceBadgeColor(menu.source)}>
                      {menu.source.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">Saved on {new Date(menu.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  {menu.storage_path ? (
                    <a href={getPublicUrl(menu.storage_path)} target="_blank" rel="noopener noreferrer" download>
                      <Button size="sm" variant="default">
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                    </a>
                  ) : (
                    <a href={menu.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline"><ExternalLink className="w-4 h-4 mr-1" />View Original</Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuResearchPanel;
