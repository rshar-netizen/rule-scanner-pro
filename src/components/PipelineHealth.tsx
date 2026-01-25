import { cn } from "@/lib/utils";
import { mockPipelines } from '@/data/mockData';
import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const statusConfig = {
  healthy: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  degraded: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  critical: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
};

export function PipelineHealth() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pipeline Health</h3>
          <p className="text-sm text-muted-foreground">Data quality status across all pipelines</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span>Live monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mockPipelines.map((pipeline) => {
          const StatusIcon = statusConfig[pipeline.status].icon;
          
          return (
            <div 
              key={pipeline.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02]",
                statusConfig[pipeline.status].border,
                "bg-card/50 hover:bg-card"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn("w-4 h-4", statusConfig[pipeline.status].color)} />
                    <span className="font-medium">{pipeline.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pipeline.rulesCount} rules • Last run {pipeline.lastRun}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-semibold",
                    pipeline.passRate >= 99 ? "text-success" :
                    pipeline.passRate >= 95 ? "text-warning" : "text-destructive"
                  )}>
                    {pipeline.passRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">pass rate</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    pipeline.passRate >= 99 ? "bg-success" :
                    pipeline.passRate >= 95 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${pipeline.passRate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
