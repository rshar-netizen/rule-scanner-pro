import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { mockLogs, RuntimeLog } from '@/data/mockData';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Activity } from 'lucide-react';

const statusConfig = {
  pass: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  fail: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
};

export function RuntimeLogs() {
  const [logs, setLogs] = useState<RuntimeLog[]>(mockLogs);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate new log entries
      const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      const newLog: RuntimeLog = {
        ...randomLog,
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      setLogs(prev => [newLog, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Runtime Logs</h3>
          <div className="flex items-center gap-2">
            <div className={cn(
              "pulse-dot",
              isLive ? "bg-success" : "bg-muted-foreground"
            )} />
            <span className="text-xs text-muted-foreground">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
            isLive 
              ? "bg-success/10 text-success hover:bg-success/20" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
        {logs.map((log, index) => {
          const StatusIcon = statusConfig[log.status].icon;
          
          return (
            <div 
              key={log.id}
              className={cn(
                "p-3 rounded-lg border border-border/30 bg-card/50 transition-all duration-300",
                index === 0 && isLive && "animate-fade-in-up"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-1.5 rounded-md mt-0.5",
                    statusConfig[log.status].bg
                  )}>
                    <StatusIcon className={cn("w-3.5 h-3.5", statusConfig[log.status].color)} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{log.ruleName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {log.recordsChecked.toLocaleString()} checked
                      </span>
                      {log.recordsFailed > 0 && (
                        <span className="text-destructive">
                          {log.recordsFailed.toLocaleString()} failed
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.duration}ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
