import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Database,
  FileCode,
  Layers,
  ChevronDown,
  ChevronRight,
  Shield,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useState } from 'react';

// PGIM Real Estate analytics data based on data dictionary
const getAnalyticsData = () => {
  // Data domains from PGIM Real Estate data dictionary
  const domains = [
    {
      name: 'property_master',
      displayName: 'Property Master',
      rulesExtracted: 156,
      rulesPassed: 148,
      rulesFailed: 5,
      rulesWarnings: 3,
      passRate: '94.9',
      totalRowsAffected: 2847000,
      severityCounts: { ERROR: 5, WARN: 3, INFO: 148 }
    },
    {
      name: 'tenant_master',
      displayName: 'Tenant Master',
      rulesExtracted: 78,
      rulesPassed: 74,
      rulesFailed: 2,
      rulesWarnings: 2,
      passRate: '94.9',
      totalRowsAffected: 1245000,
      severityCounts: { ERROR: 2, WARN: 2, INFO: 74 }
    },
    {
      name: 'lease_master',
      displayName: 'Lease Master',
      rulesExtracted: 112,
      rulesPassed: 105,
      rulesFailed: 4,
      rulesWarnings: 3,
      passRate: '93.8',
      totalRowsAffected: 3892000,
      severityCounts: { ERROR: 4, WARN: 3, INFO: 105 }
    },
    {
      name: 'property_portfolio_map',
      displayName: 'Portfolio Mapping',
      rulesExtracted: 45,
      rulesPassed: 43,
      rulesFailed: 1,
      rulesWarnings: 1,
      passRate: '95.6',
      totalRowsAffected: 956000,
      severityCounts: { ERROR: 1, WARN: 1, INFO: 43 }
    },
    {
      name: 'deal_pipeline',
      displayName: 'Deal Pipeline',
      rulesExtracted: 95,
      rulesPassed: 89,
      rulesFailed: 4,
      rulesWarnings: 2,
      passRate: '93.7',
      totalRowsAffected: 1823000,
      severityCounts: { ERROR: 4, WARN: 2, INFO: 89 }
    },
    {
      name: 'capex_project',
      displayName: 'CapEx Projects',
      rulesExtracted: 104,
      rulesPassed: 98,
      rulesFailed: 3,
      rulesWarnings: 3,
      passRate: '94.2',
      totalRowsAffected: 2156000,
      severityCounts: { ERROR: 3, WARN: 3, INFO: 98 }
    },
    {
      name: 'property_valuation',
      displayName: 'Property Valuation',
      rulesExtracted: 87,
      rulesPassed: 83,
      rulesFailed: 2,
      rulesWarnings: 2,
      passRate: '95.4',
      totalRowsAffected: 1534000,
      severityCounts: { ERROR: 2, WARN: 2, INFO: 83 }
    },
    {
      name: 'property_esg_metrics',
      displayName: 'ESG Metrics',
      rulesExtracted: 96,
      rulesPassed: 91,
      rulesFailed: 3,
      rulesWarnings: 2,
      passRate: '94.8',
      totalRowsAffected: 2145000,
      severityCounts: { ERROR: 3, WARN: 2, INFO: 91 }
    }
  ];

  const totalExtracted = 773;  // Sum of all rules
  const totalPassed = 731;
  const totalFailed = 24;
  const totalWarnings = 18;
  
  return {
    domain: {
      name: 'PGIM Real Estate',
      description: 'Real Estate Investment Data Quality Platform',
      subdomains: domains
    },
    totals: {
      extracted: totalExtracted,
      passed: totalPassed,
      failed: totalFailed,
      warnings: totalWarnings,
      created: 89,
      createdPassed: 84,
      createdFailed: 5,
      overallPassRate: '94.6'
    }
  };
};

// Trend data for charts - PGIM scale
const trendData = [
  { date: 'Jan 20', extracted: 745, passed: 702, failed: 43 },
  { date: 'Jan 21', extracted: 752, passed: 711, failed: 41 },
  { date: 'Jan 22', extracted: 758, passed: 718, failed: 40 },
  { date: 'Jan 23', extracted: 763, passed: 722, failed: 41 },
  { date: 'Jan 24', extracted: 768, passed: 726, failed: 42 },
  { date: 'Jan 25', extracted: 770, passed: 728, failed: 42 },
  { date: 'Jan 26', extracted: 773, passed: 731, failed: 42 },
];

const chartConfig = {
  extracted: { label: 'Extracted', color: 'hsl(var(--primary))' },
  passed: { label: 'Passed', color: 'hsl(142, 76%, 36%)' },
  failed: { label: 'Failed', color: 'hsl(0, 84%, 60%)' },
  warnings: { label: 'Warnings', color: 'hsl(45, 93%, 47%)' },
  property: { label: 'Property Master', color: 'hsl(var(--primary))' },
  tenant: { label: 'Tenant Master', color: 'hsl(262, 83%, 58%)' },
};

