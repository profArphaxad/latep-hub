import { useState } from 'react';
import { AUDIENCES, SERVICES } from '../data';
import { AudienceType, ServiceType, ServiceDetail } from '../types';
import { 
  Check, 
  GraduationCap, 
  School, 
  Briefcase, 
  FileText, 
  Presentation, 
  Cpu, 
  Timer, 
  ArrowRight,
  Calculator,
  Flame,
  CheckCircle2,
  Lock,
  Code,
  Sparkles,
  Eye,
  Sliders,
  Terminal,
  FileCheck2,
  UserCheck
} from 'lucide-react';
// @ts-ignore
import latexPreviewImg from '../assets/images/latex_preview_1779874154684.png';

interface ServiceExplorerProps {
  onSelectConfigure: (audience: AudienceType, service: ServiceType, initialUnits: number, initialUrgency: 'standard' | 'express' | 'rush') => void;
}

export default function ServiceExplorer({ onSelectConfigure }: ServiceExplorerProps) {
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>('student');
  const [activeServiceTab, setActiveServiceTab] = useState<ServiceType>('latex');
  
  // Interactive mini calculator states
  const [calcUnits, setCalcUnits] = useState<number>(15);
  const [calcUrgency, setCalcUrgency] = useState<'standard' | 'express' | 'rush'>('standard');
  
  // Interactive showroom states for draft vs typeset showcase
  const [showcaseMode, setShowcaseMode] = useState<'latex' | 'ppt'>('latex');
  const [compiledState, setCompiledState] = useState<'compiled' | 'draft'>('compiled');

  const currentAudienceInfo = AUDIENCES[selectedAudience];
  const serviceDetail: ServiceDetail = SERVICES[selectedAudience][activeServiceTab];

  // Price Calculation Logic for Mini Estimator - standard flat rate, zero premium markup for urgency
  const getEstimatedPrice = () => {
    let base = serviceDetail.basePrice;
    let unitsPrice = calcUnits * serviceDetail.pricePerUnit;
    let total = base + unitsPrice;
    return Math.round(total);
  };

  const getEstimatedTime = () => {
    let days = serviceDetail.estimatedDays;
    if (calcUrgency === 'express') days = Math.max(1, Math.ceil(days * 0.6));
    if (calcUrgency === 'rush') days = Math.max(1, Math.ceil(days * 0.35));
    return days;
  };

  const toggleAudienceKey = (key: AudienceType) => {
    setSelectedAudience(key);
    // Reset units slider to standard default based on service
    if (activeServiceTab === 'latex') setCalcUnits(15);
    else if (activeServiceTab === 'ppt') setCalcUnits(12);
    else setCalcUnits(10); // Word document pages
  };

  return (
    <div className="space-y-8 animate-fade-in" id="services-section">
      
      {/* Visual Welcome Banner */}
      <div className="relative overflow-hidden bg-neutral-950 text-white rounded-3xl px-6 py-12 md:py-16 md:px-12 shadow-xl border border-neutral-800">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px]" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-xs border border-emerald-800/60 text-emerald-300">
            <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="font-mono uppercase tracking-wider text-[10px]">Bespoke LATEX & PPTX formats</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-sans leading-tight">
            Academic & Professional <br />
            <span className="text-yellow-400">Latep Hub typesetting</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-300 max-w-2xl font-light">
            Providing publication-grade LaTeX formatting and high-impact PowerPoint slide layouts designed for students, research scholars, educational departments, and corporates.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-neutral-400">
            <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
              <span className="text-emerald-400 font-bold">✔</span> Math/BibTeX Verified
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
              <span className="text-yellow-400 font-bold">✔</span> Compiled Code Deliverables
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
              <span className="text-emerald-400 font-bold">✔</span> 100% Secure Checkout Alerts
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Showcase & Sample Works Workbench */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 md:p-8 space-y-6 border border-neutral-800 relative overflow-hidden shadow-lg" id="work-showcase-showroom">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-5 z-10 relative">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-[10px] text-emerald-300 font-mono">
              <Sparkles className="h-3 w-3 animate-pulse text-yellow-300" />
              <span>INTERACTIVE PROOF SHOWROOM</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight font-sans">
              Typesetting Laboratory & Live Sample Works
            </h2>
            <p className="text-xs text-neutral-400 font-light max-w-xl leading-relaxed">
              Experience the difference. Slide the compiler toggle to see how our human typesetting leaders transform raw draft files into breathtaking corporate slide decks and LaTeX monographs.
            </p>
          </div>
          
          {/* Showcase Category Toggles */}
          <div className="flex bg-neutral-950/80 p-1 rounded-xl border border-neutral-800 shrink-0 font-mono text-[10px]">
            <button
              onClick={() => { setShowcaseMode('latex'); setCompiledState('compiled'); }}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                showcaseMode === 'latex' ? 'bg-emerald-650 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="h-3 w-3" />
              LaTeX Thesis
            </button>
            <button
              onClick={() => { setShowcaseMode('ppt'); setCompiledState('compiled'); }}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                showcaseMode === 'ppt' ? 'bg-emerald-650 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Presentation className="h-3 w-3" />
              Executive Slides
            </button>
          </div>
        </div>

        {/* Workspace Split Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Controls and Description Col */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-left">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block font-mono">Interactive Laboratory Controllers</span>
              
              {/* Compiler State Toggle */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold font-mono text-neutral-300">COMPILER STATUS:</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-mono font-black ${
                    compiledState === 'compiled' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-yellow-400/10 text-yellow-300 animate-pulse'
                  }`}>
                    {compiledState === 'compiled' ? 'Typeset proof active' : 'Raw Draft scribble'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 rounded-xl text-center text-[10px] font-mono leading-none">
                  <button
                    onClick={() => setCompiledState('draft')}
                    className={`py-2 rounded-lg transition-all font-bold uppercase cursor-pointer ${
                      compiledState === 'draft' ? 'bg-yellow-400 text-neutral-950 font-black shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Raw Draft Input
                  </button>
                  <button
                    onClick={() => setCompiledState('compiled')}
                    className={`py-2 rounded-lg transition-all font-bold uppercase cursor-pointer ${
                      compiledState === 'compiled' ? 'bg-emerald-650 text-white font-black shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Compiled PDF/PPT
                  </button>
                </div>
                
                <p className="text-[10px] text-neutral-500 font-light leading-relaxed">
                  {compiledState === 'compiled' 
                    ? "Showing polished deliverables. Note the perfect margins, aligned tables, beautifully typeset formulas, and responsive mathematical vector styling."
                    : "Showing unstyled messy textual brief as originally supplied before Latep Hub expert typographical touch is applied."
                  }
                </p>
              </div>

              {/* Sample Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-neutral-400 tracking-wider">
                  {showcaseMode === 'latex' ? 'LaTeX Scientific Dissertation Proof' : 'Prestige Investment Pitch Slide deck'}
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  {showcaseMode === 'latex' 
                    ? "Features complete custom macros, structured Bibliographies via BibTeX, publication-ready vector tables, complex multi-line matrix arrays, and aligned mathematical expressions."
                    : "Implements strict typographical constraints, asymmetrical slide layouts, high-impact high-contrast brand systems, and cleanly readable summary cards instead of long wordy slides."
                  }
                </p>
              </div>
            </div>

            {/* Outcomes badge */}
            <div className="bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800 space-y-3 relative overflow-hidden text-left">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest font-mono block font-sans">Deliverable Outcomes:</span>
              <p className="text-[11px] text-neutral-400 font-light leading-tight">
                Our templates pass strict IEEE/ACM and academic peer-reviews immediately. Enjoy 100% compliant LaTeX compilations.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-white pt-1">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <span>Ready source deliverables on completion</span>
              </div>
            </div>
          </div>

          {/* Interactive Document Sandbox Frame */}
          <div className="lg:col-span-8 bg-neutral-950 rounded-2xl border border-neutral-800 shadow-inner flex flex-col overflow-hidden min-h-[380px] relative">
            {/* Header Browser-Style Bar */}
            <div className="bg-neutral-900 px-4 py-2 bg-gradient-to-r from-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0 select-none">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-neutral-500">|</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Terminal className="h-3 w-3 text-emerald-500" />
                  {showcaseMode === 'latex' ? 'latex_compiler_sandbox_v2.sh' : 'presentation_master_rendering.pptx'}
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-1">
                <span className="bg-neutral-800 text-[9px] px-1.5 py-0.5 rounded text-neutral-300 capitalize">
                  mode: {showcaseMode}
                </span>
                <span className="bg-neutral-800 text-[9px] px-1.5 py-0.5 rounded text-neutral-300">
                  {compiledState === 'compiled' ? 'compiled model' : 'raw code'}
                </span>
              </div>
            </div>

            {/* Split Grid Sandbox Frame */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 relative z-10">
              
              {/* Draft editor preview / source pane */}
              <div className="p-4 overflow-auto font-mono text-[9px] sm:text-[10px] text-neutral-300 text-left bg-neutral-950 coding-panel flex flex-col justify-between space-y-3 select-none">
                <div className="space-y-1">
                  <div className="text-neutral-500 border-b border-neutral-900 pb-1 flex justify-between uppercase text-[8px] font-bold">
                    <span>Source Document Editor</span>
                    <span>{showcaseMode === 'latex' ? 'main.tex' : 'outline.txt'}</span>
                  </div>
                  
                  {showcaseMode === 'latex' ? (
                    <div className="space-y-1 text-emerald-400/90 leading-normal">
                      <p className="text-neutral-500">% Document metadata setup</p>
                      <p><span className="text-orange-400">\documentclass</span>[10pt,journal]{'{'}IEEEtran{'}'}</p>
                      <p><span className="text-orange-400">\usepackage</span>{'{'}amsmath,graphicx,cite{'}'}</p>
                      <p className="text-neutral-500">% Formula Definitions</p>
                      <p><span className="text-orange-400">\begin</span>{'{'}document{'}'}</p>
                      <p><span className="text-orange-400">\title</span>{'{'}Prestige Document Synthesis Layout{'}'}</p>
                      <p><span className="text-orange-400">\author</span>{'{'}Latep Hub Typography Lead{'}'}</p>
                      <p><span className="text-orange-400">\maketitle</span></p>
                      <p><span className="text-orange-400">\begin</span>{'{'}equation{'}'}</p>
                      <p className="pl-4 text-emerald-300 font-bold">{"\\mathcal{L} = \\int_0^\\infty e^{-st} f(t) \\, dt"}</p>
                      <p><span className="text-orange-400">\end</span>{'{'}equation{'}'}</p>
                      <p><span className="text-orange-400">\bibliographystyle</span>{'{'}IEEEtran{'}'}</p>
                      <p><span className="text-orange-400">\end</span>{'{'}document{'}'}</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-neutral-300 leading-normal">
                      <p className="text-neutral-500"># Raw slide presentation structure outline notes</p>
                      <p className="font-bold text-yellow-400">[Slide 1: Executive Overview]</p>
                      <p className="pl-2">- Revenue performance surpassed the target. Ksh 4.2M achieved this quarter.</p>
                      <p className="pl-2">- Strong focus on SLA quality compliance is active.</p>
                      <p className="pl-2 font-light text-neutral-500">// Design request: Clean modern columns, big numbers, green indicators, dark theme accents.</p>
                      <p className="font-bold text-yellow-400">[Slide 2: Strategic Pillars]</p>
                      <p className="pl-2">- Robust persistent database backend with secure firestore rules.</p>
                      <p className="pl-2">- 256bit encryption and dynamic email status outbox.</p>
                    </div>
                  )}
                </div>
                
                <div className="text-[9px] text-neutral-600 pt-2 border-t border-neutral-900 flex justify-between font-mono">
                  <span>Line 24, Col 1</span>
                  <span>UTF-8</span>
                </div>
              </div>

              {/* Rendered output pane */}
              <div className="p-4 bg-neutral-900 flex items-center justify-center relative overflow-hidden min-h-[220px]">
                
                {compiledState === 'draft' ? (
                  /* Raw unformatted display */
                  <div className="w-full h-full min-h-[190px] bg-white text-black font-sans p-4 rounded shadow text-[10px] text-left leading-relaxed space-y-2 border border-neutral-300 overflow-auto select-all">
                    <span className="text-[8px] bg-neutral-100 text-neutral-650 px-1 py-0.5 rounded block w-max font-mono font-bold uppercase tracking-wider mb-2">unstyled client input draft</span>
                    {showcaseMode === 'latex' ? (
                      <div className="font-light text-neutral-700">
                        <strong className="text-sm block font-normal pb-1">Prestige Document Synthesis Layout</strong>
                        <p className="text-[9px] font-semibold">Written by: Latep Hub Typography Lead</p>
                        <p className="pt-2">We study how perfect layout changes client reception. Below is the equation of the Laplace transform we want to list: pdf(t) = integral from 0 to infinity of e^(-st) multiplied by f(t) dt. Let this compile into proper scholarly layout.</p>
                        <p className="pt-2">Please make sure there are no typos, align margins with official IEEE templates, and format bibliography with custom BibTeX index structures so my paper compiles flawlessly.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 font-light text-neutral-700">
                        <strong className="text-xs uppercase font-bold block">Slide 1 Proposal Brief</strong>
                        <p className="text-[9px]">We achieved Ksh 4.2 Million revenue this quarter. This represents extremely high progress vectors.</p>
                        <p className="text-[9px]">Features to outline in the PPT slide deck: persistent Firestore databases with secure encryption safeguards, real-time SMTP dispatch networks, and 4.9 out of 5 stars customer retention metrics.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Polished Compiled Display */
                  <div className="w-full h-full flex flex-col justify-center items-center">
                    {showcaseMode === 'latex' ? (
                      /* Live LaTeX compilations mock PDF */
                      <div className="w-full h-[210px] bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 flex flex-col relative group">
                        {/* Realistic Mock PDF image generated */}
                        <div className="relative w-full h-[180px] overflow-hidden bg-neutral-950 flex items-center justify-center">
                          <img 
                            src={latexPreviewImg} 
                            alt="Compiled LaTeX PDF proof document" 
                            className="w-full h-full object-cover rounded-md"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="bg-emerald-600 text-white font-mono text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              PDF Deliverable Proof
                            </span>
                          </div>
                        </div>
                        <div className="bg-neutral-900 px-3 py-1 border-t border-neutral-800 text-[9px] font-mono text-neutral-400 flex justify-between items-center w-full">
                          <span>📄 compiled_monograph.pdf</span>
                          <span>Page 1 of 12</span>
                        </div>
                      </div>
                    ) : (
                      /* Prestige PowerPoint presentation slide */
                      <div className="w-full max-w-[340px] bg-neutral-950 rounded-xl p-4 border border-emerald-500/20 shadow-md text-left space-y-4 relative flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-600/10 rounded-full blur-xl" />
                        
                        {/* Slide Title */}
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[7px] text-emerald-400 font-mono uppercase tracking-widest block font-bold">Slide Template Master v3</span>
                            <h5 className="text-[11px] font-extrabold font-sans text-neutral-100 uppercase tracking-tight">Executive Performance Scorecard</h5>
                          </div>
                          <span className="text-[9px] text-neutral-500 font-mono text-right">Latep Hub pptx</span>
                        </div>

                        {/* Content scorecards */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                          <div className="bg-neutral-900 border border-neutral-800 p-2 rounded-lg flex flex-col justify-between">
                            <span className="text-[8px] text-neutral-450 block">Quarterly Output</span>
                            <p className="text-xs font-black text-emerald-400 font-mono mt-1">KSh 4.20M+</p>
                            <span className="text-[7px] text-emerald-500 block font-mono">▲ +18.4% target</span>
                          </div>
                          <div className="bg-neutral-900 border border-neutral-850 p-2 rounded-lg flex flex-col justify-between">
                            <span className="text-[8px] text-neutral-450 block">Client Satisfaction</span>
                            <p className="text-xs font-black text-amber-400 font-mono mt-1">4.9 / 5.0★</p>
                            <span className="text-[7px] text-neutral-400 block font-mono">1,420+ Verified reviews</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1.5 text-[8px] text-neutral-400 font-sans border-t border-neutral-900 pt-2 leading-relaxed">
                          <div className="flex items-center gap-1.5 text-neutral-300">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                            <span>Structured persistent secure environments</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-neutral-300">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                            <span>Double-guaranteed typography formatting alignment</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Target Market Selective Tabs */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-neutral-950 font-sans uppercase text-sm">Target Sectors</h2>
          <p className="text-xs text-neutral-500">Pick your market sector to explore optimized service packages</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="audience-selector">
          {(Object.keys(AUDIENCES) as AudienceType[]).map((key) => {
            const aud = AUDIENCES[key];
            const isActive = selectedAudience === key;
            const iconRef = 
              key === 'student' ? <GraduationCap className={`h-5 w-5 ${isActive ? 'text-black font-semibold' : 'text-emerald-600'}`} /> :
              key === 'school' ? <School className={`h-5 w-5 ${isActive ? 'text-white' : 'text-emerald-700'}`} /> : 
              <Briefcase className={`h-5 w-5 ${isActive ? 'text-white' : 'text-neutral-900'}`} />;

            return (
              <button
                key={key}
                id={`audience-tab-${key}`}
                onClick={() => toggleAudienceKey(key)}
                className={`text-left p-5 rounded-2xl border transition-all relative ${
                  isActive 
                    ? key === 'student' ? 'bg-yellow-400 text-black border-yellow-400 shadow-md ring-2 ring-yellow-400/20' :
                      key === 'school' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20' :
                      'bg-neutral-950 text-white border-neutral-950 shadow-md ring-2 ring-neutral-950/20'
                    : 'bg-white text-neutral-850 hover:bg-neutral-50 border-neutral-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20' : 'bg-neutral-100'}`}>
                    {iconRef}
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wider font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-black/10 text-current' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {aud.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold font-sans uppercase tracking-tight">{aud.title}</h3>
                <p className={`text-xs mt-1 font-light line-clamp-2 ${isActive ? 'text-current/95' : 'text-neutral-500'}`}>
                  {aud.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feature Service Details Tabs */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
        
        {/* Service Toggle */}
        <div className="flex flex-wrap border-b border-neutral-200 mb-6 font-mono text-xs">
          <button
            onClick={() => setActiveServiceTab('latex')}
            id="service-tab-latex"
            className={`pb-3.5 pt-1 px-4 font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeServiceTab === 'latex'
                ? 'border-emerald-600 text-emerald-700 font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-emerald-600'
            }`}
          >
            <FileText className="h-4 w-4" />
            LaTeX Formats & Structures
          </button>
          <button
            onClick={() => setActiveServiceTab('ppt')}
            id="service-tab-ppt"
            className={`pb-3.5 pt-1 px-4 font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeServiceTab === 'ppt'
                ? 'border-emerald-600 text-emerald-700 font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-emerald-600'
            }`}
          >
            <Presentation className="h-4 w-4" />
            PowerPoint Decks & Slides
          </button>
          <button
            onClick={() => setActiveServiceTab('word')}
            id="service-tab-word"
            className={`pb-3.5 pt-1 px-4 font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeServiceTab === 'word'
                ? 'border-emerald-600 text-emerald-700 font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-emerald-600'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Word Document Design
          </button>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Detailed features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 uppercase tracking-wider font-mono border border-emerald-150">
                {serviceDetail.title}
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-sans text-neutral-900 leading-tight">{serviceDetail.shortDesc}</h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">{serviceDetail.longDesc}</p>
            </div>

            {/* Core Features list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider font-sans">Strategic Standard Integrations</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {serviceDetail.features.map((feature, i) => (
                  <div key={i} className="flex items-start space-x-2 text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source DELIVERABLES */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-150">
              <h4 className="text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2 font-mono">What you will receive:</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {serviceDetail.deliverables.map((deliv, i) => (
                  <span key={i} className="bg-white text-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 font-medium font-mono text-[11px]">
                    📁 {deliv}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mini Interactive Estimator Panel */}
          <div className="lg:col-span-5 bg-neutral-50 rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 pb-3 border-b border-neutral-100">
              <Calculator className="h-5 w-5 text-emerald-600" />
              <h4 className="font-bold text-neutral-900 font-sans uppercase text-xs">Latep Hub Cost Estimate</h4>
            </div>

            {/* Sliders base pricing */}
            <div className="space-y-4 text-xs">
              <div className="flex justify-between font-mono text-neutral-500">
                <span>Registration & Consult</span>
                <span className="font-semibold text-emerald-600">Free / Included</span>
              </div>

              {/* Slider for volume */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-700 capitalize font-medium">Quantity of {serviceDetail.unitName}:</span>
                  <span className="font-mono font-bold bg-emerald-550/10 text-emerald-800 px-2 py-0.5 rounded-md text-sm">{calcUnits}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={activeServiceTab === 'latex' ? 150 : 60}
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-650"
                  id="estimator-units-range"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>Min</span>
                  <span>+Ksh {serviceDetail.pricePerUnit}/{serviceDetail.unitName.substring(0, serviceDetail.unitName.length - 1)}</span>
                  <span>Max</span>
                </div>
              </div>

              {/* Urgency Selection */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-700 font-medium select-none">Execution Velocity Schedule:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCalcUrgency('standard')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                      calcUrgency === 'standard' 
                        ? 'bg-neutral-950 text-white shadow-sm' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    Standard
                    <span className="block text-[9px] opacity-75 font-normal font-mono">SLA Normal</span>
                  </button>
                  <button
                    onClick={() => setCalcUrgency('express')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all relative overflow-hidden ${
                      calcUrgency === 'express' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    Express
                    <span className="block text-[9px] opacity-75 font-normal font-mono">0% Premium</span>
                  </button>
                  <button
                    onClick={() => setCalcUrgency('rush')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                      calcUrgency === 'rush' 
                        ? 'bg-yellow-400 text-black shadow-sm' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Flame className="h-3 w-3 inline text-black mr-0.5 -mt-0.5 animate-pulse" />
                    Rush
                    <span className="block text-[9px] opacity-75 font-normal font-mono">0% Premium</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Final Estimate Output */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-neutral-500 font-medium">Estimated Pricing:</span>
                <span className="text-2xl font-black tracking-tight text-emerald-800 font-mono">
                  Ksh {getEstimatedPrice()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-neutral-600 font-mono">
                <span className="flex items-center gap-1 text-[11px]">
                  <Timer className="h-3.5 w-3.5 text-emerald-600" />
                  Estimated Delivery:
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                  {getEstimatedTime()} Work Days
                </span>
              </div>
            </div>

            {/* Quick action button to trigger setup */}
            <button
              onClick={() => onSelectConfigure(selectedAudience, activeServiceTab, calcUnits, calcUrgency)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:translate-y-0.5 text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md group cursor-pointer"
              id="confirm-estimate-btn"
            >
              <span>Instant Order Setup</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-[9px] text-neutral-400 text-center flex items-center justify-center gap-1 select-none font-mono">
              <Lock className="h-3 w-3" /> Secure checkout. Updates sent automatically to account.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
