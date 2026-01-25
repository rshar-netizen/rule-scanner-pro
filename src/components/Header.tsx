import { Database, Shield, Activity } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 glow-primary">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                <span className="text-gradient">DataQuality</span>
                <span className="text-muted-foreground font-normal">.io</span>
              </h1>
              <p className="text-xs text-muted-foreground">Rules Visibility & Tracking</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="pulse-dot bg-success" />
              <span className="text-muted-foreground">All systems operational</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                <span>8 Pipelines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
