import React, { useState } from 'react';
import { X, PhoneCall, ShieldAlert, FileText, CheckCircle2, Download, AlertTriangle, MapPin } from 'lucide-react';
import { TelemetryState } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryState;
  onEmergencyShutoff: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onEmergencyShutoff,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const contacts = [
    {
      role: 'Municipal Water Board Emergency',
      name: 'City Water Works Helpline',
      phone: '1800-WATER-SOS',
      avail: '24/7 Priority Emergency',
    },
    {
      role: 'Certified AquaGuard Plumber',
      name: 'Master PipeCare Pro Services',
      phone: '+1 (800) 555-PLUMB',
      avail: 'Avg ETA: 25 mins',
    },
    {
      role: 'Building Maintenance Manager',
      name: 'Society Facility Helpdesk',
      phone: 'Ext: 104 / +1 555-0199',
      avail: 'On Campus',
    },
  ];

  const handleExportReport = () => {
    const reportData = {
      system: 'AquaGuard Water Conservation & Monitoring',
      timestamp: new Date().toISOString(),
      mainValveState: telemetry.mainValveState,
      totalFlowRateLpm: telemetry.totalFlowRate,
      linePressurePsi: telemetry.systemPressure,
      todayUsageLitres: telemetry.todayCumulativeLiters,
      activeLeaks: telemetry.activeLeaks,
      zoneBreakdown: telemetry.zones.map((z) => ({
        zone: z.name,
        usageToday: z.todayUsage,
        valveOpen: z.valveOpen,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquaguard_water_incident_audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-red-300 rounded-xl max-w-lg w-full p-5 md:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-50 text-red-600 rounded-md border border-red-200 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Emergency Water Response Protocol</h3>
              <p className="text-xs text-slate-500 font-medium">Rapid isolation and verified dispatch directory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Immediate 1-Click Action */}
        <div className="p-4 rounded bg-red-50 border border-red-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-900 block">Master Ingress Valve State</span>
            <span className="text-sm font-extrabold text-red-700 font-mono uppercase">
              Current: {telemetry.mainValveState}
            </span>
          </div>
          <button
            onClick={onEmergencyShutoff}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>FORCE SHUT OFF VALVE</span>
          </button>
        </div>

        {/* Emergency Steps */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Immediate Action Checklist for Pipe Bursts / Leaks:
          </h4>
          <ol className="space-y-1.5 pl-5 list-decimal text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
            <li>Shut off the AquaGuard smart main valve (button above) or the physical quarter-turn valve at the meter.</li>
            <li>Open lowest faucets (garden tap / ground floor) to drain residual line pressure safely.</li>
            <li>Isolate circuit breakers if water is pooling near electrical outlets or sub-panels.</li>
            <li>Contact verified plumbing dispatch below or export the telemetry incident log.</li>
          </ol>
        </div>

        {/* Emergency Contacts Directory */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
            Emergency Dispatch Directory:
          </h4>
          <div className="space-y-1.5">
            {contacts.map((c, i) => (
              <div
                key={i}
                className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{c.name}</span>
                  <span className="text-[10px] text-slate-500">{c.role} • {c.avail}</span>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="px-3 py-1.5 rounded bg-white hover:bg-blue-50 text-blue-700 font-mono font-bold border border-slate-300 hover:border-blue-400 transition-colors"
                >
                  {c.phone}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Export Telemetry Incident Report */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            {downloaded ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Incident Log Downloaded!' : 'Export Incident Telemetry (JSON)'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
