"use client"

import { Shield, Monitor, AlertTriangle, Camera, Lock, User, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProctoringConfigurationProps {
  config: any
  onConfigChange: (config: any) => void
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

export function ProctoringConfiguration({
  config,
  onConfigChange,
  enabled,
  onEnabledChange,
}: ProctoringConfigurationProps) {
  const updateConfig = (key: string, value: any) => {
    onConfigChange({ ...config, [key]: value })
  }

  const proctoringFeatures = [
    {
      key: "webcamMonitoring",
      title: "Webcam Monitoring",
      description: "Continuously monitor candidate through webcam",
      icon: Camera,
      level: "high",
    },
    {
      key: "screenRecording",
      title: "Screen Recording",
      description: "Record candidate's screen during the assessment",
      icon: Monitor,
      level: "high",
    },
    {
      key: "tabSwitchDetection",
      title: "Tab Switch Detection",
      description: "Detect when candidate switches browser tabs",
      icon: AlertTriangle,
      level: "medium",
    },
    {
      key: "copyPasteDetection",
      title: "Copy/Paste Detection",
      description: "Monitor clipboard activities during assessment",
      icon: Settings,
      level: "medium",
    },
    {
      key: "rightClickDisable",
      title: "Right Click Disable",
      description: "Disable right-click context menu",
      icon: Lock,
      level: "low",
    },
    {
      key: "fullscreenMode",
      title: "Fullscreen Mode",
      description: "Force assessment to run in fullscreen",
      icon: Monitor,
      level: "medium",
    },
    {
      key: "idVerification",
      title: "ID Verification",
      description: "Verify candidate identity before starting",
      icon: User,
      level: "high",
    },
    {
      key: "environmentCheck",
      title: "Environment Check",
      description: "Check candidate's testing environment",
      icon: Shield,
      level: "medium",
    },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "low":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Proctoring Configuration</h2>
        <p className="text-muted-foreground">Configure monitoring and security features for your assessment</p>
      </div>

      {/* Master Toggle */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Enable Proctoring</h3>
                <p className="text-sm text-muted-foreground">
                  Turn on monitoring and anti-cheating features for this assessment
                </p>
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={onEnabledChange} />
          </div>
        </CardContent>
      </Card>

      {enabled && (
        <>
          <Alert className="rounded-2xl border-amber-500/30 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-400">
              Proctoring features require candidate consent and may affect user experience. Ensure compliance with
              privacy regulations.
            </AlertDescription>
          </Alert>

          {/* Monitoring Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {proctoringFeatures.map((feature) => (
              <Card key={feature.key} className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-accent/50 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-xl border text-xs ${getLevelColor(feature.level)}`}>
                        {feature.level}
                      </Badge>
                      <Switch
                        checked={config[feature.key]}
                        onCheckedChange={(checked) => updateConfig(feature.key, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Advanced Settings */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Advanced Proctoring Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Suspicious Activity Threshold</Label>
                    <p className="text-xs text-muted-foreground mb-3">Number of violations before flagging candidate</p>
                    <div className="space-y-2">
                      <Slider
                        value={[config.suspiciousActivityThreshold]}
                        onValueChange={([value]) => updateConfig("suspiciousActivityThreshold", value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 (Strict)</span>
                        <span className="font-medium">{config.suspiciousActivityThreshold} violations</span>
                        <span>10 (Lenient)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Warning Before Flagging</Label>
                    <p className="text-xs text-muted-foreground">Show warning before marking as suspicious</p>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.warningBeforeFlagging}
                        onCheckedChange={(checked) => updateConfig("warningBeforeFlagging", checked)}
                      />
                      <Label className="text-sm">Enable warnings</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Recording Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Video Quality</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="low">Low (480p)</SelectItem>
                        <SelectItem value="medium">Medium (720p)</SelectItem>
                        <SelectItem value="high">High (1080p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recording Frequency</Label>
                    <Select defaultValue="continuous">
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="continuous">Continuous</SelectItem>
                        <SelectItem value="periodic">Every 30 seconds</SelectItem>
                        <SelectItem value="triggered">On suspicious activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Data Retention</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Keep Recordings For</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-delete After</Label>
                    <Select defaultValue="review">
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="review">After review</SelectItem>
                        <SelectItem value="retention">Retention period</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
