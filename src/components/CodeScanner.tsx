import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Search, FileCode, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockCodeFiles, mockRules } from '@/data/mockData';

interface ScanResult {
  file: string;
  rulesFound: number;
  status: 'pending' | 'scanning' | 'complete';
}

export function CodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanComplete(false);
    setResults(mockCodeFiles.map(file => ({ file, rulesFound: 0, status: 'pending' })));
  };

  useEffect(() => {
    if (!isScanning) return;

    const totalFiles = mockCodeFiles.length;
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < totalFiles) {
        const file = mockCodeFiles[currentIndex];
        setCurrentFile(file);
        
        setResults(prev => prev.map((r, i) => ({
          ...r,
          status: i === currentIndex ? 'scanning' : i < currentIndex ? 'complete' : 'pending',
          rulesFound: i < currentIndex ? Math.floor(Math.random() * 3) + 1 : 0
        })));

        setScanProgress(Math.round(((currentIndex + 1) / totalFiles) * 100));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setScanComplete(true);
        setResults(prev => prev.map(r => ({
          ...r,
          status: 'complete',
          rulesFound: Math.floor(Math.random() * 3) + 1
        })));
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Codebase Scanner</h3>
          <p className="text-sm text-muted-foreground">Extract data quality rules from your ingestion pipelines</p>
        </div>
        <Button 
          onClick={startScan} 
          disabled={isScanning}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Scan Codebase
            </>
          )}
        </Button>
      </div>

      {(isScanning || scanComplete) && (
        <>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isScanning ? `Scanning: ${currentFile}` : 'Scan complete'}
              </span>
              <span className="text-primary font-medium">{scanProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          {/* File List */}
          <div className="relative max-h-[300px] overflow-y-auto scrollbar-thin rounded-lg border border-border/30 bg-muted/30">
            {isScanning && <div className="scan-line" />}
            <div className="p-4 space-y-2">
              {results.map((result, index) => (
                <div 
                  key={result.file}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                    result.status === 'scanning' && "bg-primary/10 border border-primary/30",
                    result.status === 'complete' && "bg-success/5",
                    result.status === 'pending' && "opacity-50"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <FileCode className={cn(
                      "w-4 h-4",
                      result.status === 'scanning' && "text-primary",
                      result.status === 'complete' && "text-success",
                      result.status === 'pending' && "text-muted-foreground"
                    )} />
                    <span className="font-mono text-sm">{result.file}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status === 'complete' && result.rulesFound > 0 && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {result.rulesFound} rules
                      </span>
                    )}
                    {result.status === 'scanning' && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    )}
                    {result.status === 'complete' && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {scanComplete && (
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/30 animate-fade-in-up">
              <div>
                <p className="font-semibold text-success">Scan Complete</p>
                <p className="text-sm text-muted-foreground">
                  Found {mockRules.length} data quality rules across {mockCodeFiles.length} files
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
