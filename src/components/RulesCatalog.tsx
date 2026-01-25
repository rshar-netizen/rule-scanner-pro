import { useState } from 'react';
import { cn } from "@/lib/utils";
import { mockRules, DataQualityRule } from '@/data/mockData';
import { Search, Filter, ChevronDown, ChevronRight, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
  high: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  medium: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  low: { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' },
};

const statusConfig = {
  passing: { color: 'text-success', bg: 'bg-success/10', label: 'Passing' },
  failing: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Failing' },
  warning: { color: 'text-warning', bg: 'bg-warning/10', label: 'Warning' },
};

const categoryColors: Record<string, string> = {
  completeness: 'bg-blue-500/20 text-blue-400',
  validity: 'bg-purple-500/20 text-purple-400',
  uniqueness: 'bg-green-500/20 text-green-400',
  consistency: 'bg-orange-500/20 text-orange-400',
  timeliness: 'bg-pink-500/20 text-pink-400',
};

export function RulesCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);

  const filteredRules = mockRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = !filterSeverity || rule.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rules Catalog</h3>
          <p className="text-sm text-muted-foreground">{mockRules.length} rules extracted from codebase</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search rules..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <div className="flex gap-2">
          {['critical', 'high', 'medium', 'low'].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(filterSeverity === severity ? null : severity)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-lg transition-all",
                filterSeverity === severity 
                  ? severityConfig[severity as keyof typeof severityConfig].bg + ' ' + severityConfig[severity as keyof typeof severityConfig].color
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
        {filteredRules.map((rule) => {
          const SeverityIcon = severityConfig[rule.severity].icon;
          const isExpanded = expandedRule === rule.id;

          return (
            <div 
              key={rule.id}
              className={cn(
                "rounded-lg border transition-all duration-200",
                severityConfig[rule.severity].border,
                isExpanded ? "bg-card" : "bg-card/50 hover:bg-card"
              )}
            >
              <button
                onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    severityConfig[rule.severity].bg
                  )}>
                    <SeverityIcon className={cn("w-4 h-4", severityConfig[rule.severity].color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{rule.name}</span>
                      <Badge className={cn("text-xs", categoryColors[rule.category])}>
                        {rule.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    statusConfig[rule.status].bg,
                    statusConfig[rule.status].color
                  )}>
                    {rule.status === 'passing' && <CheckCircle2 className="w-3 h-3" />}
                    {rule.status === 'failing' && <AlertCircle className="w-3 h-3" />}
                    {rule.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                    {statusConfig[rule.status].label}
                  </div>
                  <span className="text-sm text-muted-foreground">{rule.passRate}%</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Source</span>
                      <p className="font-mono text-primary">{rule.source}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pipeline</span>
                      <p>{rule.pipeline}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Run</span>
                      <p>{rule.lastRun}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Code Snippet</span>
                    <pre className="code-block mt-2">
                      <code className="text-primary">{rule.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
