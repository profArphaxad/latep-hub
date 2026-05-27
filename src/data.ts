import { ServiceDetail, Order, AudienceType, ServiceType } from './types';

export const AUDIENCES = {
  student: {
    id: 'student' as AudienceType,
    title: 'Student Services',
    subtitle: 'Academic success powered by precise typesetting and world-class presentation designs',
    badge: 'Standard Pricing',
    accentColor: 'indigo',
  },
  school: {
    id: 'school' as AudienceType,
    title: 'Schools & Educators',
    subtitle: 'Institutional grade custom educational projects, curricula formatting, and design frameworks',
    badge: 'Volume Discounts',
    accentColor: 'emerald',
  },
  corporate: {
    id: 'corporate' as AudienceType,
    title: 'Corporate & Job Market',
    subtitle: 'High-conversion business decks, bespoke LaTeX templates, executive briefings, and advanced project designs',
    badge: 'Enterprise Service Level Agreement Available',
    accentColor: 'amber',
  },
};

export const SERVICES: Record<AudienceType, Record<ServiceType, ServiceDetail>> = {
  student: {
    latex: {
      id: 'student-latex',
      title: 'Academic LaTeX Formatting',
      shortDesc: 'Perfect typesetting of theses, research papers, and CVs using university-approved templates.',
      longDesc: 'Ensure your dissertation, IEEE/ACM paper, or mathematical thesis complies with all typographic standards. We handle BibTeX bibliographies, complex mathematical formulations, figures layout, and code listings with pixel precision.',
      basePrice: 0,
      unitName: 'pages',
      pricePerUnit: 20,
      features: [
        'University template adaptation',
        'Advanced BibTeX cataloging',
        'Complex formula rendering',
        'Infinite revision on layout corrections',
        'Compilation in pdfLaTeX or XeLaTeX'
      ],
      deliverables: ['Production ready .PDF Document', 'Fully commented .TEX source files', 'Compiled .BIB style references'],
      estimatedDays: 4,
    },
    ppt: {
      id: 'student-ppt',
      title: 'Thesis Defense Decks',
      shortDesc: 'Clean, elegant presentations structured in academic logic for dissertation defenses.',
      longDesc: 'Impress the defense board. Your slide deck will guide listeners smoothly through your methodology, results, and conclusions without cognitive overload. Designed around structured cognitive spacing rather than generic templates.',
      basePrice: 0,
      unitName: 'slides',
      pricePerUnit: 20,
      features: [
        'Custom academic infographics',
        'Responsive layout for projector or screen',
        'Mathematical slide typesetting',
        'Detailed speaker notes guidance'
      ],
      deliverables: ['Editable PowerPoint deck (.PPTX)', 'Universal presentation PDF', 'Sourced vector graphics'],
      estimatedDays: 3,
    },
    word: {
      id: 'student-word',
      title: 'Academic Word Documents Design',
      shortDesc: 'Professional formatting of Word drafts, homework templates, and reports.',
      longDesc: 'Beautiful, clean layout designing for Word documents. We format student essays, research assignments, lab reports, and term papers into highly polished designs with clean table of contents, professional headers, and page borders.',
      basePrice: 0,
      unitName: 'pages',
      pricePerUnit: 15,
      features: [
        'Clean margins & line spacing customization',
        'Professional table of contents auto-generation',
        'Citation & bibliography style formatting',
        'Custom covers and style branding'
      ],
      deliverables: ['Fully editable Microsoft Word document (.DOCX)', 'Formatted print-ready PDF version'],
      estimatedDays: 3,
    },
  },
  school: {
    latex: {
      id: 'school-latex',
      title: 'Custom Form & Exam Templates',
      shortDesc: 'Clean, beautiful layouts for exams, syllabi, worksheets, and institutional forms.',
      longDesc: 'Standardize testing and institutional documents across classrooms. We build highly reusable LaTeX document frameworks, multi-option question sheets, automated grid calculators, and unified letterheads for administrative offices.',
      basePrice: 0,
      unitName: 'templates',
      pricePerUnit: 20,
      features: [
        'Institutional letterhead integration',
        'Configurable answer-key toggle macros',
        'Dynamic exam point grids',
        'Cross-referencing and section layouts'
      ],
      deliverables: ['Reusable production LaTeX class files (.cls)', 'Ready-to-edit template document examples', 'Compilation tutorial'],
      estimatedDays: 5,
    },
    ppt: {
      id: 'school-ppt',
      title: 'Curriculum & Lecture Master Slides',
      shortDesc: 'A cohesive visual framework with interactive slides for school-wide teaching.',
      longDesc: 'Equip your faculty with customizable, beautifully designed slides that keep classes focused. Built with pedagogical hierarchy, highly legible typography, customized diagrams, and school color branding.',
      basePrice: 0,
      unitName: 'master slides',
      pricePerUnit: 20,
      features: [
        'School-wide color theme master files',
        '10+ customizable teaching layouts',
        'Vector icon libraries for education',
        'Interactive diagram frameworks'
      ],
      deliverables: ['School Master Theme File (.OTIME / .POTX)', 'Example Curriculum Deck', 'Custom educational vectors'],
      estimatedDays: 6,
    },
    word: {
      id: 'school-word',
      title: 'School Syllabi & Curriculum Word Docs',
      shortDesc: 'Designing standard curricula templates and educational worksheets in Microsoft Word.',
      longDesc: 'Standardize class materials and institutional lesson plans. We create beautifully structured lesson templates, exam printouts, course manuals, and departmental newsletters with clear readable typographic hierarchy.',
      basePrice: 0,
      unitName: 'documents',
      pricePerUnit: 40,
      features: [
        'Reusable school-branded page styling',
        'Interactive form fields & check-boxes ready',
        'Perfect integration of vector graphs & tables',
        'Includes font selections and brand colors'
      ],
      deliverables: ['Master Word template file (.DOTX)', 'Editable Syllabus DOCX models'],
      estimatedDays: 4,
    },
  },
  corporate: {
    latex: {
      id: 'corporate-latex',
      title: 'Corporate TeX Standards & Reports',
      shortDesc: 'Polished whitepapers, annual reports, proposals, and resume systems.',
      longDesc: 'Ditch Word for critical corporate documentation. Perfect for cybersecurity profiles, high-stakes investor proposals, detailed analytical whitepapers, and beautiful job market executive resume structures with unmatched type hierarchy.',
      basePrice: 0,
      unitName: 'pages',
      pricePerUnit: 20,
      features: [
        'Strict corporate brand-book alignment',
        'SVG charts and vector layout design',
        'Automated document table generators',
        'PDF/A compliance archiving exports'
      ],
      deliverables: ['Corporate publication PDF', 'Production typesetting sources', 'Automated compiling script'],
      estimatedDays: 5,
    },
    ppt: {
      id: 'corporate-ppt',
      title: 'High-Stakes Investor Pitch Decks',
      shortDesc: 'Visual storytelling masterdecks that secure approvals and close deals.',
      longDesc: 'Premium slide presentations customized for boards, strategic clients, or investment rounds. We convert complex financial models and data metrics into memorable, crystal-clear slides styled around a modern minimalist Swiss aesthetic.',
      basePrice: 0,
      unitName: 'strategic slides',
      pricePerUnit: 20,
      features: [
        'Bespoke visual theme & slide templates',
        'Stunning custom financial visualizers',
        'High-resolution custom vector assets',
        'Presentation delivery strategy guide'
      ],
      deliverables: ['Premium Presentation Deck (.PPTX)', 'High-resolution PDF distribution file', 'Sourced diagram component folder'],
      estimatedDays: 4,
    },
    word: {
      id: 'corporate-word',
      title: 'Professional Corporate Briefs & Whitepapers',
      shortDesc: 'Converting legacy Word drafts into elegant corporate manuals, profiles, and reports.',
      longDesc: 'Transform boring corporate documentation. We style executive briefs, company policy handouts, investor update documents, and professional whitepapers according to your corporate branding rules. Dynamic table layout, clean color palette selection, and strict font control.',
      basePrice: 0,
      unitName: 'pages',
      pricePerUnit: 25,
      features: [
        'Strict corporate brand-book layout customizer',
        'Modern, eye-friendly layout grid setups',
        'Advanced table styling & numeric layouts',
        'Dynamic cross-referencing links configuration'
      ],
      deliverables: ['Standard branding DOCX file template', 'Polished executive PDF handout'],
      estimatedDays: 4,
    },
  },
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'TRACK-LATE-1092',
    audience: 'student',
    serviceType: 'latex',
    title: 'Masters Thesis Typesetting',
    description: 'Formatting 42 pages of Masters Thesis in Computer Science. Includes 12 algorithmic blocks, 15 mathematical theorems, and sorting references using IEEE style.',
    pageCount: 42,
    urgency: 'standard',
    totalPrice: 1050,
    status: 'completed',
    createdAt: '2026-05-18T10:15:00Z',
    deliveryDate: '2026-05-22T17:00:00Z',
    customerName: 'Simon',
    customerEmail: 'simon@jkuat.ac.ke',
    attachments: [
      { name: 'draft_thesis_v2.docx', size: '2.4 MB', type: 'docx' },
      { name: 'math_appendix.pdf', size: '350 KB', type: 'pdf' }
    ],
    timeline: [
      { status: 'pending_payment', title: 'Order Submitted', description: 'User submitted files and chosen configurations.', timestamp: '2026-05-18T10:15:00Z', completed: true },
      { status: 'received', title: 'Payment Secured', description: 'M-Pesa / Card transaction verified successfully. Project assigned to typesetting lead.', timestamp: '2026-05-18T10:22:00Z', completed: true },
      { status: 'in_progress', title: 'LaTeX Layout Drafting', description: 'Mathematical formulas imported, bibliography styles unified, figures loaded.', timestamp: '2026-05-20T14:30:00Z', completed: true },
      { status: 'review', title: 'Client Proofing Draft', description: 'PDF review document sent to student for layout confirmation.', timestamp: '2026-05-21T11:00:00Z', completed: true },
      { status: 'completed', title: 'Final Compilation Delivered', description: 'Deliverables fully compiled and uploaded. ZIP folder contains clean source codes.', timestamp: '2026-05-22T16:45:00Z', completed: true }
    ],
    deliverableLinks: [
      { label: 'Compiled Final Thesis PDF', url: '#download-thesis-pdf', icon: 'FileText' },
      { label: 'LaTeX Project Archive (.ZIP)', url: '#download-latex-zip', icon: 'FileArchive' }
    ]
  },
  {
    id: 'TRACK-PPTS-4091',
    audience: 'corporate',
    serviceType: 'ppt',
    title: 'Operations & Performance Slide deck formatting',
    description: 'Transforming custom outline drafts into high-impact visual corporate slides for internal operations report. 15 core strategic slides, containing metrics, unit economics, and custom timeline charts.',
    pageCount: 15,
    urgency: 'express',
    totalPrice: 608,
    status: 'review',
    createdAt: '2026-02-12T08:30:00Z',
    deliveryDate: '2026-02-15T12:00:00Z',
    customerName: 'Jelioth',
    customerEmail: 'jelioth.wacatha@wacathaops.com',
    attachments: [
      { name: 'draft_ops_outline.pptx', size: '8.1 MB', type: 'pptx' },
      { name: 'brand_corporate_guidelines.pdf', size: '4.2 MB', type: 'pdf' }
    ],
    timeline: [
      { status: 'pending_payment', title: 'Order Submitted', description: 'Corporate outline files uploaded.', timestamp: '2026-02-12T08:30:00Z', completed: true },
      { status: 'received', title: 'Order Confirmed', description: 'Enterprise Service Level Agreement locked in. Corporate lead designer assigned.', timestamp: '2026-02-12T09:00:00Z', completed: true },
      { status: 'in_progress', title: 'Bespoke Visual Framing', description: 'Theme customized to corporate identity. Infographics and custom tables being generated.', timestamp: '2026-02-13T15:40:00Z', completed: true },
      { status: 'review', title: 'Active Review Iteration', description: 'Draft uploaded. Ready for client review and comments.', timestamp: '2026-02-14T14:10:00Z', completed: true },
      { status: 'completed', title: 'Premium PPTX Delivery', description: 'Final editable slide master and optimized display models delivery.', timestamp: '2026-02-15T12:00:00Z', completed: false }
    ],
    deliverableLinks: [
      { label: 'Review Presentation Slide Proof (PDF)', url: '#download-review-pdf', icon: 'Eye' }
    ]
  }
];

export const MOCK_TESTIMONIALS = [
  {
    id: 'TEST-004',
    name: 'Simon',
    company: 'Student, Jomo Kenyatta University',
    rating: 5,
    review: 'Peak Minds Hub delivered an incredible PowerPoint presentation on my academic research project. The custom slide layout, design methodology, and perfect readability helped me clear my dissertation defense committee without any pushback!',
    createdAt: '2026-04-12T11:00:00Z',
    isVerified: true
  },
  {
    id: 'TEST-005',
    name: 'Jelioth',
    company: 'Operations Manager',
    rating: 5,
    review: 'I commissioned a PowerPoint presentation document for my work report on operations and the financial reports for the year 2025/2026. Peak Minds Hub executed the designs with flawless typesetting, precise data charts, and neat corporate layout grids. Extremely professional service!',
    createdAt: '2026-02-15T14:20:00Z',
    isVerified: true
  }
];

