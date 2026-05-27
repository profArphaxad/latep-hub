import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Clock, 
  GraduationCap,
  School,
  Building2,
  ChevronRight,
  FileText
} from 'lucide-react';

interface LandingHomeProps {
  currentUserEmail: string | null;
  onSignIn: () => void;
  onNavigate: (tab: 'home' | 'services' | 'order' | 'track' | 'admin') => void;
}

export default function LandingHome({ currentUserEmail, onSignIn, onNavigate }: LandingHomeProps) {
  
  const handlePathwayClick = (pathway: 'student' | 'school' | 'corporate') => {
    if (!currentUserEmail) {
      onSignIn();
    } else {
      onNavigate('services');
    }
  };

  return (
    <div className="space-y-16 py-4" id="landing-home-viewport">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-neutral-800 shadow-2xl">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-900/40 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-mono tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Latex & Typography Formatting Center</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none font-sans">
            Your Ideas, Perfectly <span className="text-emerald-400 underline decoration-wavy decoration-emerald-500/50 underline-offset-4">Typeset & Structured</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-350 font-light leading-relaxed max-w-2xl">
            Latep Hub transforms draft manuscripts, raw spreadsheets, complex formulas, and handwritten reports into professional production-grade LaTeX documents, academic slides, and corporate publisher formats.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {currentUserEmail ? (
              <>
                <button
                  onClick={() => onNavigate('services')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-600/10 group active:scale-[0.98]"
                >
                  <span>Explore Solutions</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => onNavigate('order')}
                  className="bg-neutral-800 hover:bg-neutral-750 text-neutral-250 border border-neutral-700 font-bold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Sliders className="h-4 w-4 text-emerald-400" />
                  <span>Configure Custom Order</span>
                </button>
              </>
            ) : (
              <button
                onClick={onSignIn}
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black px-7 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:shadow-emerald-400/20 group active:scale-[0.98]"
              >
                <span>Access Workspace (Google Sign-In)</span>
                <ArrowRight className="h-4 w-4 text-neutral-950 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>

        {/* Floating status parameters in corner */}
        <div className="absolute bottom-6 right-6 hidden xl:block font-mono text-[10px] text-neutral-500 space-y-1 bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-neutral-800">
          <p className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            COMPILER ACTIVE (pdfTeX 3.1415)
          </p>
          <p>STRICT CLIENT AUTHENTICATION FORWARDED</p>
          <p>M-PESA / SECURE STRIPE CHECKOUT VERIFIED</p>
        </div>
      </div>

      {/* Security Gate Guard Message in Case of No Account */}
      {!currentUserEmail && (
        <div className="bg-amber-50/60 border border-amber-200/75 rounded-3xl p-6 sm:p-8 space-y-4 max-w-4xl mx-auto shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-800 shrink-0">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-amber-950 tracking-tight">
                🔐 Client Privacy and Workspace Security Check
              </h3>
              <p className="text-xs text-amber-850 leading-relaxed font-normal">
                To guarantee absolute confidentiality, allow seamless bibliography integration (BibTeX/Zotero), dynamic PDF compilation previews, and real-time revision dialogues, 
                <strong> clients are kindly required to establish an authorized account using Google Sign-In before browsing services and creating projects.</strong> Our system uses passwordless authentication so that your active configurations are tied safely to your verified identity.
              </p>
            </div>
          </div>
          
          <div className="bg-white/95 rounded-2xl p-4 border border-amber-150/80 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-left">
              <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest font-black block">Single-click Access Setup</span>
              <p className="text-xs text-neutral-700 font-semibold font-sans">No password required. Connect automatically with your email address.</p>
            </div>
            <button
              onClick={onSignIn}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-700/10"
            >
              Authenticate & Open Portal
            </button>
          </div>
        </div>
      )}

      {/* THREE HIGH-IMPACT EXPLICIT SERVICE PATHWAYS */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 uppercase">Targeted Typography Solutions</span>
          <h2 className="text-3xl font-black text-neutral-900 font-sans tracking-tight">Select Your Service Pathway</h2>
          <p className="text-xs text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Choose the workspace built directly around your operational speed, style rules, and structural guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PATHWAY 1: STUDENT SOLUTION */}
          <div className="bg-gradient-to-b from-indigo-50/50 to-white hover:from-indigo-50/80 rounded-3xl border border-indigo-100 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-md shadow-indigo-600/15">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-[9px] font-mono bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  Academic Standard
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight font-sans">Student Pathway</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  Tailored for thesis draft corrections, laboratory reports, presentation templates, homework layout refinement, and academic CV formatting.
                </p>
              </div>

              <div className="border-t border-indigo-100/60 pt-5 space-y-3">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Platform Standard Deliverables</p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-normal">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Clean math equation formatting (AMS-LaTeX style)</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-sans font-normal">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>BibTeX references & reference tracking checklist</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-normal">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Formatted print-ready MS Word submission versions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100">
              <button
                onClick={() => handlePathwayClick('student')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                {currentUserEmail ? (
                  <>
                    <span>Enter Student Estimator</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 opacity-90" />
                    <span>Sign In for Student Rate</span>
                  </>
                )}
              </button>
              {!currentUserEmail && (
                <p className="text-center text-[9px] text-neutral-450 mt-2 font-mono">
                  * Authentication required to secure local academic records
                </p>
              )}
            </div>
          </div>

          {/* PATHWAY 2: SCHOOL & INSTRUCTOR SOLUTION */}
          <div className="bg-gradient-to-b from-emerald-50/50 to-white hover:from-emerald-50/80 rounded-3xl border border-emerald-150 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-md shadow-emerald-600/15">
                  <School className="h-6 w-6" />
                </div>
                <span className="text-[9px] font-mono bg-emerald-100 text-emerald-850 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  Educator Package
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight font-sans">School Pathway</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  Configured for institutions, secondary instructors, and universities. Beautify official test blueprints, class syllabi, curriculum pamphlets, and department memos.
                </p>
              </div>

              <div className="border-t border-emerald-100/60 pt-5 space-y-3">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Platform Standard Deliverables</p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-normal">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Reusable .POTX templates & brand manuals</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-normal">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>School or department custom palette styling</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-normal">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Highly readable multi-column exam sheets layout</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100">
              <button
                onClick={() => handlePathwayClick('school')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                {currentUserEmail ? (
                  <>
                    <span>Enter School Estimator</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 opacity-90" />
                    <span>Sign In for Educator Rate</span>
                  </>
                )}
              </button>
              {!currentUserEmail && (
                <p className="text-center text-[9px] text-neutral-450 mt-2 font-mono">
                  * Setup authorized workspace in one single click
                </p>
              )}
            </div>
          </div>

          {/* PATHWAY 3: CORPORATE SOLUTION */}
          <div className="bg-gradient-to-b from-amber-50/40 to-white hover:from-amber-50/70 rounded-3xl border border-amber-200 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="bg-amber-600 text-white p-3 rounded-2xl shadow-md shadow-amber-600/15">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  Enterprise Suite
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight font-sans">Corporate Pathway</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  Polished documentation for corporate policy handbooks, company profiles, commercial portfolios, slides, investor whitepapers, and brand briefs in DOCX/PDF.
                </p>
              </div>

              <div className="border-t border-amber-100/60 pt-5 space-y-3">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Platform Standard Deliverables</p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-normal">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Full font-embedding & vector alignment checklist</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-normal">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Interactive hyperlinked content guidelines</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-neutral-750 font-normal">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Print-ready executive PDF and editable DOCX masters</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100">
              <button
                onClick={() => handlePathwayClick('corporate')}
                className="w-full bg-neutral-900 hover:bg-neutral-950 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                {currentUserEmail ? (
                  <>
                    <span>Enter Corporate Estimator</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 opacity-90 animate-pulse text-amber-400" />
                    <span>Sign In for Business Rate</span>
                  </>
                )}
              </button>
              {!currentUserEmail && (
                <p className="text-center text-[9px] text-neutral-450 mt-2 font-mono">
                  * Safe sign-in respects your corporate email policy
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Feature grid detailing general platform services */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-neutral-900 font-sans tracking-tight">Our Dedicated Formatting Workspace</h2>
          <p className="text-xs text-neutral-500 max-w-xl mx-auto">
            Once authenticated, Latep Hub unlocks a sophisticated ecosystem of real-time tools built for rigorous academic and professional compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl border border-neutral-150 p-6 md:p-8 space-y-4 hover:shadow-md transition-all">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl w-fit">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Interactive Solutions Library</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Gain access to specialized catalog cards covering standard LaTeX document structuring, premium IEEE template adjustments, presentation slides, academic CV layouts, and professional Word templates.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50/50 px-2.5 py-1 rounded-full font-bold">
                ✓ Includes BibTeX Compilation
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl border border-neutral-150 p-6 md:p-8 space-y-4 hover:shadow-md transition-all">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Dynamic Page-Based Calculator</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Calculate exact quotation values on the spot. Configure specific academic audiences, selection type variables (LaTeX, PPT, and Word formats), page counts, and choose standard, express (48h), or rush (24h) schedules.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50/50 px-2.5 py-1 rounded-full font-bold">
                ✓ Honest Cost Previews
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl border border-neutral-150 p-6 md:p-8 space-y-4 hover:shadow-md transition-all">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl w-fit">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Milestone Tracking & Revision Box</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Track project milestones from "Assigned", to "Draft Review", to "Completed" with direct revision comment submission. Communicate edits directly back to your designated formatting officer.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50/50 px-2.5 py-1 rounded-full font-bold">
                ✓ Interactive Review Cycle
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