export const AnalyticsDashboard = () => {
  const [expandedSubdomains, setExpandedSubdomains] = useState<Set<string>>(new Set(['property_master', 'lease_master']));
  const analytics = getAnalyticsData();
  
  const toggleSubdomain = (name: string) => {
    const newExpanded = new Set(expandedSubdomains);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedSubdomains(newExpanded);
  };

  const pieData = [
    { name: 'Passed', value: analytics.totals.passed, fill: 'hsl(142, 76%, 36%)' },
    { name: 'Failed', value: analytics.totals.failed, fill: 'hsl(0, 84%, 60%)' },
    { name: 'Warnings', value: analytics.totals.warnings, fill: 'hsl(45, 93%, 47%)' },
  ];

  const subdomainComparisonData = analytics.domain.subdomains.map(sd => ({
    name: sd.displayName,
    extracted: sd.rulesExtracted,
    passed: sd.rulesPassed,
    failed: sd.rulesFailed,
    warnings: sd.rulesWarnings
  }));

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Comprehensive summary of data quality rules across domains and subdomains. 
                Track extraction metrics, pass/fail rates, and rule creation statistics 
                to monitor data quality health.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rules Extracted</p>
                <p className="text-2xl font-bold">{analytics.totals.extracted}</p>
                <p className="text-xs text-primary flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> From 89 pipelines
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileCode className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-success/30 hover:border-success/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rules Passed</p>
                <p className="text-2xl font-bold text-success">{analytics.totals.passed}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> {analytics.totals.overallPassRate}% pass rate
                </p>
              </div>
              <div className="p-2 rounded-lg bg-success/10">
                <Shield className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive/30 hover:border-destructive/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rules Failed</p>
                <p className="text-2xl font-bold text-destructive">{analytics.totals.failed}</p>
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <XCircle className="w-3 h-3" /> Requires attention
                </p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/30 hover:border-warning/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rules Created</p>
                <p className="text-2xl font-bold text-warning">{analytics.totals.created}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3" /> {analytics.totals.createdPassed} passed
                </p>
              </div>
              <div className="p-2 rounded-lg bg-warning/10">
                <Target className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Status Distribution */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Rule Status Distribution
            </CardTitle>
            <CardDescription>Overall pass/fail/warning breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subdomain Comparison */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Subdomain Comparison
            </CardTitle>
            <CardDescription>Rules by table/subdomain</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={subdomainComparisonData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="passed" name="Passed" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Failed" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="warnings" name="Warnings" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Rule Execution Trend (7 Days)
          </CardTitle>
          <CardDescription>Historical pass/fail trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <AreaChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="passed" 
                name="Passed"
                stackId="1"
                stroke="hsl(142, 76%, 36%)" 
                fill="hsl(142, 76%, 36%)" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="failed" 
                name="Failed"
                stackId="1"
                stroke="hsl(0, 84%, 60%)" 
                fill="hsl(0, 84%, 60%)" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Domain Summary */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{analytics.domain.name}</CardTitle>
              <CardDescription>{analytics.domain.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.domain.subdomains.map((subdomain) => (
            <Collapsible 
              key={subdomain.name}
              open={expandedSubdomains.has(subdomain.name)}
              onOpenChange={() => toggleSubdomain(subdomain.name)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {expandedSubdomains.has(subdomain.name) ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {subdomain.displayName}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {subdomain.rulesExtracted} rules extracted
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">{subdomain.rulesPassed}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">{subdomain.rulesFailed}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium text-warning">{subdomain.rulesWarnings}</span>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2 p-4 rounded-lg bg-background/30 border border-border/30 space-y-4">
                  {/* Pass Rate Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pass Rate</span>
                      <span className="font-medium">{subdomain.passRate}%</span>
                    </div>
                    <Progress value={parseFloat(subdomain.passRate)} className="h-2" />
                  </div>
                  
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                      <p className="text-xs text-muted-foreground">Total Rules</p>
                      <p className="text-lg font-semibold">{subdomain.rulesExtracted}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                      <p className="text-xs text-muted-foreground">Rows Affected</p>
                      <p className="text-lg font-semibold">{subdomain.totalRowsAffected}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                      <p className="text-xs text-muted-foreground">Error Rules</p>
                      <p className="text-lg font-semibold text-destructive">{subdomain.severityCounts.ERROR}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                      <p className="text-xs text-muted-foreground">Warning Rules</p>
                      <p className="text-lg font-semibold text-warning">{subdomain.severityCounts.WARN}</p>
                    </div>
                  </div>

                  {/* Severity Breakdown */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">By Severity:</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                        ERROR: {subdomain.severityCounts.ERROR}
                      </Badge>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        WARN: {subdomain.severityCounts.WARN}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                        INFO: {subdomain.severityCounts.INFO}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <p className="text-2xl font-bold text-primary">89</p>
              <p className="text-xs text-muted-foreground">Pipelines Scanned</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">Data Domains</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <p className="text-2xl font-bold">773</p>
              <p className="text-xs text-muted-foreground">Total Rules</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <p className="text-2xl font-bold">16.6M</p>
              <p className="text-xs text-muted-foreground">Rows Processed</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-success/30">
              <p className="text-2xl font-bold text-success">94.6%</p>
              <p className="text-xs text-muted-foreground">Overall Health</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
