import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Wand2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Database,
  Code2,
  TestTube2,
  Sparkles,
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

interface CreatedRule {
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
const INITIAL_CREATED_RULES: CreatedRule[] = [
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

interface SampleDataRow {
  [key: string]: string | number | null;
}

const SAMPLE_LEASE_DATA: SampleDataRow[] = [
  { lease_id: 'LSE001', property_id: 'PRP000101', tenant_id: 'TNT000201', start_date: '2024-01-15', end_date: '2026-01-14', monthly_rent: 5500, status: 'Active' },
  { lease_id: 'LSE002', property_id: 'PRP000102', tenant_id: 'TNT000202', start_date: '2023-06-01', end_date: '2025-05-31', monthly_rent: 8200, status: 'Active' },
  { lease_id: '', property_id: 'PRP000103', tenant_id: 'TNT000203', start_date: '2024-03-01', end_date: '2024-02-28', monthly_rent: -500, status: 'Pending' },
  { lease_id: 'LSE004', property_id: null, tenant_id: 'TNT000204', start_date: '2024-04-01', end_date: '2026-03-31', monthly_rent: 12000, status: 'Active' },
  { lease_id: 'LSE005', property_id: 'PRP000105', tenant_id: '', start_date: '2024-05-15', end_date: '2025-05-14', monthly_rent: 6800, status: 'Expired' },
  { lease_id: 'LSE006', property_id: 'PRP000106', tenant_id: 'TNT000206', start_date: '2024-07-01', end_date: '2027-06-30', monthly_rent: 15000, status: 'Active' },
  { lease_id: 'LSE007', property_id: 'PRP000107', tenant_id: 'TNT000207', start_date: null, end_date: '2025-12-31', monthly_rent: 9500, status: 'Pending' },
  { lease_id: 'LSE008', property_id: 'PRP000108', tenant_id: 'TNT000208', start_date: '2024-02-01', end_date: '2025-01-31', monthly_rent: 7200, status: 'InvalidStatus' },
];

const RULE_TEMPLATES = [
  { id: 'not_null', name: 'Not Null Check', template: 'df["{column}"].isna() | (df["{column}"].astype(str).str.strip() == "")' },
  { id: 'positive', name: 'Positive Value', template: 'pd.to_numeric(df["{column}"], errors="coerce") <= 0' },
  { id: 'format', name: 'Format Validation', template: '~df["{column}"].astype(str).str.match(r"{pattern}")' },
  { id: 'date_range', name: 'Date Range Check', template: 'pd.to_datetime(df["{start}"]) > pd.to_datetime(df["{end}"])' },
  { id: 'allowed_values', name: 'Allowed Values', template: '~df["{column}"].isin([{values}])' },
  { id: 'fk_reference', name: 'Foreign Key Reference', template: '~df["{column}"].isin(reference_df["{ref_column}"])' },
];

export const RuleCreationTab = () => {
  const [createdRules, setCreatedRules] = useState<CreatedRule[]>(INITIAL_CREATED_RULES);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['lease_master']));
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showCatalog, setShowCatalog] = useState(true);
  
  // Form state
  const [selectedTable, setSelectedTable] = useState('lease_master');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [ruleId, setRuleId] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [severity, setSeverity] = useState<'ERROR' | 'WARN' | 'INFO'>('ERROR');
  const [actionTaken, setActionTaken] = useState('drop_rows');
  const [codeSnippet, setCodeSnippet] = useState('');

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = RULE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCodeSnippet(`# Rule: ${ruleId || 'NEW_RULE'}\nbad_rows = ${template.template}\ndq.log("${ruleId || 'NEW_RULE'}", table, "${severity}", "rows_failed", int(bad_rows.sum()), "${actionTaken}")\ndf = df.loc[~bad_rows].copy()`);
    }
  };

  const handleCreateRule = () => {
    if (!ruleId || !ruleDescription || !codeSnippet) return;
    
    setIsCreating(true);
    setTimeout(() => {
      const newRule: CreatedRule = {
        id: `CR${createdRules.length + 1}`,
        tableName: selectedTable,
        ruleId: ruleId.toUpperCase(),
        codeSnippet,
        ruleDescription,
        severity,
        actionTaken,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        version: '1.0.0',
        isActive: true,
        testResult: { status: 'pending', rowsAffected: 0, message: 'Not tested yet' }
      };
      setCreatedRules([...createdRules, newRule]);
      setIsCreating(false);
      
      // Reset form
      setRuleId('');
      setRuleDescription('');
      setCodeSnippet('');
      setSelectedTemplate('');
    }, 800);
  };

  const handleTestRules = () => {
    setIsTesting(true);
    
    setTimeout(() => {
      const testedRules = createdRules.map(rule => {
        // Simulate testing against sample data
        let status: 'pass' | 'fail' | 'warning' = 'pass';
        let rowsAffected = 0;
        let message = 'All rows passed validation';

        // Simulate different results based on rule patterns
        if (rule.ruleId.includes('NOT_NULL') || rule.ruleId.includes('ID')) {
          rowsAffected = Math.floor(Math.random() * 3);
          if (rowsAffected > 0) {
            status = rule.severity === 'ERROR' ? 'fail' : 'warning';
            message = `${rowsAffected} row(s) failed validation`;
          }
        } else if (rule.ruleId.includes('POSITIVE') || rule.ruleId.includes('RANGE')) {
          rowsAffected = Math.floor(Math.random() * 2) + 1;
          status = rule.severity === 'ERROR' ? 'fail' : 'warning';
          message = `${rowsAffected} row(s) had invalid values`;
        } else if (rule.ruleId.includes('DATE')) {
          rowsAffected = 1;
          status = 'fail';
          message = `${rowsAffected} row(s) have end_date before start_date`;
        }

        return {
          ...rule,
          testResult: { status, rowsAffected, message }
        };
      });
      
      setCreatedRules(testedRules);
      setIsTesting(false);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <TestTube2 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
      WARN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return (
      <Badge variant="outline" className={colors[severity]}>
        {severity}
      </Badge>
    );
  };

  const groupedRules = createdRules.reduce((acc, rule) => {
    if (!acc[rule.tableName]) acc[rule.tableName] = [];
    acc[rule.tableName].push(rule);
    return acc;
  }, {} as Record<string, CreatedRule[]>);

  return (
    <div className="space-y-6">
      {/* Overview Swimlane */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Wand2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Rule Creation & Testing</h3>
              <p className="text-muted-foreground">
                Create new data quality rules using templates or custom logic. Test rules against sample data 
                to validate their behavior before deploying to production pipelines. Rules follow the same 
                format as extracted rules for consistency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Swimlane */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Sample Data</CardTitle>
              <CardDescription>Lease master data for testing rules</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  {Object.keys(SAMPLE_LEASE_DATA[0]).map(key => (
                    <TableHead key={key} className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_LEASE_DATA.map((row, idx) => (
                  <TableRow key={idx} className="border-border/30">
                    {Object.entries(row).map(([key, value], cellIdx) => (
                      <TableCell 
                        key={cellIdx} 
                        className={`text-xs whitespace-nowrap ${
                          value === null || value === '' ? 'text-red-400 italic' : ''
                        } ${
                          (key === 'monthly_rent' && typeof value === 'number' && value < 0) ? 'text-red-400' : ''
                        } ${
                          (key === 'status' && value === 'InvalidStatus') ? 'text-amber-400' : ''
                        }`}
                      >
                        {value === null ? 'NULL' : value === '' ? '(empty)' : String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <span className="text-red-400">Red</span> values indicate potential data quality issues for testing
          </p>
        </CardContent>
      </Card>

      {/* Rule Builder Swimlane */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Rule Builder</CardTitle>
              <CardDescription>Create new data quality rules using templates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Table</label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lease_master">lease_master</SelectItem>
                  <SelectItem value="property_master">property_master</SelectItem>
                  <SelectItem value="tenant_master">tenant_master</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rule Template</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {RULE_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as 'ERROR' | 'WARN' | 'INFO')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ERROR">ERROR - Drop rows</SelectItem>
                  <SelectItem value="WARN">WARN - Flag/Fix</SelectItem>
                  <SelectItem value="INFO">INFO - Log only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rule ID</label>
              <Input 
                placeholder="e.g., L1_LEASE_ID_NOT_NULL" 
                value={ruleId}
                onChange={(e) => setRuleId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={actionTaken} onValueChange={setActionTaken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drop_rows">Drop failing rows</SelectItem>
                  <SelectItem value="set_null">Set to NULL</SelectItem>
                  <SelectItem value="set_default">Set to default value</SelectItem>
                  <SelectItem value="flag_only">Flag only (no action)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rule Description</label>
            <Input 
              placeholder="e.g., lease_id must be present (non-null, non-empty)" 
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Code Snippet</label>
            <Textarea 
              className="font-mono text-sm min-h-[120px] bg-background/50"
              placeholder="Enter validation logic..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleCreateRule} 
              disabled={!ruleId || !ruleDescription || !codeSnippet || isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Rule
                </>
              )}
            </Button>

            {createdRules.length > 0 && (
              <Button 
                variant="secondary" 
                onClick={handleTestRules}
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
                    Test All Rules
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rules Catalog View */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Rules Catalog</CardTitle>
                <CardDescription>
                  {createdRules.length} rule(s) created • {createdRules.filter(r => r.isActive).length} active
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  {createdRules.filter(r => r.testResult?.status === 'pass').length} Pass
                </Badge>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                  {createdRules.filter(r => r.testResult?.status === 'fail').length} Fail
                </Badge>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  {createdRules.filter(r => r.testResult?.status === 'warning').length} Warn
                </Badge>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestRules}
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
              <p className="text-xl font-bold text-primary">{createdRules.length}</p>
              <p className="text-xs text-muted-foreground">Total Rules</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
              <p className="text-xl font-bold text-success">{createdRules.filter(r => r.isActive).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
              <p className="text-xl font-bold text-destructive">{createdRules.filter(r => r.severity === 'ERROR').length}</p>
              <p className="text-xs text-muted-foreground">Error Level</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
              <p className="text-xl font-bold text-warning">{createdRules.filter(r => r.severity === 'WARN').length}</p>
              <p className="text-xs text-muted-foreground">Warning Level</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-success/30 text-center">
              <p className="text-xl font-bold text-success">
                {createdRules.length > 0 
                  ? ((createdRules.filter(r => r.testResult?.status === 'pass').length / createdRules.length) * 100).toFixed(0) 
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </div>

          {/* Rules by Table */}
          {Object.entries(groupedRules).map(([tableName, rules]) => (
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
                  {rules.length} rule(s)
                </Badge>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                {rules.map((rule) => (
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
    </div>
  );
};
