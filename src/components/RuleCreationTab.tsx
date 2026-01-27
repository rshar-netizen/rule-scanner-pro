import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileUploadWidget } from './FileUploadWidget';
import { AIGeneratedRulesTable, AIGeneratedRule } from './AIGeneratedRulesTable';
import { AI_GENERATED_RULES, getAIRuleSummary } from '@/data/aiGeneratedRules';
import { CreatedRulesCatalog, CreatedRule, INITIAL_CREATED_RULES } from './CreatedRulesCatalog';
import { 
  Wand2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Plus,
  Database,
  Code2,
  TestTube2,
  Sparkles,
  Upload,
  FileOutput,
  Loader2,
  ArrowRight
} from 'lucide-react';

const RULE_TEMPLATES = [
  { id: 'not_null', name: 'Not Null Check', template: 'df["{column}"].isna() | (df["{column}"].astype(str).str.strip() == "")' },
  { id: 'positive', name: 'Positive Value', template: 'pd.to_numeric(df["{column}"], errors="coerce") <= 0' },
  { id: 'format', name: 'Format Validation', template: '~df["{column}"].astype(str).str.match(r"{pattern}")' },
  { id: 'date_range', name: 'Date Range Check', template: 'pd.to_datetime(df["{start}"]) > pd.to_datetime(df["{end}"])' },
  { id: 'allowed_values', name: 'Allowed Values', template: '~df["{column}"].isin([{values}])' },
  { id: 'fk_reference', name: 'Foreign Key Reference', template: '~df["{column}"].isin(reference_df["{ref_column}"])' },
];

export const RuleCreationTab = () => {
  // File upload state
  const [sampleDataFile, setSampleDataFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [aiGeneratedRules, setAiGeneratedRules] = useState<AIGeneratedRule[]>([]);
  
  // Manual rule creation state
  const [createdRules, setCreatedRules] = useState<CreatedRule[]>(INITIAL_CREATED_RULES);
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

  const handleGenerateRules = async () => {
    if (!sampleDataFile) return;
    
    setIsGenerating(true);
    // Simulate AI rule generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    setAiGeneratedRules(AI_GENERATED_RULES);
    setIsGenerating(false);
    setGenerationComplete(true);
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
        let status: 'pass' | 'fail' | 'warning' = 'pass';
        let rowsAffected = 0;
        let message = 'All rows passed validation';

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

  const aiSummary = getAIRuleSummary();

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
                Upload sample data to automatically generate data quality rules using AI analysis. 
                Create custom rules using templates or logic. Test all rules against your data 
                before deploying to production pipelines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swimlane 2: File Upload for Sample Data */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Upload Sample Data</CardTitle>
              <CardDescription>
                Upload sample data files to generate data quality rules automatically
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploadWidget
              title="Sample Data File"
              description="Upload CSV, JSON, or Parquet file"
              acceptedTypes=".csv,.json,.parquet,.xlsx"
              icon="log"
              selectedFile={sampleDataFile}
              onFileSelect={setSampleDataFile}
            />
            <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border/30 bg-muted/10">
              <div className="p-3 rounded-xl bg-primary/10 mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-center mb-1">AI Rule Generation</p>
              <p className="text-xs text-muted-foreground text-center">
                Our AI analyzes your data to suggest relevant DQ rules
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center pt-2">
            <Button 
              onClick={handleGenerateRules}
              disabled={!sampleDataFile || isGenerating}
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Rules
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Swimlane 3: AI Generated Rules Output */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileOutput className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">AI-Generated Data Quality Rules</CardTitle>
                <CardDescription>
                  Rules automatically suggested based on sample data analysis
                </CardDescription>
              </div>
            </div>
            
            {generationComplete && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1.5">
                  <Database className="w-3 h-3" />
                  {aiSummary.total} rules
                </Badge>
                <Badge className="bg-success/10 text-success gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  {aiSummary.passed} pass
                </Badge>
                <Badge className="bg-warning/10 text-warning gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  {aiSummary.warnings} warn
                </Badge>
                <Badge className="bg-destructive/10 text-destructive gap-1.5">
                  <XCircle className="w-3 h-3" />
                  {aiSummary.failed} fail
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!generationComplete && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <FileOutput className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">
                Upload a sample data file, then click "Generate Rules" to view AI-suggested rules
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Analyzing data patterns and generating data quality rules...
              </p>
              <div className="mt-4 w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {generationComplete && (
            <div className="animate-fade-in">
              <AIGeneratedRulesTable rules={aiGeneratedRules} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Swimlane 4: Manual Rule Builder */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Manual Rule Builder</CardTitle>
              <CardDescription>Create custom data quality rules using templates</CardDescription>
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

      {/* Swimlane 5: Created Rules Catalog */}
      <CreatedRulesCatalog 
        rules={createdRules} 
        onTestRules={handleTestRules}
        isTesting={isTesting}
      />
    </div>
  );
};
