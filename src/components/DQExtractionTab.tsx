import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileUploadWidget } from './FileUploadWidget';
import { ExtractedRulesTable } from './ExtractedRulesTable';
import { getRuleSummary } from '@/data/extractedRules';
import { 
  Sparkles, 
  Upload, 
  FileOutput, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  ArrowRight,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DQExtractionTab() {
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [logFile, setLogFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);

  const handleExtract = async () => {
    if (!codeFile || !logFile) return;
    
    setIsExtracting(true);
    // Simulate extraction process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExtracting(false);
    setExtractionComplete(true);
  };

  const summary = getRuleSummary();

  return (
    <div className="space-y-8">
      {/* Swimlane 1: Overview */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Data Quality Rule Extraction and Validation</h3>
            <p className="text-muted-foreground">
              Automatically extracts data quality rules embedded in the data ingestion pipelines. 
              Also, automatically extract the results of these rules from the log files of the pipelines.
            </p>
          </div>
        </div>
      </div>

      {/* Swimlane 2: Input Widgets */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Upload Files</h3>
            <p className="text-sm text-muted-foreground">
              Upload ingestion code and log files to extract data quality rules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUploadWidget
            title="Ingestion Code"
            description="Upload Python/SQL pipeline code"
            acceptedTypes=".py,.sql,.txt"
            icon="code"
            selectedFile={codeFile}
            onFileSelect={setCodeFile}
          />
          <FileUploadWidget
            title="Log Files"
            description="Upload DQ run log files"
            acceptedTypes=".txt,.log,.json"
            icon="log"
            selectedFile={logFile}
            onFileSelect={setLogFile}
          />
        </div>

        <div className="flex items-center justify-center pt-2">
          <Button 
            onClick={handleExtract}
            disabled={!codeFile || !logFile || isExtracting}
            className="min-w-[200px]"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting Rules...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Extract Rules
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Swimlane 3: Output - Extracted Rules */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <FileOutput className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Extracted Data Quality Rules</h3>
              <p className="text-sm text-muted-foreground">
                Rules segmented by table from PGIM Real Estate Silver→Gold Pipeline
              </p>
            </div>
          </div>
          
          {extractionComplete && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1.5">
                <Database className="w-3 h-3" />
                {summary.total} rules
              </Badge>
              <Badge className="bg-success/10 text-success gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                {summary.passed} pass
              </Badge>
              <Badge className="bg-warning/10 text-warning gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                {summary.warnings} warn
              </Badge>
              <Badge className="bg-destructive/10 text-destructive gap-1.5">
                <XCircle className="w-3 h-3" />
                {summary.failed} fail
              </Badge>
            </div>
          )}
        </div>

        {!extractionComplete && !isExtracting && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <FileOutput className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">
              Upload ingestion code and log files, then click "Extract Rules" to view results
            </p>
          </div>
        )}

        {isExtracting && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Analyzing code and extracting data quality rules...
            </p>
            <div className="mt-4 w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {extractionComplete && (
          <div className="animate-fade-in">
            <ExtractedRulesTable />
          </div>
        )}
      </div>
    </div>
  );
}
