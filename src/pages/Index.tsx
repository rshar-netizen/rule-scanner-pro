import { Header } from '@/components/Header';
import { DQExtractionTab } from '@/components/DQExtractionTab';
import { RuleCreationTab } from '@/components/RuleCreationTab';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSearch, BarChart3, Settings, Wand2 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-6">
          <h2 className="text-4xl font-bold tracking-tight">
            Data Quality <span className="text-gradient">LLM Tool</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered extraction and validation of data quality rules from your ingestion pipelines.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="extraction" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="extraction" className="flex items-center gap-2">
              <FileSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Rule Extraction</span>
            </TabsTrigger>
            <TabsTrigger value="creation" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Rule Creation</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" disabled>
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="extraction" className="mt-0">
            <DQExtractionTab />
          </TabsContent>

          <TabsContent value="creation" className="mt-0">
            <RuleCreationTab />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="glass-card p-12 text-center">
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Data Quality LLM Tool • PGIM Real Estate Demo</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
