import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  Database,
  Code2,
  TestTube2,
  BookOpen,
  Calendar,
  User,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit3,
  Clock
} from 'lucide-react';

export interface CreatedRule {
  id: string;
  tableName: string;
  ruleId: string;
  codeSnippet: string;
  ruleDescription: string;
  severity: 'ERROR' | 'WARN' | 'INFO';
  actionTaken: string;
  createdAt: string;
  createdBy: string;
  version: string;
  isActive: boolean;
  testResult?: {
    status: 'pass' | 'fail' | 'warning' | 'pending';
    rowsAffected: number;
    message: string;
  };
}

// Pre-populated rules catalog to show existing created rules
export const INITIAL_CREATED_RULES: CreatedRule[] = [
  {
    id: 'CR1',
    tableName: 'lease_master',
    ruleId: 'L1_LEASE_ID_NOT_NULL',
    codeSnippet: `# L1: lease_id not null -> drop
bad_rows = df["lease_id"].isna() | (df["lease_id"].astype(str).str.strip() == "")
dq.log("L1_LEASE_ID_NOT_NULL", table, "ERROR", "rows_failed", int(bad_rows.sum()), "drop_rows")
df = df.loc[~bad_rows].copy()`,
    ruleDescription: 'lease_id must be present (non-null, non-empty)',
    severity: 'ERROR',
    actionTaken: 'drop_rows',
    createdAt: '2024-01-25T10:30:00Z',
    createdBy: 'Data Engineering Team',
    version: '1.0.0',
    isActive: true,
    testResult: { status: 'fail', rowsAffected: 1, message: '1 row failed validation' }
  },
  {
    id: 'CR2',
    tableName: 'lease_master',
    ruleId: 'L2_RENT_POSITIVE',
    codeSnippet: `# L2: monthly_rent > 0 -> drop
bad_rows = pd.to_numeric(df["monthly_rent"], errors="coerce") <= 0
dq.log("L2_RENT_POSITIVE", table, "ERROR", "rows_failed", int(bad_rows.sum()), "drop_rows")
df = df.loc[~bad_rows].copy()`,
    ruleDescription: 'monthly_rent must be a positive value',
    severity: 'ERROR',
    actionTaken: 'drop_rows',
    createdAt: '2024-01-25T11:15:00Z',
    createdBy: 'Data Engineering Team',
    version: '1.0.0',
    isActive: true,
    testResult: { status: 'fail', rowsAffected: 1, message: '1 row had negative rent' }
  },
  {
    id: 'CR3',
    tableName: 'lease_master',
    ruleId: 'L3_DATE_RANGE_VALID',
    codeSnippet: `# L3: end_date >= start_date -> drop
bad_rows = pd.to_datetime(df["start_date"]) > pd.to_datetime(df["end_date"])
dq.log("L3_DATE_RANGE_VALID", table, "ERROR", "rows_failed", int(bad_rows.sum()), "drop_rows")
df = df.loc[~bad_rows].copy()`,
    ruleDescription: 'end_date must be on or after start_date',
    severity: 'ERROR',
    actionTaken: 'drop_rows',
    createdAt: '2024-01-25T14:00:00Z',
    createdBy: 'Data Engineering Team',
    version: '1.0.0',
    isActive: true,
    testResult: { status: 'fail', rowsAffected: 1, message: '1 row has end_date before start_date' }
  },
  {
    id: 'CR4',
    tableName: 'lease_master',
    ruleId: 'L4_STATUS_ALLOWED',
    codeSnippet: `# L4: status in allowed values -> set Unknown
allowed = {"Active", "Pending", "Expired", "Terminated"}
bad_rows = ~df["status"].isin(allowed)
dq.log("L4_STATUS_ALLOWED", table, "WARN", "rows_failed", int(bad_rows.sum()), "set_unknown")
df.loc[bad_rows, "status"] = "Unknown"`,
    ruleDescription: 'status must be one of Active/Pending/Expired/Terminated',
    severity: 'WARN',
    actionTaken: 'set_default',
    createdAt: '2024-01-26T09:30:00Z',
    createdBy: 'Data Quality Analyst',
    version: '1.0.0',
    isActive: true,
    testResult: { status: 'warning', rowsAffected: 1, message: '1 row had invalid status' }
  },
  {
    id: 'CR5',
    tableName: 'lease_master',
    ruleId: 'L5_PROPERTY_FK_REF',
    codeSnippet: `# L5: property_id must exist in property_master -> flag
bad_rows = ~df["property_id"].isin(property_master_df["property_id"])
dq.log("L5_PROPERTY_FK_REF", table, "WARN", "rows_failed", int(bad_rows.sum()), "flag_only")`,
    ruleDescription: 'property_id must reference valid property_master record',
    severity: 'WARN',
    actionTaken: 'flag_only',
    createdAt: '2024-01-26T10:45:00Z',
    createdBy: 'Data Quality Analyst',
    version: '1.0.0',
    isActive: true,
    testResult: { status: 'pass', rowsAffected: 0, message: 'All references valid' }
  }
];

