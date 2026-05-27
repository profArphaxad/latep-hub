import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Header from './components/Header';
import ServiceExplorer from './components/ServiceExplorer';
import OrderForm from './components/OrderForm';
import OrderTracker from './components/OrderTracker';
import PaymentModal from './components/PaymentModal';
import AdminDashboard from './components/AdminDashboard';
import LandingHome from './components/LandingHome';
import { MOCK_ORDERS, MOCK_TESTIMONIALS } from './data';
import { Order, AudienceType, ServiceType, OrderStatus, Testimonial } from './types';
import Testimonials from './components/Testimonials';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  HelpCircle, 
  MessageSquare, 
  Users, 
  Award, 
  Clock, 
  ChevronDown,
  Lock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Sparkles,
  Key,
  X,
  UserCheck
} from 'lucide-react';
import { auth, db } from './lib/firebase';
import { 
  createFirestoreOrder, 
  subscribeToAllOrders, 
  subscribeToUserOrders, 
  subscribeToSingleOrder, 
  updateFirestoreOrder 
} from './lib/orderService';
import { 
  createFirestoreTestimonial, 
  subscribeToTestimonials 
} from './lib/testimonialService';
import { sendNewOrderEmailAlert } from './lib/emailAlert';

export default function App() {
  // Navigation: 'home' | 'services' | 'order' | 'track' | 'admin'
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'order' | 'track' | 'admin'>('home');

  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Interactive standard Email and Password Authentication states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [authProcessing, setAuthProcessing] = useState(false);
  
  // Controls why the authentication modal is opened: 'standard' or 'admin'
  const [authModalPurpose, setAuthModalPurpose] = useState<'standard' | 'admin'>('standard');

  // Administratively permitted email checks
  const isPermittedAdminEmail = (email: string | null | undefined): boolean => {
    if (!email) return false;
    const emailLower = email.trim().toLowerCase();
    // Strictly restricted to lapehub@gmail.com (and latephub@gmail.com as safe spelling fallback)
    return emailLower === 'lapehub@gmail.com' || emailLower === 'latephub@gmail.com';
  };

  // States backed up by real-time Firestore subscriptions
  const [orders, setOrders] = useState<Order[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Transition carrier states (passing configurations from calculator tabs to Form workspace)
  const [formPreset, setFormPreset] = useState<{
    audience: AudienceType;
    service: ServiceType;
    units: number;
    urgency: 'standard' | 'express' | 'rush';
  }>({
    audience: 'student',
    service: 'latex',
    units: 15,
    urgency: 'standard',
  });

  // Track lookup link state from header or search forms
  const [trackingSearchId, setTrackingSearchId] = useState<string>('');

  // Payment popup state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState<{
    audience: AudienceType;
    serviceType: ServiceType;
    title: string;
    description: string;
    pageCount: number;
    urgency: 'standard' | 'express' | 'rush';
    totalPrice: number;
    customerName: string;
    customerEmail: string;
    attachments: { name: string; size: string; type: string }[];
  } | null>(null);

  // FAQ Accordion Open States
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Determine if active user is classified as Admin (strictly verified, no bypasses allowed)
  const isAdminUser = isPermittedAdminEmail(currentUser?.email);

  // 2. Load and subscribe to Testimonials in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToTestimonials((list) => {
      if (list.length === 0) {
        // First boot! Seed Firestore with realistic mock review templates
        MOCK_TESTIMONIALS.forEach(t => createFirestoreTestimonial(t));
      } else {
        setTestimonials(list);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Load and subscribe to Orders based on Auth context
  useEffect(() => {
    let unsubscribeOrders = () => {};

    if (isAdminUser) {
      // Admin sees everything in real-time
      unsubscribeOrders = subscribeToAllOrders((allOrders) => {
        if (allOrders.length === 0) {
          // No orders exist? Seed mock data parameters for seamless demonstration
          MOCK_ORDERS.forEach(o => createFirestoreOrder(o));
        } else {
          setOrders(allOrders);
        }
      });
    } else if (currentUser?.email) {
      // Authenticated client sees only their orders
      unsubscribeOrders = subscribeToUserOrders(currentUser.email, (userOrders) => {
        setOrders(userOrders);
      });
    } else {
      // Not logged in: Default to local storage cached client orders
      const saved = localStorage.getItem('peak_minds_orders_db_v3');
      if (saved) {
        try {
          setOrders(JSON.parse(saved));
        } catch {
          setOrders(MOCK_ORDERS);
        }
      } else {
        setOrders(MOCK_ORDERS);
      }
    }

    return () => unsubscribeOrders();
  }, [currentUser, isAdminUser]);

  // 4. Special guest tracker: fetch a specific order if searched by an unauthenticated customer
  useEffect(() => {
    if (trackingSearchId && !isAdminUser) {
      const unsubscribe = subscribeToSingleOrder(trackingSearchId, (foundOrder) => {
        if (foundOrder) {
          // Merge single searched order into display orders list
          setOrders(prev => {
            const filtered = prev.filter(o => o.id !== foundOrder.id);
            return [foundOrder, ...filtered];
          });
        }
      });
      return () => unsubscribe();
    }
  }, [trackingSearchId, isAdminUser]);

  // Handle addition of a review to Firestore
  const handleAddTestimonial = async (newTestimony: Omit<Testimonial, 'id' | 'createdAt'>) => {
    const fresh: Testimonial = {
      ...newTestimony,
      id: `TEST-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    await createFirestoreTestimonial(fresh);
  };

  // Transition callback when user selects estimator setup CTA
  const handleSelectConfigure = (
    audience: AudienceType,
    service: ServiceType,
    units: number,
    urgency: 'standard' | 'express' | 'rush'
  ) => {
    setFormPreset({ audience, service, units, urgency });
    setActiveTab('order');
    setTimeout(() => {
      document.getElementById('order-workstation')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Header quick tracking search router
  const handleSearchTrackId = (id: string) => {
    setTrackingSearchId(id);
    setActiveTab('track');
  };

  // Trigger form checkout
  const handleFormOrderSubmit = (orderData: typeof pendingOrderDetails) => {
    setPendingOrderDetails(orderData);
    setIsPaymentOpen(true);
  };

  // Secure payment receipt handler (Generates tracked order!)
  const handlePaymentSuccess = async (txn: { transactionId: string; cardLast4: string; phone?: string; smsReceipt?: string }) => {
    if (!pendingOrderDetails) return;

    const servicePrefix = 
      pendingOrderDetails.serviceType === 'latex' ? 'LATE' : 
      pendingOrderDetails.serviceType === 'ppt' ? 'PPTS' : 'PROJ';
    const randSerial = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `TRACK-${servicePrefix}-${randSerial}`;

    const daysOffset = 
      pendingOrderDetails.urgency === 'express' ? 3 : 
      pendingOrderDetails.urgency === 'rush' ? 1 : 5;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysOffset);

    const customTime = new Date().toISOString();
    const newOrder: Order = {
      id: trackingId,
      audience: pendingOrderDetails.audience,
      serviceType: pendingOrderDetails.serviceType,
      title: pendingOrderDetails.title,
      description: pendingOrderDetails.description,
      pageCount: pendingOrderDetails.pageCount,
      urgency: pendingOrderDetails.urgency,
      totalPrice: pendingOrderDetails.totalPrice,
      status: 'received',
      createdAt: customTime,
      deliveryDate: targetDate.toISOString(),
      customerName: pendingOrderDetails.customerName,
      customerEmail: pendingOrderDetails.customerEmail,
      attachments: pendingOrderDetails.attachments,
      timeline: [
        { status: 'pending_payment', title: 'Order Submitted', description: 'User submitted parameters and requested specifications.', timestamp: customTime, completed: true },
        { status: 'received', title: 'Payment Confirmed & Verified', description: txn.cardLast4 === 'MPESA' ? `M-PESA Pochi payment verified. Code: ${txn.transactionId}. Assigned to lead Kenyan typesetting expert.` : `Card ending ${txn.cardLast4} processed securely. Txn ID: ${txn.transactionId}. Assigned to lead designer.`, timestamp: customTime, completed: true },
        { status: 'in_progress', title: 'Draft Outline Scaffold', description: 'Preparing initial structural typography layouts or slide masters.', timestamp: '', completed: false },
        { status: 'review', title: 'Client proofing Delivery', description: 'Interactive layout files submitted for your remarks & adjustments.', timestamp: '', completed: false },
        { status: 'completed', title: 'Final Verified Release', description: 'Zipped vector formats and documents compiling scripts compilation delivery.', timestamp: '', completed: false }
      ],
      // Store checkout metadata
      ...({
        paymentInfo: {
          transactionId: txn.transactionId,
          phone: txn.phone || '0794592550',
          smsReceipt: txn.smsReceipt || `KQA592550 Confirmed. Ksh ${pendingOrderDetails.totalPrice}.00 sent to Pochi la Biashara 0794592550 on ${new Date().toLocaleDateString('en-KE')}.`,
        }
      } as any)
    };

    // 1. Persist to Firestore database!
    await createFirestoreOrder(newOrder);

    // 2. Dispatch immediate automated email alerts outbox to arphaxadnjoroge@gmail.com!
    await sendNewOrderEmailAlert(newOrder);

    // Backup to localStorage cache
    const existingSaved = localStorage.getItem('peak_minds_orders_db_v3');
    const localList: Order[] = existingSaved ? JSON.parse(existingSaved) : [];
    localStorage.setItem('peak_minds_orders_db_v3', JSON.stringify([newOrder, ...localList]));

    // Close checkout modals & redirect directly to progress tracker
    setIsPaymentOpen(false);
    setPendingOrderDetails(null);
    setTrackingSearchId(trackingId);
    setActiveTab('track');
  };

  const clearTrackingSearch = () => {
    setTrackingSearchId('');
  };

  // Add Collaborative revisions request
  const handleAddRevisionComment = async (orderId: string, text: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedTimeline = [...targetOrder.timeline];
    let nextStatus = targetOrder.status;

    if (targetOrder.status === 'received') {
      nextStatus = 'in_progress';
      if (updatedTimeline[2]) {
        updatedTimeline[2].completed = true;
        updatedTimeline[2].timestamp = new Date().toISOString();
        updatedTimeline[2].description = `Active drafting. Client revision applied ("${text.substring(0, 30)}...").`;
      }
    } else if (targetOrder.status === 'review') {
      if (updatedTimeline[3]) {
        updatedTimeline[3].description = `Client requested revision adjustments: "${text}". Adjusting typography.`;
      }
    }

    const updatedOrder: Order = {
      ...targetOrder,
      status: nextStatus,
      timeline: updatedTimeline,
      revisionComments: [...((targetOrder as any).revisionComments || []), {
        text,
        timestamp: new Date().toISOString(),
        author: 'client'
      }] as any
    };

    // Save to Firestore real-time DB
    await updateFirestoreOrder(updatedOrder);
  };

  // Admin Dashboard modifications callback
  const handleAdminUpdateOrder = async (updatedOrder: Order) => {
    const previousOrder = orders.find(o => o.id === updatedOrder.id);
    const hasStatusChanged = previousOrder && (previousOrder.status !== updatedOrder.status);
    
    await updateFirestoreOrder(updatedOrder);

    if (hasStatusChanged) {
      if (updatedOrder.status === 'review') {
        import('./lib/emailAlert').then(({ sendClientWorkAlert }) => {
          sendClientWorkAlert(updatedOrder, 'review').catch(err => console.error("Client email review alert error: ", err));
        });
      } else if (updatedOrder.status === 'completed') {
        import('./lib/emailAlert').then(({ sendClientWorkAlert }) => {
          sendClientWorkAlert(updatedOrder, 'completed').catch(err => console.error("Client email completion alert error: ", err));
        });
      }
    }
  };

  // Handle interactive Email + Password Sign Up / Login submit
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg(null);
    if (!authEmail || !authPassword) {
      setAuthErrorMsg("Please enter both email and password.");
      return;
    }

    // If modal is for ADMIN purposes, prevent any non-admin email or registration
    if (authModalPurpose === 'admin') {
      if (!isPermittedAdminEmail(authEmail)) {
        setAuthErrorMsg("Access Denied: This portal is strictly restricted to Latep Hub administrators.");
        return;
      }
    }

    if (authPassword.length < 6) {
      setAuthErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setAuthProcessing(true);
    try {
      if (isSignUpMode) {
        await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      }
      setAuthEmail('');
      setAuthPassword('');
      setAuthErrorMsg(null);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Auth error:", error);
      let friendlyMsg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        friendlyMsg = "This email is already registered. Please sign in instead.";
      } else if (error.code === 'auth/wrong-password') {
        friendlyMsg = "Incorrect password. Please verify your typing.";
      } else if (error.code === 'auth/user-not-found') {
        friendlyMsg = "No account found with this email. You can register it!";
      } else if (error.code === 'auth/invalid-email') {
        friendlyMsg = "Please input a valid email address.";
      } else if (error.code === 'auth/operation-not-allowed') {
        friendlyMsg = "Email & Password accounts are currently disabled in your Firebase console. Please use Google Sign-In below (which is fully active!), or ask the Firebase project owner to enable 'Email/Password' in the Authentication settings.";
      }
      setAuthErrorMsg(friendlyMsg);
    } finally {
      setAuthProcessing(false);
    }
  };

  // Trigger Pop-up authentication actions
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar');
      const userCredential = await signInWithPopup(auth, provider);
      
      const credential = GoogleAuthProvider.credentialFromResult(userCredential);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
      }

      const email = userCredential.user?.email || '';

      if (authModalPurpose === 'admin' && !isPermittedAdminEmail(email)) {
        await signOut(auth);
        setGoogleAccessToken(null);
        setAuthErrorMsg(`Access Denied: The Google account (${email}) is not authorized as a Latep Hub Administrator. Only lapehub@gmail.com is permitted.`);
        return;
      }

      setIsAuthModalOpen(false);
    } catch (err) {
      console.error("Google Sign-In Error: ", err);
      setAuthErrorMsg("Tip: Google authentication requires opening the application in a new browser tab/window if you are currently viewing it inside an editor preview iframe. Click the 'Open in New Tab' button in the top right to complete sign-in!");
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar');
      const userCredential = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(userCredential);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        return credential.accessToken;
      }
      return null;
    } catch (err) {
      console.error("Google Calendar connection error: ", err);
      alert("Tip: Google authentication requires opening the application in a new browser tab if you are currently viewing inside an iframe. Click the 'Open in New Tab' button in the top-right and try again!");
      return null;
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setGoogleAccessToken(null);
    setActiveTab('home');
  };

  const handleAdminAccessClick = () => {
    if (isAdminUser) {
      setActiveTab('admin');
    } else {
      setAuthModalPurpose('admin');
      setIsSignUpMode(false); // Force Sign In mode for Admin
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-neutral-800 font-sans antialiased" id="main-app-container">
      
      {/* Universal Header navbar with real auth binds */}
      <Header 
        onNavigate={(tab) => {
          if (tab !== 'home' && tab !== 'admin' && !currentUser) {
            setAuthModalPurpose('standard');
            setIsAuthModalOpen(true);
            setAuthErrorMsg(`To access "${tab === 'services' ? 'Our Solutions & Catalog' : tab === 'order' ? 'Our Order Workspace' : 'Our Order Progress Tracker'}", you must kindly authorize your account with Google Sign-In.`);
            setActiveTab('home');
          } else {
            setActiveTab(tab);
          }
          if (tab !== 'track') setTrackingSearchId('');
        }} 
        activeTab={activeTab}
        onSearchTrack={handleSearchTrackId}
        currentUserEmail={currentUser?.email || null}
        isAdmin={isAdminUser}
        onSignIn={() => {
          setAuthModalPurpose('standard');
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        onAdminAccess={handleAdminAccessClick}
      />

      {/* Main viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Navigation tabs overlay rendering with framer motion animations */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* TAB SOURCE 0: BEAUTIFUL HOME PORTAL LANDING */}
            {activeTab === 'home' && (
              <motion.div
                key="home-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <LandingHome 
                  currentUserEmail={currentUser?.email || null} 
                  onSignIn={() => {
                    setAuthModalPurpose('standard');
                    setIsAuthModalOpen(true);
                  }}
                  onNavigate={(tab) => {
                    if (tab !== 'home' && !currentUser) {
                      setAuthModalPurpose('standard');
                      setIsAuthModalOpen(true);
                      setAuthErrorMsg("Access Restored: Please click sign-in below to enter your workspace.");
                    } else {
                      setActiveTab(tab);
                    }
                  }}
                />
              </motion.div>
            )}

            {/* TAB SOURCE 1: SOLUTIONS EXPLORER */}
            {activeTab === 'services' && currentUser && (
              <motion.div
                key="services-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <ServiceExplorer onSelectConfigure={handleSelectConfigure} />
              </motion.div>
            )}

            {/* TAB SOURCE 2: INTAKE ORDER WORKSTATION */}
            {activeTab === 'order' && currentUser && (
              <motion.div
                key="order-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <OrderForm 
                  initialAudience={formPreset.audience}
                  initialService={formPreset.service}
                  initialUnits={formPreset.units}
                  initialUrgency={formPreset.urgency}
                  onSubmitTriggerPayment={handleFormOrderSubmit}
                />
              </motion.div>
            )}

            {/* TAB SOURCE 3: INTERACTIVE MILESTONES PROGRESS TRACKER */}
            {activeTab === 'track' && currentUser && (
              <motion.div
                key="track-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <OrderTracker 
                  orders={orders}
                  searchedOrderId={trackingSearchId}
                  onClearSearch={clearTrackingSearch}
                  onAddRevision={handleAddRevisionComment}
                  googleAccessToken={googleAccessToken}
                  onConnectCalendar={handleConnectCalendar}
                />
              </motion.div>
            )}

            {/* TAB SOURCE 4: DISPATCHER AND CONTROL WORKSPACE (ADMIN MODE) */}
            {activeTab === 'admin' && isAdminUser && (
              <motion.div
                key="admin-pane"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <AdminDashboard 
                  orders={orders}
                  onUpdateOrder={handleAdminUpdateOrder}
                  currentUserEmail={currentUser?.email || 'lapehub@gmail.com (Review Sandbox)'}
                  onCloseAdmin={() => setActiveTab('home')}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Dynamic global statistics bar (Architectural Trust Parameters) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-neutral-150 shadow-sm text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono">1,420+</span>
            <p className="text-xs text-neutral-500 font-medium font-sans mt-0.5">Documents Typeset</p>
          </div>
          <div>
            <span className="text-xl sm:text-3xl font-black text-emerald-600 font-mono">100% SECURE</span>
            <p className="text-xs text-neutral-500 font-medium font-sans mt-0.5">Firestore Sandbox Active</p>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">SMTP LIVE</span>
            <p className="text-xs text-neutral-500 font-medium font-sans mt-0.5">Email Alerts Bound</p>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono">4.9/5★</span>
            <p className="text-xs text-neutral-500 font-medium font-sans mt-0.5">Direct Client Feedback</p>
          </div>
        </div>

        {/* Client Endorsement and Reviews Panel */}
        <Testimonials 
          testimonials={testimonials}
          onAddTestimonial={handleAddTestimonial}
        />

        {/* Informative Frequently Asked Questions (Premium Accordion Layout) */}
        <div className="space-y-4 max-w-3xl mx-auto" id="faq-accordions">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">Frequently Answered Queries</h3>
            <p className="text-xs text-neutral-500">Essential facts regarding licensing, compiling tools, and financial guarantees</p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                q: 'What specific deliverables do I receive in a LaTeX or presentation order?',
                a: 'For LaTeX documents, we deliver the production-grade PDF compilation alongside fully structured and annotated .TEX source code, package configurations, Letterhead settings, and modular BIBTeX archives. For presentations, you obtain fully-customized, easily editable PowerPoint (.PPTX) slides and vector assets folders.'
              },
              {
                q: 'How does the secure checkout work? Are there recurring fees?',
                a: 'We support Lipa na M-Pesa (Pochi la Biashara 0794592550) alongside secure card systems. Simply pay the exact amount, paste the confirmation M-Pesa SMS message or upload a receipt screenshot, and your order completes instantly. There are no monthly recurring variables or hidden fees.'
              },
              {
                q: 'Is this service compatible with rigorous academic integrity rules?',
                a: 'Absolutely. We formulate entirely original layouts, format parameters, and diagrams tailored specifically to your pre-existing draft research or brief. We do not engage in academic piracy, ghostwriting, or system cheating. All files comply with standard institutional guidelines.'
              },
              {
                q: 'How does the interactive collaboration revisions feature work?',
                a: 'Once your order reaches "Draft Review" or "In Progress", you can submit revisions directly inside your tracking board. Our experts are notified immediately, and you will see updates dynamically documented directly inside the milestone log!'
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-neutral-150 overflow-hidden text-sm transition-all shadow-sm">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 font-semibold text-neutral-800 flex items-center justify-between hover:bg-neutral-50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-250 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-neutral-600 text-xs font-light leading-relaxed border-t border-neutral-50 pt-2 bg-neutral-50/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Payment simulated modal */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalPrice={pendingOrderDetails?.totalPrice || 0}
        customerName={pendingOrderDetails?.customerName || ''}
        customerEmail={pendingOrderDetails?.customerEmail || ''}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* FOOTER */}
      <footer className="bg-neutral-950 text-white border-t border-neutral-800 mt-16 font-light text-xs" id="footer-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-800 pb-8 gap-4">
            <div>
              <span className="text-base font-extrabold font-sans uppercase tracking-tight">Latep<span className="text-emerald-400 font-extrabold"> Hub</span></span>
              <p className="text-neutral-400 mt-1">High-fidelity typesetting, layout standards, and custom design vectors.</p>
            </div>
            <div className="flex gap-2 text-[10px] text-neutral-400 font-mono">
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded">M-PESA & CARD PAY</span>
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded">LATEX PUBLICATION STD</span>
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded">AES 256 ENCRYPTED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-neutral-500 text-[11px] gap-2 font-mono">
            <span>© 2026 Latep Hub professional digital presentation design corp. All rights reserved globally.</span>
            <div className="flex gap-4 items-center animate-fade-in">
              <a href="#terms" className="hover:text-white transition-colors">Integrity Standards</a>
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Clause</a>
              <a href="#sla" className="hover:text-white transition-colors">SLA Specifications</a>
              <span className="text-neutral-800">|</span>
              <button 
                onClick={handleAdminAccessClick}
                className="hover:text-emerald-400 text-neutral-600 transition-colors cursor-pointer flex items-center gap-1 hover:underline"
                id="footer-admin-link"
              >
                <Lock className="h-3 w-3" />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION POPUP BOX */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-200 shadow-xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-neutral-150 pb-3">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-emerald-600 animate-pulse" />
                  <h3 className="font-extrabold text-neutral-950 text-base font-sans uppercase tracking-tight">
                    {authModalPurpose === 'admin' ? 'Latep Hub Admin Space' : 'Latep Hub Standard Space'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setAuthErrorMsg(null);
                  }}
                  className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {authModalPurpose === 'admin' ? (
                <div className="bg-amber-50/70 text-amber-800 p-3.5 rounded-2xl text-xs font-sans border border-amber-200/65 leading-relaxed text-center space-y-1">
                  <div className="font-extrabold flex items-center justify-center gap-1.5 text-[13px] text-amber-900">
                    <span>🔐 Restricted Admin Access</span>
                  </div>
                  <p className="text-[11px] font-sans leading-normal text-amber-700">
                    The Latep Hub Administrator Dashboard is restricted to authorized personnel. Only sign-in with <strong>lapehub@gmail.com</strong> is permitted. All other clients or registrations are strictly blocked.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl text-xs font-sans border border-emerald-150 leading-relaxed text-center space-y-1">
                  <div className="font-extrabold text-[13px] text-emerald-950 flex items-center justify-center gap-1">
                    <span>✨ Google Sign-In Only</span>
                  </div>
                  <p className="text-[11px] leading-normal text-emerald-700">
                    We use Google Sign-In for a password-less, secure login experience. Sign in instantly to place typesetting requests, upload documents, and track orders in real-time.
                  </p>
                </div>
              )}

              {/* Error / Alert notification Box */}
              {authErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-1 font-mono">
                  <strong>Access Message:</strong>
                  <p className="leading-relaxed">{authErrorMsg}</p>
                </div>
              )}

              {/* Action Trigger Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-neutral-950 hover:bg-neutral-905 border border-neutral-800 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all text-white text-xs shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99] font-mono uppercase tracking-wider"
                >
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span>Continue with Google</span>
                </button>

                {authModalPurpose !== 'admin' && (
                  <div className="space-y-2 pt-2">
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-neutral-200"></div>
                      <span className="flex-shrink mx-2 text-[8px] text-neutral-400 uppercase font-mono font-bold">Sandbox Evaluation</span>
                      <div className="flex-grow border-t border-neutral-200"></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUser({ email: 'client.demo@example.com' });
                        setIsAuthModalOpen(false);
                        setActiveTab('services');
                      }}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 font-bold uppercase text-[9px] tracking-wider py-2 rounded-xl text-neutral-700 flex items-center justify-center gap-1 transition-all cursor-pointer border border-neutral-200"
                    >
                      <Users className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Sandbox Demo client (Eval bypass)</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
