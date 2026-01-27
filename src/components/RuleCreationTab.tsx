import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileUploadWidget } from './FileUploadWidget';
import { AIGeneratedRulesTable, AIGeneratedRule } from './AIGeneratedRulesTable';
import { AI_GENERATED_RULES, getAIRuleSummary } from '@/data/aiGeneratedRules';
import { 
  Wand2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Database,
  TestTube2,
  Sparkles,
  Upload,
  FileOutput,
  Loader2,
  ArrowRight,
  Target,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

export const RuleCreationTab = () => {
  const [sampleDataFile, setSampleDataFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [aiGeneratedRules, setAiGeneratedRules] = useState<AIGeneratedRule[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testingComplete, setTestingComplete] = useState(false);

  const handleGenerateRules = async () => {
    if (!sampleDataFile) return;
    
    setIsGenerating(true);
    setTestingComplete(false);
    // Simulate AI rule generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    setAiGeneratedRules(AI_GENERATED_RULES);
    setIsGenerating(false);
    setGenerationComplete(true);
  };

  const handleTestAllRules = async () => {
    setIsTesting(true);
    
    // Simulate testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update rules with test results
    const testedRules = aiGeneratedRules.map(rule => {
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let rowsAffected = rule.result.rowsAffected;
      let message = rule.result.message;

      // Simulate varied test results based on rule type
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
      }

      return {
        ...rule,
        result: { status, rowsAffected, message }
      };
    });
    
    setAiGeneratedRules(testedRules);
    setIsTesting(false);
    setTestingComplete(true);
  };

  const aiSummary = generationComplete ? {
    total: aiGeneratedRules.length,
    passed: aiGeneratedRules.filter(r => r.result.status === 'pass').length,
    failed: aiGeneratedRules.filter(r => r.result.status === 'fail').length,
    warnings: aiGeneratedRules.filter(r => r.result.status === 'warning').length,
    pending: aiGeneratedRules.filter(r => r.result.status === 'pending').length,
    errorRules: aiGeneratedRules.filter(r => r.severity === 'ERROR').length,
    warnRules: aiGeneratedRules.filter(r => r.severity === 'WARN').length,
    infoRules: aiGeneratedRules.filter(r => r.severity === 'INFO').length,
    totalRowsAffected: aiGeneratedRules.reduce((sum, r) => sum + r.result.rowsAffected, 0),
    passRate: aiGeneratedRules.length > 0 
      ? ((aiGeneratedRules.filter(r => r.result.status === 'pass').length / aiGeneratedRules.length) * 100).toFixed(1)
      : '0',
    tables: [...new Set(aiGeneratedRules.map(r => r.tableName))].length
  } : null;

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
              <h3 className="text-lg font-semibold mb-2">AI-Powered Rule Generation</h3>
              <p className="text-muted-foreground">
                Upload sample data to automatically generate data quality rules using AI analysis. 
                Test generated rules against your data and view comprehensive results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
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

      {/* KPIs Section - Only show after generation */}
      {generationComplete && aiSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-2">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{aiSummary.total}</p>
              <p className="text-xs text-muted-foreground">Rules Generated</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-2 rounded-lg bg-success/10 w-fit mx-auto mb-2">
                <Target className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">{aiSummary.tables}</p>
              <p className="text-xs text-muted-foreground">Tables Covered</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-2 rounded-lg bg-success/10 w-fit mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">{aiSummary.passed}</p>
              <p className="text-xs text-muted-foreground">Tests Passed</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-2 rounded-lg bg-destructive/10 w-fit mx-auto mb-2">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-2xl font-bold text-destructive">{aiSummary.failed}</p>
              <p className="text-xs text-muted-foreground">Tests Failed</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-2 rounded-lg bg-warning/10 w-fit mx-auto mb-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <p className="text-2xl font-bold text-warning">{aiSummary.warnings}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{aiSummary.passRate}%</p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Metrics Row */}
      {generationComplete && aiSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-destructive/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Error Severity Rules</p>
                  <p className="text-xl font-bold text-destructive">{aiSummary.errorRules}</p>
                </div>
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-warning/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warning Severity Rules</p>
                  <p className="text-xl font-bold text-warning">{aiSummary.warnRules}</p>
                </div>
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Info Severity Rules</p>
                  <p className="text-xl font-bold text-primary">{aiSummary.infoRules}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-muted">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rows Affected</p>
                  <p className="text-xl font-bold">{aiSummary.totalRowsAffected}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <Database className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Generated Rules Output */}
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1.5">
                    <Database className="w-3 h-3" />
                    {aiSummary?.total} rules
                  </Badge>
                  <Badge className="bg-success/10 text-success gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    {aiSummary?.passed} pass
                  </Badge>
                  <Badge className="bg-warning/10 text-warning gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    {aiSummary?.warnings} warn
                  </Badge>
                  <Badge className="bg-destructive/10 text-destructive gap-1.5">
                    <XCircle className="w-3 h-3" />
                    {aiSummary?.failed} fail
                  </Badge>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTestAllRules}
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
            <div className="animate-fade-in space-y-4">
              {testingComplete && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium text-success">Testing Complete</p>
                    <p className="text-sm text-muted-foreground">
                      All {aiSummary?.total} rules have been tested against the sample data. 
                      {aiSummary?.passed} passed, {aiSummary?.failed} failed, {aiSummary?.warnings} warnings.
                    </p>
                  </div>
                </div>
              )}
              <AIGeneratedRulesTable rules={aiGeneratedRules} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
