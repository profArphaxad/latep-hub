import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { SERVICES } from '../data';
import { updateFirestoreOrder } from '../lib/orderService';
import { 
  Search, 
  MessageSquare, 
  Send, 
  User, 
  Calendar, 
  Paperclip, 
  Download, 
  CheckCircle2, 
  Circle, 
  RefreshCw, 
  Clock, 
  Sparkles,
  FileText,
  FileArchive,
  Layout,
  MessageSquareCode,
  Check,
  CalendarClock,
  ExternalLink,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

interface OrderTrackerProps {
  orders: Order[];
  searchedOrderId: string;
  onClearSearch: () => void;
  onAddRevision: (orderId: string, revisionText: string) => void;
  googleAccessToken?: string | null;
  onConnectCalendar?: () => Promise<string | null>;
}

export default function OrderTracker({
  orders,
  searchedOrderId,
  onClearSearch,
  onAddRevision,
  googleAccessToken = null,
  onConnectCalendar,
}: OrderTrackerProps) {
  const [searchInput, setSearchInput] = useState(searchedOrderId || '');
  const [activeOrderId, setActiveOrderId] = useState<string>(
    searchedOrderId || (orders.length > 0 ? orders[orders.length - 1].id : '')
  );

  // Client comments/revision state
  const [clientComment, setClientComment] = useState('');
  
  // Custom revision log for live feedback within session
  const [customRevisions, setCustomRevisions] = useState<Record<string, { sender: 'client' | 'expert'; text: string; time: string }[]>>({});
  
  // Custom simulated download states with indicator
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState<number>(0);

  // Google Calendar scheduling states
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [scheduleSummary, setScheduleSummary] = useState<string>('');
  const [scheduleDescription, setScheduleDescription] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [scheduleSuccessEvent, setScheduleSuccessEvent] = useState<any>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Synchronize when parent prop search ID changes
  React.useEffect(() => {
    if (searchedOrderId) {
      setSearchInput(searchedOrderId);
      setActiveOrderId(searchedOrderId);
    }
  }, [searchedOrderId]);

  // Retrieve current active order
  const currentOrder = orders.find(o => o.id.toUpperCase() === activeOrderId.toUpperCase());

  // Automatically update prefilled Google Calendar description and summary when active order changes
  React.useEffect(() => {
    if (currentOrder) {
      const datePart = currentOrder.deliveryDate || new Date().toISOString().split('T')[0];
      setScheduledDateTime(`${datePart}T14:30`);
      setScheduleSummary(`Latep Hub Document Collection: Order ${currentOrder.id}`);
      setScheduleDescription(
        `Your document formatted by Latep Hub is ready for collection.\n\n` +
        `Order Specifications:\n` +
        `- ID: ${currentOrder.id}\n` +
        `- Solution Type: ${
            currentOrder.serviceType === 'latex' ? 'LaTeX Standard Document' :
            currentOrder.serviceType === 'ppt' ? 'PowerPoint Presentation Delivery' :
            'Word Publication Formatting'
          }\n` +
        `- Quantity: ${currentOrder.pageCount} ${currentOrder.serviceType === 'latex' ? 'Pages' : currentOrder.serviceType === 'word' ? 'Pages' : 'Slides'}\n` +
        `- Amount Invoiced: Ksh ${currentOrder.totalPrice}.00\n\n` +
        `Please bring your draft annotations or verify your deliverable links in the app dashboard.`
      );
      setScheduleSuccessEvent(null);
      setScheduleError(null);
    }
  }, [currentOrder?.id]);

  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || !scheduledDateTime) return;
    
    // Explicit user confirmation before altering or scheduling
    const userConfirmed = window.confirm(
      `Schedule this collection slot for ${new Date(scheduledDateTime).toLocaleString()} and insert into your Google Calendar?`
    );
    if (!userConfirmed) return;

    setIsScheduling(true);
    setScheduleSuccessEvent(null);
    setScheduleError(null);

    try {
      let activeToken = googleAccessToken;
      
      // If token isn't available, trigger OAuth trigger callback inside the child component
      if (!activeToken && onConnectCalendar) {
        activeToken = await onConnectCalendar();
      }

      if (!activeToken) {
        throw new Error("Unable to obtain Google Calendar OAuth Authorization Token. If you are inside an iframe preview, click 'Open in New Tab' to bypass security controls!");
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const startTime = new Date(scheduledDateTime).toISOString();
      // Ends 30 minutes later
      const endTime = new Date(new Date(scheduledDateTime).getTime() + 30 * 60 * 1000).toISOString();

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: scheduleSummary || `Latep Hub Work Collection: Order ${currentOrder.id}`,
          description: scheduleDescription,
          start: {
            dateTime: startTime,
            timeZone: timezone
          },
          end: {
            dateTime: endTime,
            timeZone: timezone
          },
          attendees: [
            { email: currentOrder.customerEmail }
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 60 }
            ]
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Google Calendar API error (Status ${response.status})`);
      }

      const createdEvent = await response.json();
      setScheduleSuccessEvent(createdEvent);

      // Now merge and update the Order Target Delivery Date in Firestore database!
      const updatedOrder: Order = {
        ...currentOrder,
        deliveryDate: scheduledDateTime.split('T')[0], // update target delivery day
        timeline: [
          ...currentOrder.timeline,
          {
            status: currentOrder.status,
            title: `📅 Work Collection Scheduled`,
            description: `Google Calendar reservation set for ${new Date(scheduledDateTime).toLocaleDateString()} at ${new Date(scheduledDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`,
            completed: true,
            timestamp: new Date().toISOString()
          }
        ]
      };

      await updateFirestoreOrder(updatedOrder);

      // Add comments into Revision thread
      const scheduledMsgText = `🔄 Schedulers: Client scheduled document collection on Google Calendar for ${new Date(scheduledDateTime).toLocaleString()} (TimeZone: ${timezone}).`;
      onAddRevision(currentOrder.id, scheduledMsgText);

    } catch (err: any) {
      console.error("Scheduler failed:", err);
      setScheduleError(err.message || "An unexpected error occurred while communicating with Google Calendar.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveOrderId(searchInput.trim().toUpperCase());
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientComment.trim() || !currentOrder) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { sender: 'client' as const, text: clientComment.trim(), time: timestamp };
    
    // update session client revision storage
    setCustomRevisions(prev => ({
      ...prev,
      [currentOrder.id]: [...(prev[currentOrder.id] || []), newMsg]
    }));

    // notify parent callback if available to update timelines
    onAddRevision(currentOrder.id, clientComment);
    setClientComment('');

    // Simulate expert immediate confirmation response
    setTimeout(() => {
      const expertMsg = {
        sender: 'expert' as const,
        text: `Thanks for the comment. Our dedicated typesetting engineer has received your remark ("${clientComment.trim()}") and will incorporate this into the next design build iteration.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCustomRevisions(prev => ({
        ...prev,
        [currentOrder.id]: [...(prev[currentOrder.id] || []), expertMsg]
      }));
    }, 2000);
  };

  // Simulating compiling / layout package downloads
  const triggerSimulationDownload = (fileName: string) => {
    setDownloadingFileId(fileName);
    setDownloadPercent(0);

    const interval = setInterval(() => {
      setDownloadPercent(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingFileId(null);
            // mock browser file downloader target
            alert(`Service Level Agreement Deliverable complete! Mock file "${fileName}" downloaded successfully in background.`);
          }, 400);
          return 100;
        }
        return p + 20;
      });
    }, 120);
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'review': return 'bg-amber-100 text-amber-800';
      case 'in_progress': return 'bg-neutral-900 text-white animate-pulse';
      case 'received': return 'bg-blue-100 text-blue-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'completed': return 'Service Level Agreement Deliverables Ready';
      case 'review': return 'Awaiting Your Approval';
      case 'in_progress': return 'Expert Typographer Drafting';
      case 'received': return 'Confirmed & Scheduled';
      default: return 'Payment Pending';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="order-tracker-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tracker Search left column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm font-sans">Find Your Document Order</h3>
            
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="tracker-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Paste Order ID (e.g. TRACK-LATE-1092)"
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-mono"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
            </form>

            {searchedOrderId && (
              <button
                onClick={onClearSearch}
                className="w-full py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] rounded font-semibold transition-colors"
                id="clear-search-btn"
              >
                ← Back to full list
              </button>
            )}
          </div>

          {/* Quick List of Session Orders */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Recent Active Orders ({orders.length})</h4>
            
            <div className="space-y-2 max-h-[280px] overflow-y-auto" id="recent-orders-list">
              {orders.map((o) => {
                const isActive = o.id.toUpperCase() === activeOrderId.toUpperCase();
                return (
                  <button
                    key={o.id}
                    id={`track-list-item-${o.id}`}
                    onClick={() => {
                      setActiveOrderId(o.id);
                      setSearchInput(o.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${
                      isActive 
                        ? 'border-emerald-600 bg-emerald-50/20 text-emerald-950' 
                        : 'border-neutral-100 hover:bg-neutral-50 bg-neutral-50/50 text-neutral-700'
                    }`}
                  >
                    <div className="truncate space-y-1">
                      <p className="font-mono text-xs font-bold tracking-wider">{o.id}</p>
                      <p className="text-xs font-medium truncate capitalize">{o.title}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 uppercase tracking-widest ${
                      o.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      o.status === 'review' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-900 text-white'
                    }`}>
                      {o.status === 'completed' ? 'ready' : o.status === 'review' ? 'review' : 'active'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tracker Progress Display right column */}
        <div className="lg:col-span-8">
          {currentOrder ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-6" id="tracking-display-board">
              
              {/* Header metadata */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-5 border-b border-neutral-100 gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold tracking-wider text-neutral-500">{currentOrder.id}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full font-bold ${getStatusBadgeClass(currentOrder.status)}`}>
                      {getStatusLabel(currentOrder.status)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-sans text-neutral-900 capitalize">{currentOrder.title}</h2>
                </div>

                <div className="text-left sm:text-right font-mono text-[11px] text-neutral-500 shrink-0">
                  <p className="flex sm:justify-end items-center gap-1">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    Client: {currentOrder.customerName}
                  </p>
                  <p className="flex sm:justify-end items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    Target delivery: {new Date(currentOrder.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Grid split timeline and properties */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Visual milestone vertical progress left */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider font-mono">Expert Production Milestones</h3>
                  
                  <div className="relative pl-6 space-y-6" id="order-timeline-flow">
                    {/* Running vertical line indicator */}
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-neutral-200" />

                    {currentOrder.timeline.map((step, idx) => {
                      const isStepDone = step.completed || currentOrder.status === 'completed';
                      
                      return (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[22px] top-1 rounded-full p-0.5 bg-white border-2 transition-all ${
                            isStepDone 
                              ? 'border-emerald-600 text-emerald-600 bg-emerald-50' 
                              : 'border-neutral-300 text-neutral-300'
                          }`}>
                            {isStepDone ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5 fill-current text-white" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className={`text-xs font-bold leading-none ${isStepDone ? 'text-neutral-950 font-sans' : 'text-neutral-400 font-light'}`}>
                                {step.title}
                              </h4>
                              {step.timestamp && (
                                <span className="text-[9px] font-mono text-neutral-400">
                                  {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 font-light">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scope parameters and downloads panel right */}
                <div className="md:col-span-5 space-y-5 bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                  <div>
                    <h4 className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">Solution Scope</h4>
                    <span className="text-xs font-semibold text-neutral-700 capitalize mt-1 block">
                      {currentOrder.serviceType === 'latex' && 'LaTeX Document Formatting'}
                      {currentOrder.serviceType === 'ppt' && 'PowerPoint Design Deck'}
                      {currentOrder.serviceType === 'word' && 'Word Document Design & Formatting'}
                    </span>
                    <p className="text-xs text-neutral-500 font-light mt-1">
                      {currentOrder.pageCount} total units configured under {currentOrder.urgency} Service Level Agreement schedule.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block mb-1">Your Loaded Briefs</h4>
                    {currentOrder.attachments.length > 0 ? (
                      <div className="space-y-1">
                        {currentOrder.attachments.map((at, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
                            <span>📎</span>
                            <span className="truncate">{at.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic font-mono block">No brief details uploaded.</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-mono uppercase">Finances Total Invoice</span>
                    <p className="text-lg font-black text-neutral-900 mt-0.5">Ksh {currentOrder.totalPrice}.00</p>
                    <span className="text-[9px] text-emerald-600 font-bold tracking-wider font-mono flex items-center gap-1 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Charge Successfully
                    </span>
                  </div>

                  {/* DOWNLOAD WORK AREA */}
                  {(currentOrder.status === 'completed' || currentOrder.status === 'review') && (
                    <div className="pt-3 border-t border-neutral-200 space-y-2.5" id="downloadable-products">
                      <div className="flex items-center space-x-1.5 text-emerald-800 font-sans font-extrabold text-xs">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-650 animate-pulse" />
                        <span>Available File Deliverables:</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        {currentOrder.deliverableLinks ? (
                          currentOrder.deliverableLinks.map((link, idx) => {
                            const isThisDownloading = downloadingFileId === link.label;
                            
                            return (
                              <button
                                key={idx}
                                disabled={downloadingFileId !== null}
                                onClick={() => triggerSimulationDownload(link.label)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5 font-sans">
                                  {link.icon === 'FileText' ? <FileText className="h-3.5 w-3.5" /> : 
                                   link.icon === 'FileArchive' ? <FileArchive className="h-3.5 w-3.5" /> : 
                                   <Layout className="h-3.5 w-3.5" />}
                                  {isThisDownloading ? `Downloading (${downloadPercent}%)` : link.label}
                                </span>
                                {isThisDownloading ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <button
                            disabled={downloadingFileId !== null}
                            onClick={() => triggerSimulationDownload(`Deliverables-${currentOrder.id}.zip`)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <FileArchive className="h-3.5 w-3.5" />
                              {downloadingFileId ? `Downloading...` : `Download Deliverables ZIP`}
                            </span>
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* GOOGLE CALENDAR COLLECTION SCHEDULER CARD */}
              <div className="border-t border-neutral-100 pt-6 space-y-4" id="google-calendar-scheduler-block">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <CalendarClock className="h-5 w-5 text-emerald-600 animate-pulse" />
                    <div>
                      <h3 className="font-bold text-neutral-900 text-sm font-sans">Google Calendar Collection Scheduler</h3>
                      <p className="text-[10px] text-neutral-405 font-mono uppercase tracking-wider">CLIENT CO-ORDINATION ENGINE • SECURE INTEGRATION</p>
                    </div>
                  </div>
                  {googleAccessToken ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1 self-start sm:self-auto">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Google Calendar Connected
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-105 px-2.5 py-1 rounded-full border border-neutral-200 self-start sm:self-auto">
                      🔒 Authorization Pending
                    </span>
                  )}
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 space-y-4 text-xs">
                  {scheduleSuccessEvent ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 text-left">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-neutral-950 font-sans">📅 Delivery Collection Scheduled Successfully!</h4>
                          <p className="text-neutral-600 leading-relaxed font-light mt-1 text-xs">
                            Your reservation is secured correctly. We've added an event to your Google Calendar and sent an invitation to <span className="font-semibold underline text-neutral-850">{currentOrder.customerEmail}</span>. The delivery officer is notified of your target collection:
                          </p>
                          <div className="mt-3 bg-white p-3 rounded-xl border border-emerald-100 font-mono text-[11px] text-neutral-700 space-y-1">
                            <p className="font-sans font-bold text-neutral-900 text-xs">✍ Event: {scheduleSuccessEvent.summary}</p>
                            <p>⏳ Collection Time: {new Date(scheduledDateTime).toLocaleString()}</p>
                            <p>🗺 Status: Approved & Synchronized</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <a 
                          href="https://calendar.google.com" 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                        >
                          <span>Open My Google Calendar</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setScheduleSuccessEvent(null)}
                          className="bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-250 font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider text-center cursor-pointer transition-colors"
                        >
                          Modify Setup or Re-Schedule
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleScheduleEvent} className="space-y-4 text-left">
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                        Coordinate your exact collection slot with the compiling team. When you select a date and time, this tool writes it directly to your primary Google Calendar and updates our formatting deadlines so that your deliverables are compiled precisely on schedule.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-extrabold block">Proposed Collection Slot</label>
                          <input 
                            type="datetime-local"
                            required
                            min={new Date().toISOString().substring(0, 16)}
                            value={scheduledDateTime}
                            onChange={(e) => setScheduledDateTime(e.target.value)}
                            className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-emerald-500 font-mono text-xs outline-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-extrabold block">Calendar Summary</label>
                          <input 
                            type="text"
                            required
                            value={scheduleSummary}
                            onChange={(e) => setScheduleSummary(e.target.value)}
                            placeholder="e.g. Latep Hub Collection"
                            className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-emerald-500 text-xs outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-extrabold block">Calendar Description Details</label>
                        <textarea 
                          rows={2}
                          value={scheduleDescription}
                          onChange={(e) => setScheduleDescription(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-emerald-500 font-light text-xs outline-none"
                          placeholder="Event description detail notes..."
                        />
                      </div>

                      {scheduleError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start text-red-800 text-[11px] font-medium leading-relaxed">
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                          <div>
                            <span className="font-extrabold">Scheduler Alert: </span>
                            {scheduleError}
                            {!googleAccessToken && (
                              <p className="mt-1 font-sans font-light">Your token may have expired. Please click the authorization button below to establish a secure line.</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-1 flex flex-col sm:flex-row gap-2">
                        {googleAccessToken ? (
                          <button
                            type="submit"
                            disabled={isScheduling}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-extrabold py-3 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-md shadow-emerald-700/10 active:scale-[0.98]"
                          >
                            {isScheduling ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Negotiating calendar slot...</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Schedule Collection on Google Calendar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              if (onConnectCalendar) {
                                setScheduleError(null);
                                await onConnectCalendar();
                              }
                            }}
                            className="bg-neutral-900 hover:bg-neutral-950 text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-[0.98]"
                          >
                            <span className="font-mono text-emerald-400">G</span>
                            <span>Authenticate Google Calendar Account</span>
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Collaborative Expert Revision Logs */}
              <div className="border-t border-neutral-100 pt-5 space-y-4">
                <div className="flex items-center space-x-1.5" id="collaboration-header">
                  <MessageSquareCode className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider font-mono">Expert & Client Collaborative Chat</h3>
                </div>

                {/* Revision message lists */}
                <div className="space-y-2 border border-neutral-100 bg-neutral-50/50 p-4 rounded-2xl max-h-[220px] overflow-y-auto text-xs" id="chat-messages-container">
                  
                  {/* Default welcome message if empty */}
                  <div className="flex gap-2.5 items-start">
                    <div className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase font-mono mt-0.5">TEAM</div>
                    <div className="space-y-0.5 text-left">
                      <p className="font-semibold text-neutral-800">Latep Hub Typesetting Lead</p>
                      <p className="text-neutral-600 font-light leading-relaxed">Welcome to your secure collaboration line. You can message your assigned formatting expert to make modifications, specify target palettes, or request layout styles below.</p>
                      <span className="text-[9px] font-mono text-neutral-400 block pt-0.5">System Initialized</span>
                    </div>
                  </div>

                  {/* Render simulated comments */}
                  {customRevisions[currentOrder.id]?.map((msg, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start pt-2 border-t border-neutral-100 animate-slide-in">
                      <div className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded mt-0.5 uppercase ${
                        msg.sender === 'client' 
                          ? 'bg-neutral-200 text-neutral-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {msg.sender === 'client' ? 'YOU' : 'EXPERT'}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-neutral-800 capitalize">
                          {msg.sender === 'client' ? currentOrder.customerName : 'Assigned Expert Lead'}
                        </p>
                        <p className="text-neutral-600 font-light">{msg.text}</p>
                        <span className="text-[9px] font-mono text-neutral-400 block pt-0.5">{msg.time}</span>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Message input trigger form */}
                <form onSubmit={submitComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={clientComment}
                    onChange={(e) => setClientComment(e.target.value)}
                    placeholder="Ask assigned typesetter to adjust fonts, margin layouts, colors, code formats..."
                    className="flex-1 py-2 px-3 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                    id="tracker-comment-input"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-colors shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
                    id="tracker-comment-submit"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

              </div>

            </div>
          ) : (
            <div className="bg-neutral-50 rounded-3xl p-12 text-center border-2 border-dashed border-neutral-300 space-y-4">
              <Search className="h-10 w-10 text-neutral-400 mx-auto animate-bounce" />
              <div>
                <h3 className="font-bold font-sans text-neutral-800 text-base">Invalid Order ID Code</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                  We could not locate secure files matched to <span className="font-mono bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-700">{activeOrderId}</span>. Try clicking one of recent demo records on left!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
