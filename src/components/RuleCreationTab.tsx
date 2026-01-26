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
  Sparkles
} from 'lucide-react';

interface CreatedRule {
  id: string;
  tableName: string;
  ruleId: string;
  codeSnippet: string;
  ruleDescription: string;
  severity: 'ERROR' | 'WARN' | 'INFO';
  actionTaken: string;
  testResult?: {
    status: 'pass' | 'fail' | 'warning' | 'pending';
    rowsAffected: number;
    message: string;
  };
}

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
  const [createdRules, setCreatedRules] = useState<CreatedRule[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['lease_master']));
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
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

      {/* Created Rules Output */}
      {createdRules.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TestTube2 className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Created Rules</CardTitle>
                  <CardDescription>
                    {createdRules.length} rule(s) created • Test against sample data to validate
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  {createdRules.filter(r => r.testResult?.status === 'pass').length} Pass
                </Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                  {createdRules.filter(r => r.testResult?.status === 'fail').length} Fail
                </Badge>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                  {createdRules.filter(r => r.testResult?.status === 'warning').length} Warn
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                
                <CollapsibleContent className="mt-3">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-xs">Table Name</TableHead>
                          <TableHead className="text-xs">Rule Extracted</TableHead>
                          <TableHead className="text-xs">Code Snippet</TableHead>
                          <TableHead className="text-xs">Rule Description</TableHead>
                          <TableHead className="text-xs">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rules.map((rule) => (
                          <TableRow key={rule.id} className="border-border/30">
                            <TableCell>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                {rule.tableName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                                  {rule.ruleId}
                                </code>
                                {getSeverityBadge(rule.severity)}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto max-h-20">
                                <code>{rule.codeSnippet}</code>
                              </pre>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm">{rule.ruleDescription}</p>
                                <p className="text-xs text-muted-foreground">
                                  Action: {rule.actionTaken.replace('_', ' ')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(rule.testResult?.status || 'pending')}
                                <div>
                                  <p className={`text-sm font-medium capitalize ${
                                    rule.testResult?.status === 'pass' ? 'text-emerald-400' :
                                    rule.testResult?.status === 'fail' ? 'text-red-400' :
                                    rule.testResult?.status === 'warning' ? 'text-amber-400' :
                                    'text-muted-foreground'
                                  }`}>
                                    {rule.testResult?.status || 'pending'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {rule.testResult?.message}
                                  </p>
                                  {rule.testResult && rule.testResult.rowsAffected > 0 && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {rule.testResult.rowsAffected} rows affected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
