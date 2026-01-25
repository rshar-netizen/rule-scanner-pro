import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { CodeScanner } from '@/components/CodeScanner';
import { RulesCatalog } from '@/components/RulesCatalog';
import { RuntimeLogs } from '@/components/RuntimeLogs';
import { PipelineHealth } from '@/components/PipelineHealth';
import { mockRules, mockPipelines } from '@/data/mockData';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const Index = () => {
  const totalRules = mockRules.length;
  const passingRules = mockRules.filter(r => r.status === 'passing').length;
  const failingRules = mockRules.filter(r => r.status === 'failing').length;
  const warningRules = mockRules.filter(r => r.status === 'warning').length;
  const avgPassRate = (mockRules.reduce((sum, r) => sum + r.passRate, 0) / mockRules.length).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-4xl font-bold tracking-tight">
            Data Quality <span className="text-gradient">Rules Visibility</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatically extract, track, and monitor data quality rules from your ingestion pipelines. 
            Get real-time visibility into rule execution and compliance.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Rules"
            value={totalRules}
            subtitle="Extracted from codebase"
            icon={ShieldCheck}
            variant="default"
          />
          <MetricCard
            title="Passing"
            value={passingRules}
            subtitle={`${((passingRules / totalRules) * 100).toFixed(0)}% of total`}
            icon={CheckCircle2}
            variant="success"
            trend={{ value: 2.4, isPositive: true }}
          />
          <MetricCard
            title="Failing"
            value={failingRules}
            subtitle="Requires attention"
            icon={AlertTriangle}
            variant="destructive"
            trend={{ value: 1.2, isPositive: false }}
          />
          <MetricCard
            title="Avg Pass Rate"
            value={`${avgPassRate}%`}
            subtitle="Across all rules"
            icon={Clock}
            variant="default"
          />
        </div>

        {/* Code Scanner */}
        <CodeScanner />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RulesCatalog />
          <div className="space-y-6">
            <RuntimeLogs />
            <PipelineHealth />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Data Quality Rules Visibility Demo • Real-time monitoring for your data pipelines</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