interface CreatedRulesCatalogProps {
  rules: CreatedRule[];
  onTestRules: () => void;
  isTesting: boolean;
}

export function CreatedRulesCatalog({ rules, onTestRules, isTesting }: CreatedRulesCatalogProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['lease_master']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <TestTube2 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      ERROR: 'bg-destructive/20 text-destructive border-destructive/30',
      WARN: 'bg-warning/20 text-warning border-warning/30',
      INFO: 'bg-primary/20 text-primary border-primary/30'
    };
    return (
      <Badge variant="outline" className={colors[severity]}>
        {severity}
      </Badge>
    );
  };

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.tableName]) acc[rule.tableName] = [];
    acc[rule.tableName].push(rule);
    return acc;
  }, {} as Record<string, CreatedRule[]>);

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Created Rules Catalog</CardTitle>
              <CardDescription>
                {rules.length} rule(s) created • {rules.filter(r => r.isActive).length} active
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                {rules.filter(r => r.testResult?.status === 'pass').length} Pass
              </Badge>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                {rules.filter(r => r.testResult?.status === 'fail').length} Fail
              </Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                {rules.filter(r => r.testResult?.status === 'warning').length} Warn
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onTestRules}
              disabled={isTesting}
              className="gap-2"
            >
              {isTesting ? (
                <>
                  <TestTube2 className="w-4 h-4 animate-pulse" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Test All
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
            <p className="text-xl font-bold text-primary">{rules.length}</p>
            <p className="text-xs text-muted-foreground">Total Rules</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
            <p className="text-xl font-bold text-success">{rules.filter(r => r.isActive).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
            <p className="text-xl font-bold text-destructive">{rules.filter(r => r.severity === 'ERROR').length}</p>
            <p className="text-xs text-muted-foreground">Error Level</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
            <p className="text-xl font-bold text-warning">{rules.filter(r => r.severity === 'WARN').length}</p>
            <p className="text-xs text-muted-foreground">Warning Level</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50 border border-success/30 text-center">
            <p className="text-xl font-bold text-success">
              {rules.length > 0 
                ? ((rules.filter(r => r.testResult?.status === 'pass').length / rules.length) * 100).toFixed(0) 
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
          </div>
        </div>

        {/* Rules by Table */}
        {Object.entries(groupedRules).map(([tableName, tableRules]) => (
          <Collapsible 
            key={tableName}
            open={expandedSections.has(tableName)}
            onOpenChange={() => toggleSection(tableName)}
          >
            <CollapsibleTrigger className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              {expandedSections.has(tableName) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <Database className="w-4 h-4 text-primary" />
              <span className="font-medium">{tableName}</span>
              <Badge variant="secondary" className="ml-auto">
                {tableRules.length} rule(s)
              </Badge>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              {tableRules.map((rule) => (
                <div 
                  key={rule.id} 
                  className={`p-4 rounded-lg border transition-colors ${
                    rule.isActive 
                      ? 'bg-background/50 border-border/50 hover:border-primary/50' 
                      : 'bg-muted/20 border-border/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Rule Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                          {rule.ruleId}
                        </code>
                        {getSeverityBadge(rule.severity)}
                        {rule.isActive ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
                            <ToggleRight className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-muted gap-1">
                            <ToggleLeft className="w-3 h-3" />
                            Inactive
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1">
                          <Tag className="w-3 h-3" />
                          v{rule.version}
                        </Badge>
                      </div>
                      
                      <p className="text-sm">{rule.ruleDescription}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(rule.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {rule.createdBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Code2 className="w-3 h-3" />
                          Action: {rule.actionTaken.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      {/* Code Snippet - Expandable */}
                      <Collapsible>
                        <CollapsibleTrigger className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Code2 className="w-3 h-3" />
                          View Code Snippet
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <pre className="mt-2 text-xs bg-muted/30 p-3 rounded overflow-x-auto">
                            <code>{rule.codeSnippet}</code>
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                    
                    {/* Right: Test Result & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-background/80 border border-border/50">
                        {getStatusIcon(rule.testResult?.status || 'pending')}
                        <div className="text-right">
                          <p className={`text-sm font-medium capitalize ${
                            rule.testResult?.status === 'pass' ? 'text-success' :
                            rule.testResult?.status === 'fail' ? 'text-destructive' :
                            rule.testResult?.status === 'warning' ? 'text-warning' :
                            'text-muted-foreground'
                          }`}>
                            {rule.testResult?.status || 'pending'}
                          </p>
                          {rule.testResult && rule.testResult.rowsAffected > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {rule.testResult.rowsAffected} rows
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
