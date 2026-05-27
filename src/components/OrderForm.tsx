import React, { useState, useRef } from 'react';
import { AudienceType, ServiceType, OrderAttachment } from '../types';
import { SERVICES, AUDIENCES } from '../data';
import { 
  FileUp, 
  Trash2, 
  Receipt, 
  Lock, 
  HelpCircle, 
  Laptop, 
  FileText, 
  FileSignature, 
  Paperclip,
  CheckCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';

interface OrderFormProps {
  initialAudience: AudienceType;
  initialService: ServiceType;
  initialUnits: number;
  initialUrgency: 'standard' | 'express' | 'rush';
  currentUserEmail?: string | null;
  onSubmitTriggerPayment: (orderData: {
    audience: AudienceType;
    serviceType: ServiceType;
    title: string;
    description: string;
    pageCount: number;
    urgency: 'standard' | 'express' | 'rush';
    totalPrice: number;
    customerName: string;
    customerEmail: string;
    attachments: OrderAttachment[];
  }) => void;
}

export default function OrderForm({
  initialAudience,
  initialService,
  initialUnits,
  initialUrgency,
  currentUserEmail,
  onSubmitTriggerPayment,
}: OrderFormProps) {
  const [audience, setAudience] = useState<AudienceType>(initialAudience);
  const [serviceType, setServiceType] = useState<ServiceType>(initialService);
  const [pageCount, setPageCount] = useState<number>(initialUnits);
  const [urgency, setUrgency] = useState<'standard' | 'express' | 'rush'>(initialUrgency);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUserEmail || '');

  React.useEffect(() => {
    if (currentUserEmail) {
      setCustomerEmail(currentUserEmail);
    }
  }, [currentUserEmail]);
  
  // Custom mock attachments state
  const [attachments, setAttachments] = useState<OrderAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived current service details
  const activeService = SERVICES[audience][serviceType];

  // Price Calculation Engine - standard flat rate, zero premium markup for urgency as per user request
  const calculateInvoiceTotal = () => {
    let base = activeService.basePrice;
    let unitsCost = pageCount * activeService.pricePerUnit;
    let rawTotal = base + unitsCost;
    return Math.round(rawTotal);
  };

  const currentTotal = calculateInvoiceTotal();

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const mockFileAdded = (fileName: string, sizeInBytes: number, type: string) => {
    const sizeStr = 
      sizeInBytes > 1024 * 1024 
        ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB` 
        : `${(sizeInBytes / 1024).toFixed(0)} KB`;

    const newAttachment: OrderAttachment = {
      name: fileName,
      size: sizeStr,
      type: type,
    };

    setAttachments(prev => [...prev, newAttachment]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const extension = file.name.split('.').pop() || 'txt';
      mockFileAdded(file.name, file.size, extension);
    }
  };

  // Simulating typical drag select file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop() || 'txt';
      mockFileAdded(file.name, file.size, extension);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerName.trim() || !customerEmail.trim()) {
      alert('Please fill out all required parameters (Title, Customer Name, and Customer Email).');
      return;
    }

    onSubmitTriggerPayment({
      audience,
      serviceType,
      title,
      description,
      pageCount,
      urgency,
      totalPrice: currentTotal,
      customerName,
      customerEmail,
      attachments
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-250 animate-fade-in p-6 lg:p-8" id="order-workstation">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Interactive Order configuration workspace</h2>
        <p className="text-sm text-neutral-500">Fine-tune your document preferences, upload reference files, and request a designer.</p>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Conf Details Panel Left */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Target market & service Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Audience Targeting</label>
              <select
                id="form-audience-select"
                value={audience}
                onChange={(e) => {
                  setAudience(e.target.value as AudienceType);
                  // preset safe slide/page count
                  if (serviceType === 'latex') setPageCount(15);
                  else if (serviceType === 'ppt') setPageCount(12);
                  else setPageCount(10);
                }}
                className="w-full text-sm py-2.5 px-3 border border-neutral-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none cursor-pointer"
              >
                <option value="student">Student / Academic Purposes</option>
                <option value="school">School / Syllabus & Admin</option>
                <option value="corporate">Corporate / Career & Investors</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Bespoke Vector Solution</label>
              <select
                id="form-service-select"
                value={serviceType}
                onChange={(e) => {
                  const val = e.target.value as ServiceType;
                  setServiceType(val);
                  if (val === 'latex') setPageCount(15);
                  else if (val === 'ppt') setPageCount(12);
                  else if (val === 'word') setPageCount(10);
                }}
                className="w-full text-sm py-2.5 px-3 border border-neutral-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none cursor-pointer"
              >
                <option value="latex">Bespoke LaTeX Documents Formatting</option>
                <option value="ppt">Stunning Presentation slides Design</option>
                <option value="word">Elegant Word Document Design & Formatting</option>
              </select>
            </div>
          </div>

          {/* Title & Requirements Desc */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Order Title / Project Headline <span className="text-red-500">*</span>
              </label>
              <input
                id="form-order-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  serviceType === 'latex' ? 'e.g. PhD Thesis on Deep Reinforcement Learning' :
                  serviceType === 'ppt' ? 'e.g. Commercial Real Estate Pitch Deck Redesign' :
                  'e.g. Annual Company Handout & Employee Policy Manual.docx'
                }
                className="w-full text-sm py-2.5 px-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Requirements Brief, Specifications, & Formulas
              </label>
              <textarea
                id="form-order-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include custom guidelines, styling demands, specific university formatting guidelines, LaTeX package restrictions, palette references, or data files parameters."
                className="w-full text-sm py-2.5 px-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none resize-none"
              />
            </div>
          </div>

          {/* Interactive slider inside workstation */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-700 font-semibold uppercase tracking-wider">
                  Volume ({activeService.unitName}):
                </span>
                <span className="font-mono bg-white border border-neutral-250 font-bold px-2 py-0.5 rounded text-emerald-700 text-sm">
                  {pageCount}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={serviceType === 'latex' ? 150 : 60}
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                id="form-units-range"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Delivery Pace</label>
              <div className="grid grid-cols-3 gap-1">
                {(['standard', 'express', 'rush'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUrgency(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-center transition-all ${
                      urgency === r 
                        ? 'bg-neutral-900 text-white shadow-sm' 
                        : 'bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Metadata Fields */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Contact Credentials (Secure Verification)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 block">
                  FullName <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-customer-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full text-sm py-2 px-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="space-y-1.5 flex-1Combined">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-customer-email"
                  type="email"
                  required
                  readOnly={!!currentUserEmail}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. sarah.j@company.com"
                  className={`w-full text-sm py-2 px-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all ${
                    currentUserEmail 
                      ? 'bg-neutral-100/80 border-neutral-300 text-neutral-500 cursor-not-allowed font-mono' 
                      : 'bg-white border-neutral-300 text-neutral-800'
                  }`}
                />
                {currentUserEmail ? (
                  <p className="text-[10px] text-emerald-700 font-mono font-medium flex items-center gap-1">
                    <span>🔒 Hooked to authorized account.</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-amber-700 font-mono font-medium flex items-center gap-1">
                    <span>💡 Please log in or sign up so we can send tracking email notifications.</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Drag and Drop Upload System */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Reference files or drafts brief (Required or Optional)</label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerSelectFile}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-50/50' 
                  : 'border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50'
              }`}
              id="file-dragon-drop"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                id="form-attachments-input"
              />
              <FileUp className="h-8 w-8 text-neutral-400 mx-auto mb-2 animate-bounce" />
              <p className="text-xs text-neutral-700 font-semibold font-sans">
                Drag and drop your layout briefs here, or <span className="text-emerald-600 underline">browse local drive</span>
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                Accepts .docx, .pptx, .pdf, .txt, .tex, .xlsx, .zip formats (Max 25MB)
              </p>
            </div>

            {/* List current attachments */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1" id="file-attachments-list">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-neutral-800 truncate">{file.name}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 font-semibold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Real-time Invoice Calculator Display Right */}
        <div className="lg:col-span-5 bg-neutral-900 text-white rounded-3xl p-6 border border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-neutral-800">
            <Receipt className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold font-sans text-white">Consolidated Work Bill</h3>
          </div>

          {/* Description details */}
          <div className="space-y-4 text-sm font-light text-neutral-300">
            <div>
              <span className="text-xs text-neutral-500 block uppercase font-mono tracking-wider">Selected Solution</span>
              <p className="font-semibold text-white mt-0.5">{activeService.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-neutral-500 block uppercase font-mono tracking-wider">Base Package Rate</span>
                <p className="font-mono text-emerald-400 mt-0.5">Ksh 0 (Waived)</p>
              </div>
              <div>
                <span className="text-xs text-neutral-500 block uppercase font-mono tracking-wider">Incremental Multiplier</span>
                <p className="font-mono text-white mt-0.5">
                  {pageCount} × Ksh {activeService.pricePerUnit}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-neutral-500 block uppercase font-mono tracking-wider">Pace Multiplier</span>
                <p className="text-emerald-400 mt-0.5 font-semibold font-mono text-xs">
                  Flat Rate (0% Premium Cost)
                </p>
              </div>
              <div>
                <span className="text-xs text-neutral-500 block uppercase font-mono tracking-wider">Bespoke Service Level Agreement Level</span>
                <p className="text-white mt-0.5 font-sans font-semibold text-xs text-yellow-500">Latep Hub Elite Guard</p>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-neutral-850" />

          {/* Pricing Total block */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-neutral-400 font-mono">Invoice Net Total:</span>
              <span className="text-3xl font-black font-sans text-yellow-400">
                Ksh {currentTotal}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500">
              Tax and cloud compilation parameters included. No hidden administrative variables.
            </p>
          </div>

          {/* Checkboxes parameters */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start space-x-2 text-neutral-300">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
              <span>Full confidentiality and NDA protection guaranteed automatically.</span>
            </div>
            <div className="flex items-start space-x-2 text-neutral-300">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Academic Integrity Pledge met. Files are typeset entirely originally without system piracy.</span>
            </div>
          </div>

          {/* Payment gateway call to trigger modal */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:translate-y-0.5 text-white py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg"
            id="order-checkout-button"
          >
            <Lock className="h-4 w-4" />
            <span>Proceed to Secure Payment (M-Pesa & Card)</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] text-neutral-500 font-mono">
              Powered by encrypted Safaricom M-Pesa & card processing token systems.
            </span>
          </div>

        </div>

      </form>
    </div>
  );
}
