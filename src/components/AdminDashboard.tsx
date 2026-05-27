import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Smartphone, 
  CreditCard, 
  Download, 
  Upload, 
  ExternalLink, 
  Eye, 
  RefreshCcw, 
  FileText, 
  CheckCircle2, 
  Activity, 
  User, 
  Calendar, 
  Copy, 
  Mail, 
  FileCode, 
  Clock, 
  AlertTriangle,
  Send,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { getEmailDispatchLogs, EmailDispatchLog } from '../lib/emailAlert';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
  currentUserEmail: string | null;
  onCloseAdmin: () => void;
}

export default function AdminDashboard({
  orders,
  onUpdateOrder,
  currentUserEmail,
  onCloseAdmin
}: AdminDashboardProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Custom Action state managers
  const [newDeliverableLabel, setNewDeliverableLabel] = useState('');
  const [newDeliverableUrl, setNewDeliverableUrl] = useState('');
  const [customMilestoneDesc, setCustomMilestoneDesc] = useState('');
  
  // Real-time email logs
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>([]);

  useEffect(() => {
    setEmailLogs(getEmailDispatchLogs());
  }, [orders]);

  const activeOrder = orders.find(o => o.id === selectedOrderId);

  // Stats calculation
  const totalOrders = orders.length;
  const pendingPaymentsCount = orders.filter(o => o.status === 'pending_payment').length;
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const reviewCount = orders.filter(o => o.status === 'review').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  
  const totalKshCollection = orders
    .filter(o => o.status !== 'pending_payment')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  // 1. Verify Payment Action
  const handleVerifyPayment = () => {
    if (!activeOrder) return;
    const now = new Date().toISOString();
    
    const updatedTimeline = [...activeOrder.timeline];
    // Mark received as completed
    const receivedStepIdx = updatedTimeline.findIndex(t => t.status === 'received');
    if (receivedStepIdx !== -1) {
      updatedTimeline[receivedStepIdx].completed = true;
      updatedTimeline[receivedStepIdx].timestamp = now;
      updatedTimeline[receivedStepIdx].description = 'M-Pesa payment validation verified on Pochi account. Assigned to lead typesetting team.';
    }

    onUpdateOrder({
      ...activeOrder,
      status: 'received',
      timeline: updatedTimeline
    });
  };

  // 2. Set Status Progression
  const handleUpdateStatus = (newStatus: OrderStatus, customDesc?: string) => {
    if (!activeOrder) return;
    const now = new Date().toISOString();
    const updatedTimeline = [...activeOrder.timeline];

    // Find step that matches the updated status
    const stepIdx = updatedTimeline.findIndex(t => t.status === newStatus);
    if (stepIdx !== -1) {
      updatedTimeline[stepIdx].completed = true;
      updatedTimeline[stepIdx].timestamp = now;
      if (customDesc) {
        updatedTimeline[stepIdx].description = customDesc;
      }
    }

    // Also auto-complete previous states for robust integrity
    if (newStatus === 'in_progress') {
      const idx0 = updatedTimeline.findIndex(t => t.status === 'pending_payment');
      const idx1 = updatedTimeline.findIndex(t => t.status === 'received');
      if (idx0 !== -1) updatedTimeline[idx0].completed = true;
      if (idx1 !== -1) updatedTimeline[idx1].completed = true;
    } else if (newStatus === 'review') {
      const idx0 = updatedTimeline.findIndex(t => t.status === 'pending_payment');
      const idx1 = updatedTimeline.findIndex(t => t.status === 'received');
      const idx2 = updatedTimeline.findIndex(t => t.status === 'in_progress');
      if (idx0 !== -1) updatedTimeline[idx0].completed = true;
      if (idx1 !== -1) updatedTimeline[idx1].completed = true;
      if (idx2 !== -1) updatedTimeline[idx2].completed = true;
    } else if (newStatus === 'completed') {
      updatedTimeline.forEach(t => t.completed = true);
    }

    onUpdateOrder({
      ...activeOrder,
      status: newStatus,
      timeline: updatedTimeline
    });
    setCustomMilestoneDesc('');
  };

  // 3. Add Deliverable Link (PDF, ZIP, PowerPoint)
  const handleAddDeliverableLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !newDeliverableLabel || !newDeliverableUrl) return;

    const existingLinks = activeOrder.deliverableLinks || [];
    const newLink = {
      label: newDeliverableLabel,
      url: newDeliverableUrl,
      icon: newDeliverableLabel.toLowerCase().includes('zip') ? 'FileArchive' : 'FileText'
    };

    const now = new Date().toISOString();
    const updatedTimeline = [...activeOrder.timeline];
    
    // Bump status to review or completed automatically when files are delivered
    const reviewIdx = updatedTimeline.findIndex(t => t.status === 'review');
    if (reviewIdx !== -1) {
      updatedTimeline[reviewIdx].completed = true;
      updatedTimeline[reviewIdx].timestamp = now;
      updatedTimeline[reviewIdx].description = `New draft package delivered for review: "${newDeliverableLabel}".`;
    }

    onUpdateOrder({
      ...activeOrder,
      deliverableLinks: [...existingLinks, newLink],
      timeline: updatedTimeline,
      status: activeOrder.status === 'pending_payment' || activeOrder.status === 'received' ? 'in_progress' : activeOrder.status
    });

    setNewDeliverableLabel('');
    setNewDeliverableUrl('');
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden" id="admin-control-dashboard">
      
      {/* Admin Header Context Banner */}
      <div className="bg-neutral-900 px-6 py-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-black tracking-tight font-sans">
              Peak Minds Hub <span className="text-emerald-400 font-bold font-mono text-xs uppercase px-2 py-0.5 bg-neutral-800 rounded ml-2">Site Owner Control Room</span>
            </h2>
          </div>
          <p className="text-neutral-400 text-xs mt-1">
            Logged in: <strong className="text-white font-mono">{currentUserEmail || 'Simulated Admin Operator'}</strong> • Real-time database binding active.
          </p>
        </div>
        <button 
          onClick={onCloseAdmin}
          className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
        >
          Return to Hub Portal
        </button>
      </div>

      {/* Numerical Performance indicators for Admin quick briefing */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 p-6 bg-neutral-50/50 border-b border-neutral-200">
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center shadow-sm">
          <span className="text-[10px] text-neutral-400 font-mono uppercase block">Total Orders</span>
          <span className="text-2xl font-black text-neutral-800 font-mono block">{totalOrders}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 text-center shadow-sm">
          <span className="text-[10px] text-amber-600 font-mono uppercase block">Awaiting Pay</span>
          <span className="text-2xl font-black text-amber-600 font-mono block">{pendingPaymentsCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-300 text-center shadow-sm">
          <span className="text-[10px] text-neutral-850 font-mono uppercase block">In Progress</span>
          <span className="text-2xl font-black text-neutral-850 font-mono block">{inProgressCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 text-center shadow-sm">
          <span className="text-[10px] text-blue-600 font-mono uppercase block">client proofing</span>
          <span className="text-2xl font-black text-blue-600 font-mono block">{reviewCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 text-center shadow-sm">
          <span className="text-[10px] text-emerald-600 font-mono uppercase block">Delivered</span>
          <span className="text-2xl font-black text-emerald-600 font-mono block">{completedCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-300 text-center shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] text-emerald-700 font-mono uppercase block">Total Cash Flow</span>
          <span className="text-base font-black text-emerald-800 font-mono block mt-1">Ksh {totalKshCollection}</span>
        </div>
      </div>

      {/* Split view workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        
        {/* LEFT COLUMN: LIST OF SUBMITTED JOBS */}
        <div className="lg:col-span-5 border-r border-neutral-200 flex flex-col max-h-[700px] overflow-y-auto bg-neutral-50/10">
          
          {/* Status Filters bar */}
          <div className="p-4 border-b border-neutral-200 bg-white sticky top-0 z-10 flex gap-1 overflow-x-auto">
            {(['all', 'pending_payment', 'received', 'in_progress', 'review', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-[10px] font-black uppercase tracking-wider py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === f 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                {f === 'all' ? 'All Work' : f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="divide-y divide-neutral-150">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                <AlertTriangle className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                No orders identified matching this status filter.
              </div>
            ) : (
              filteredOrders.map(o => {
                const isActive = o.id === selectedOrderId;
                const hasMpesaInfo = o.id.startsWith('TRACK-') || (o as any).paymentInfo;
                
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className={`w-full text-left p-4 transition-all hover:bg-neutral-50 flex items-start gap-3.5 ${
                      isActive ? 'bg-emerald-50/30 border-l-4 border-emerald-600 pl-3' : ''
                    }`}
                  >
                    {/* Status circle indicators */}
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${
                      o.status === 'pending_payment' ? 'bg-amber-500' :
                      o.status === 'received' ? 'bg-amber-400' :
                      o.status === 'in_progress' ? 'bg-neutral-800' :
                      o.status === 'review' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-neutral-900">{o.id}</span>
                        <span className="text-[9px] text-neutral-400 font-medium font-mono">
                          {new Date(o.createdAt).toLocaleDateString('en-KE')}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-xs text-neutral-700 truncate">{o.title}</h4>
                      
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] font-medium text-neutral-500">
                          {o.customerName} ({o.customerEmail.split('@')[0]})
                        </span>
                        <div className="flex items-center gap-1.5">
                          {hasMpesaInfo && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-[9px] font-black text-emerald-800 rounded font-mono">
                              M-PESA
                            </span>
                          )}
                          <strong className="text-xs text-emerald-700 font-mono font-black">Ksh {o.totalPrice}</strong>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REVERIFY PAYMENT DETAILS, DELIVER WORK & BIND LOGS */}
        <div className="lg:col-span-7 p-6 overflow-y-auto max-h-[700px]">
          {activeOrder ? (
            <div className="space-y-6">
              
              {/* Client Brief Block */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-150 pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">Order Sheet</span>
                    <strong className="text-lg font-black font-mono text-neutral-900">{activeOrder.id}</strong>
                  </div>
                  <h3 className="text-base font-bold text-neutral-800 mt-1 font-sans">{activeOrder.title}</h3>
                </div>

                <div className="flex flex-col items-end shrink-0 text-right">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-wider ${
                    activeOrder.status === 'pending_payment' ? 'bg-amber-100 text-amber-800' :
                    activeOrder.status === 'received' ? 'bg-amber-500/10 text-amber-800' :
                    activeOrder.status === 'in_progress' ? 'bg-neutral-900 text-white animate-pulse' :
                    activeOrder.status === 'review' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeOrder.status.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1">Due: {new Date(activeOrder.deliveryDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* 1. PAYMENT VERIFICATION CENTER (CRITICAL FOR OWNER EXPLANATION) */}
              <div className="bg-emerald-50/40 border border-emerald-150 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-merchant-900">Receipt Verification Desk</h4>
                      <p className="text-[10px] text-emerald-700 font-medium">Verify client payment details against Safaricom ledger</p>
                    </div>
                  </div>
                  
                  {activeOrder.status === 'pending_payment' ? (
                    <button
                      onClick={handleVerifyPayment}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-wider py-1.5 px-3 rounded-lg flex items-center space-x-1 shadow-sm transition-all"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirm &amp; Verify Payment</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-black uppercase">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Validated &amp; Approved</span>
                    </div>
                  )}
                </div>

                {/* Simulated Payment details parsing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-neutral-400 block font-mono uppercase">Payable Invoice</span>
                      <strong className="font-mono text-sm text-neutral-800">Ksh {activeOrder.totalPrice}.00</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block font-mono uppercase font-bold">Client Supplied Mobile Line</span>
                      <strong className="font-mono text-neutral-800">
                        {(activeOrder as any).paymentInfo?.phone || '0794592550 (Pochi reference)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block font-mono uppercase">Receipt Code Submission</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="font-mono text-emerald-800 font-bold bg-white border border-emerald-100 px-1.5 py-0.5 rounded">
                          {(activeOrder as any).paymentInfo?.transactionId || activeOrder.id.split('-').pop()}
                        </strong>
                        <button
                          onClick={() => handleCopyCode((activeOrder as any).paymentInfo?.transactionId || activeOrder.id)}
                          className="text-neutral-400 hover:text-neutral-600 p-1 rounded bg-white"
                          title="Copy reference"
                        >
                          {copiedCode === ((activeOrder as any).paymentInfo?.transactionId || activeOrder.id) ? (
                            <span className="text-[8px] text-emerald-500 font-mono">Copied!</span>
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-left bg-white p-3 rounded-xl border border-emerald-100/50">
                    <span className="text-[9px] text-neutral-400 block font-mono uppercase font-bold">SMS MESSAGE PROOF</span>
                    <p className="text-[10px] text-neutral-600 font-mono leading-relaxed bg-neutral-50 p-2 rounded max-h-24 overflow-y-auto">
                      {(activeOrder as any).paymentInfo?.smsReceipt || 
                        `KQA592550 Confirmed. Ksh ${activeOrder.totalPrice}.00 sent to Pochi la Biashara 0794592550 on ${new Date(activeOrder.createdAt).toLocaleDateString('en-KE')}.`
                      }
                    </p>
                  </div>
                </div>

                {/* Screenshot view if screenshot alert logs is uploaded */}
                <div className="border border-emerald-150 rounded-xl bg-white p-3 text-xs space-y-2">
                  <span className="text-[9px] text-neutral-400 block font-mono uppercase">Uploaded Screenshot receipt</span>
                  <div className="flex items-center space-x-2.5">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-neutral-700">mpesa_payment_success_screenshot.png</p>
                      <p className="text-[9px] text-neutral-400">1.2 MB • Dragged and parsed client-side</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => alert("Verification check: In production, client screenshots are stored safely on Cloud storage linked contextually.")}
                      className="ml-auto text-emerald-700 hover:underline text-[10px] font-bold"
                    >
                      Inspect Full Image
                    </button>
                  </div>
                </div>
              </div>

              {/* Scope parameters and requirements */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-150 space-y-3.5 text-xs text-neutral-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white p-2 rounded-xl border border-neutral-200">
                    <span className="text-[9px] text-neutral-400 block uppercase">Client Tier</span>
                    <p className="font-bold text-neutral-800 capitalize mt-0.5">{activeOrder.audience}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-neutral-200">
                    <span className="text-[9px] text-neutral-400 block uppercase">Quantity</span>
                    <p className="font-bold text-emerald-700 mt-0.5 font-mono">{activeOrder.pageCount} {activeOrder.serviceType === 'latex' ? 'Pages' : activeOrder.serviceType === 'word' ? 'Pages' : 'Slides'}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-neutral-200">
                    <span className="text-[9px] text-neutral-400 block uppercase">Speed</span>
                    <p className="font-bold text-red-600 capitalize mt-0.5">{activeOrder.urgency}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-neutral-200">
                    <span className="text-[9px] text-neutral-400 block uppercase">Service</span>
                    <p className="font-bold text-neutral-800 uppercase mt-0.5">{activeOrder.serviceType}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <strong className="block text-neutral-800 text-[11px] uppercase tracking-wider font-mono">Detailed Briefing Prompts:</strong>
                  <p className="bg-white p-3 rounded-xl border border-neutral-200 leading-relaxed text-neutral-600">
                    {activeOrder.description}
                  </p>
                </div>

                {/* Download Manuscript Section */}
                {activeOrder.attachments && activeOrder.attachments.length > 0 && (
                  <div className="space-y-2 border-t border-neutral-200 pt-3">
                    <strong className="block text-neutral-800 text-[11px] uppercase tracking-wider font-mono">Attached client drafts to format:</strong>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {activeOrder.attachments.map((att, i) => (
                        <div key={i} className="bg-white px-3 py-2.5 rounded-xl border border-neutral-150 flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                            <div className="truncate text-left">
                              <p className="text-[11px] font-bold text-neutral-800 truncate">{att.name}</p>
                              <p className="text-[9px] text-neutral-400 font-mono">{att.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert(`Initiating secure local formatting sandbox download for client draft file: ${att.name}`)}
                            className="text-emerald-600 hover:text-emerald-800 p-1 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
                            title="Download File"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. REVISION REQUESTS / FEEDBACK INNER HUB */}
              {activeOrder.status === 'review' && (
                <div className="bg-blue-50/50 border border-blue-150 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-blue-800 font-bold">
                    <Activity className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Active Client Proofing Feedback loop:</span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">
                    The client has tracking panel remarks active on Overleaf output draft models. Review guidelines:
                  </p>
                  <div className="bg-white border border-blue-100 rounded-xl p-3 font-mono text-[10px] text-neutral-600">
                    "[Client Feedback]: Please check the margin sizing on Chapter 3 equations list page 12. Increase tracking padding to clear dissertation committee reviews. Thanks!"
                  </div>
                </div>
              )}

              {/* 3. CONTROL CENTER: WORKFLOW ACTION ENGINE */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <span className="text-[10px] text-neutral-400 block font-mono uppercase font-black tracking-wider">
                  Admin Action control panel
                </span>

                {/* Progress actions group */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('in_progress', 'Preparing final structured typography layouts, typesetting mathematical formulas, and formatting slide grids.')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      activeOrder.status === 'in_progress' 
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' 
                        : 'bg-white hover:bg-neutral-50 border-neutral-250 text-neutral-700'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Begin Drafting
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('review', 'Compilation draft submitted. Click deliver draft file below to input Overleaf/Review link.')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      activeOrder.status === 'review'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white hover:bg-neutral-50 border-neutral-250 text-neutral-700'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Request Proofing
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('completed', 'Final production zip archive and proofed slides successfully compiled. Project marked completed.')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      activeOrder.status === 'completed'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white hover:bg-neutral-50 border-neutral-250 text-neutral-700'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Complete Project
                  </button>
                </div>

                {/* Milestone Description modifier */}
                <div className="space-y-2 pt-1 border-t border-neutral-100">
                  <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                    Push Custom Milestone Update Description to Client Tracker Timeline
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Typeset Equations for Chapter 4 finished. Perfect margin alignment of graphs complete."
                      value={customMilestoneDesc}
                      onChange={(e) => setCustomMilestoneDesc(e.target.value)}
                      className="w-full text-xs py-2 px-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleUpdateStatus(activeOrder.status, customMilestoneDesc)}
                      disabled={!customMilestoneDesc.trim()}
                      className="bg-neutral-900 hover:bg-neutral-950 disabled:bg-neutral-200 disabled:text-neutral-400 font-bold uppercase text-[10px] tracking-wider py-2 px-4 rounded-xl text-white transition-all whitespace-nowrap"
                    >
                      Update Milestone
                    </button>
                  </div>
                </div>

                {/* 4. FILE DIRECT DELIVERABLES UPLOADER */}
                <form onSubmit={handleAddDeliverableLink} className="space-y-3 pt-3 border-t border-neutral-150">
                  <strong className="block text-neutral-850 text-xs font-sans">
                    Deliver Compiled Document Files / Download Links to Client:
                  </strong>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Deliverable Label</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Final Latex Compile ZIP Source"
                        value={newDeliverableLabel}
                        onChange={(e) => setNewDeliverableLabel(e.target.value)}
                        className="w-full text-xs py-2 px-3 border border-neutral-200 rounded-xl outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Download URL / Overleaf link</label>
                      <input
                        type="url"
                        required
                        placeholder="e.g. https://drive.google.com/doc-zip"
                        value={newDeliverableUrl}
                        onChange={(e) => setNewDeliverableUrl(e.target.value)}
                        className="w-full text-xs py-2 px-3 border border-neutral-200 rounded-xl outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-wider py-2.5 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload &amp; Deliver Work Attachment Link</span>
                  </button>
                </form>

                {/* Existing delivered links list */}
                {activeOrder.deliverableLinks && activeOrder.deliverableLinks.length > 0 && (
                  <div className="space-y-2 border-t border-neutral-100 pt-3 text-xs">
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase">Delivered Assets in Client View:</span>
                    <div className="space-y-1.5">
                      {activeOrder.deliverableLinks.map((dl, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-neutral-50 p-2 rounded-lg border border-neutral-150">
                           <span className="font-semibold text-neutral-700">{dl.label}</span>
                          <a 
                            href={dl.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-emerald-600 hover:underline flex items-center gap-1 font-mono text-[10px]"
                          >
                            <span>Open URL Link</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-neutral-400 border border-dashed rounded-3xl min-h-[300px]">
              <FileCode className="h-12 w-12 text-neutral-200 mb-2" />
              <p className="text-sm">Please select a submitted project order from the left column to verify details.</p>
            </div>
          )}
        </div>
      </div>

      {/* LOWER SECTION: CRITICAL REQUIREMENT METRIC - ALERTS MONITORING OUTBOX */}
      <div className="bg-neutral-900 text-white p-6 border-t border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-emerald-400 shrink-0 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold font-sans">Email Alerts Dispatch Console Ledger</h3>
              <p className="text-[10px] text-neutral-400 font-mono">Real-time outbox tracking dispatches targeting: <strong className="text-emerald-400">arphaxadnjoroge@gmail.com</strong></p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[9px] font-mono text-neutral-300">
            SMTP ACTIVE SENSOR
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-left">
          {emailLogs.length === 0 ? (
            <div className="text-center p-4 text-neutral-500 text-xs">
              No mail alerts dispatched in this session outbox yet. Submit a new typesetting order to trigger real-time SMTP alerts!
            </div>
          ) : (
            emailLogs.map(log => (
              <div key={log.id} className="bg-black/40 border border-white/5 rounded-xl p-3.5 text-[10px] space-y-1.5 leading-relaxed tracking-wider">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-neutral-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    log.status === 'sent' ? 'bg-emerald-900 border border-emerald-500 text-emerald-300' : 'bg-amber-900 border border-amber-600 text-amber-300'
                  }`}>
                    {log.status === 'sent' ? 'DELIVERED SUCCESS' : 'SIMULATED DISPATCH'}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-300">Recipient: </span> {log.recipient}
                </div>
                <div>
                  <span className="text-amber-300">Subject: </span> {log.subject}
                </div>
                <div className="p-2 bg-neutral-950 rounded text-neutral-400 border border-neutral-850 whitespace-pre-line text-[9px] font-sans">
                  {log.body}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
