import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { RecoveryCases } from './pages/RecoveryCases';
import { RecoveryDetail } from './pages/RecoveryDetail';
import { Payments } from './pages/Payments';
import { AuditLogs } from './pages/AuditLogs';
import { Evaluation } from './pages/Evaluation';
import { Settings } from './pages/Settings';
import { Analytics } from './pages/Analytics';
import { WebhookSimulatorModal } from './components/simulator/WebhookSimulatorModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectCase = (caseId) => {
    setSelectedCaseId(caseId);
    setActiveTab('recovery-detail');
  };

  const handleSimulatorSuccess = (data) => {
    setRefreshTrigger(prev => prev + 1);
    const caseId = data?.recovery_pipeline_result?.case_id || data?.result?.case_id;
    if (caseId) {
      setSelectedCaseId(caseId);
      setActiveTab('recovery-detail');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased select-none">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab === 'recovery-detail' ? 'recoveries' : activeTab}
        setActiveTab={(tab) => {
          setSelectedCaseId(null);
          setActiveTab(tab);
        }}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSimulatorSuccess={handleSimulatorSuccess} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={refreshTrigger}
              onSelectCase={handleSelectCase}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {activeTab === 'recoveries' && (
            <RecoveryCases
              key={refreshTrigger}
              onSelectCase={handleSelectCase}
            />
          )}

          {activeTab === 'recovery-detail' && (
            <RecoveryDetail
              caseId={selectedCaseId}
              onBack={() => setActiveTab('recoveries')}
            />
          )}

          {activeTab === 'analytics' && <Analytics key={refreshTrigger} />}

          {activeTab === 'payments' && <Payments key={refreshTrigger} />}

          {activeTab === 'audit' && <AuditLogs key={refreshTrigger} />}

          {activeTab === 'evaluation' && <Evaluation />}

          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSuccess={handleSimulatorSuccess}
      />
    </div>
  );
}
