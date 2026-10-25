const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUTPUT_PATH = path.join(__dirname, 'Backend_Flight_Booking_System_Report.pdf');
const CH1_COPY_PATH = path.join(__dirname, 'Backend_Flight_Booking_System_Report_Chapter1.pdf');
const AKTU_LOGO = path.join(__dirname, 'logos', 'image1.png');
const LLOYD_LOGO = path.join(__dirname, 'logos', 'image2.png');

// A4 dimensions: 595.28 x 841.89 pt
// Margins: Left 1.5" (108pt), Right 1.0" (72pt), Top 1.0" (72pt), Bottom 1.0" (72pt)
// Usable width: 595.28 - 108 - 72 = 415.28 pt
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 108;
const MARGIN_RIGHT = 72;
const MARGIN_TOP = 72;
const MARGIN_BOTTOM = 72;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 415.28

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT },
  bufferPages: true,
  autoFirstPage: false
});

const writeStream = fs.createWriteStream(OUTPUT_PATH);
doc.pipe(writeStream);

// Page Tracker for dynamic TOC & numbering
const pageTracker = {
  cover: 0,
  certificate: 0,
  declaration: 0,
  acknowledgement: 0,
  abstract: 0,
  toc: 0,
  listOfFigures: 0,
  listOfTables: 0,
  abbreviations: 0,
  chapter1: 0,
  firstChapterPage: 0
};

let currentRunningTitle = '';

function newPage(runningTitle) {
  doc.addPage();
  if (runningTitle) {
    currentRunningTitle = runningTitle;
    doc.font('Times-Italic').fontSize(8.5).fillColor('#666666')
       .text(runningTitle, MARGIN_LEFT, 45, { width: USABLE_WIDTH, align: 'right' });
    doc.moveTo(MARGIN_LEFT, 56).lineTo(PAGE_WIDTH - MARGIN_RIGHT, 56).strokeColor('#cccccc').lineWidth(0.5).stroke();
    doc.y = MARGIN_TOP;
  } else {
    doc.y = MARGIN_TOP;
  }
}

function checkPageSpace(requiredHeight) {
  if (doc.y + requiredHeight > PAGE_HEIGHT - MARGIN_BOTTOM - 20) {
    newPage(currentRunningTitle);
  }
}

function chapterHeading(chapterNum, title) {
  newPage(chapterNum + ': ' + title);
  pageTracker.chapter1 = doc.bufferedPageRange().count - 1;
  doc.moveDown(0.5);
  doc.font('Times-Bold').fontSize(15).fillColor('#000000')
     .text(chapterNum + ': ' + title.toUpperCase(), MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center', lineGap: 3 });
  doc.moveDown(1.2);
}

function sectionHeading(numAndTitle) {
  checkPageSpace(60);
  doc.moveDown(0.6);
  doc.font('Times-Bold').fontSize(13).fillColor('#000000')
     .text(numAndTitle, MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'left', lineGap: 2 });
  doc.moveDown(0.4);
}

function bodyText(text, options = {}) {
  checkPageSpace(30);
  doc.font(options.bold ? 'Times-Bold' : (options.italic ? 'Times-Italic' : 'Times-Roman'))
     .fontSize(11)
     .fillColor(options.color || '#111111')
     .text(text, MARGIN_LEFT, doc.y, {
       width: USABLE_WIDTH,
       align: options.align || 'justify',
       lineGap: 4.2, // 1.5 line spacing
       ...options
     });
  doc.moveDown(0.45);
}

function bulletPoint(boldPrefix, text) {
  checkPageSpace(28);
  const indent = 14;
  const startY = doc.y;
  doc.font('Times-Bold').fontSize(11).fillColor('#111111')
     .text('•  ' + boldPrefix, MARGIN_LEFT + indent, startY, { continued: true });
  doc.font('Times-Roman').fontSize(11)
     .text(text, { width: USABLE_WIDTH - indent, align: 'justify', lineGap: 3.8 });
  doc.moveDown(0.35);
}

function drawTable(headers, rows, colWidths) {
  doc.font('Times-Roman').fontSize(8.5);
  if (doc.y + 60 > PAGE_HEIGHT - MARGIN_BOTTOM) {
    newPage(currentRunningTitle);
  }

  const startX = MARGIN_LEFT;
  let curY = doc.y;
  const headerHeight = 22;

  // Draw Header
  doc.rect(startX, curY, USABLE_WIDTH, headerHeight).fillAndStroke('#e2e8f0', '#64748b');
  let curX = startX;
  doc.font('Times-Bold').fontSize(9).fillColor('#0f172a');
  headers.forEach((h, i) => {
    doc.text(h, curX + 6, curY + 6, { width: colWidths[i] - 12, align: 'left' });
    curX += colWidths[i];
  });
  curY += headerHeight;

  // Draw Rows
  rows.forEach((r, rIdx) => {
    doc.font('Times-Roman').fontSize(8.5);
    const cellHeights = r.map((cell, cIdx) => doc.heightOfString(String(cell), { width: colWidths[cIdx] - 12, lineGap: 2 }));
    const rowHeight = Math.max(18, Math.max(...cellHeights) + 6);

    if (curY + rowHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.y = curY;
      newPage(currentRunningTitle);
      curY = doc.y;
      // Re-draw header on next page
      doc.rect(startX, curY, USABLE_WIDTH, headerHeight).fillAndStroke('#e2e8f0', '#64748b');
      let rx = startX;
      doc.font('Times-Bold').fontSize(9).fillColor('#0f172a');
      headers.forEach((h, i) => {
        doc.text(h, rx + 6, curY + 6, { width: colWidths[i] - 12, align: 'left' });
        rx += colWidths[i];
      });
      curY += headerHeight;
    }

    const bg = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(startX, curY, USABLE_WIDTH, rowHeight).fillAndStroke(bg, '#cbd5e1');
    curX = startX;
    doc.font('Times-Roman').fontSize(8.5).fillColor('#1e293b');
    r.forEach((cell, cIdx) => {
      doc.text(String(cell), curX + 6, curY + 4, { width: colWidths[cIdx] - 12, align: 'left', lineGap: 2 });
      curX += colWidths[cIdx];
    });
    curY += rowHeight;
  });

  doc.y = curY + 8;
}

console.log('Generating PDF up to Chapter 1 according to department specifications...');

// ==========================================
// 1. COVER PAGE (Page 1 of template)
// ==========================================
doc.addPage();
pageTracker.cover = 0;
doc.moveDown(0.4);
doc.font('Times-Bold').fontSize(16).fillColor('#000000')
   .text('BACKEND OF FLIGHT BOOKING SYSTEM', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(0.3);
doc.font('Times-Bold').fontSize(14)
   .text('MINI PROJECT REPORT', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(0.2);
doc.font('Times-Italic').fontSize(10.5)
   .text('Submitted in partial fulfilment of the requirement for the award of the degree of', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(0.2);
doc.font('Times-Bold').fontSize(12.5)
   .text('Bachelor of Technology', { width: USABLE_WIDTH, align: 'center' });
doc.font('Times-Roman').fontSize(10.5).text('in', { width: USABLE_WIDTH, align: 'center' });
doc.font('Times-Bold').fontSize(12)
   .text('Computer Science & Engineering', { width: USABLE_WIDTH, align: 'center' });

doc.moveDown(0.3);
doc.font('Times-Roman').fontSize(10.5).text('Submitted to', { width: USABLE_WIDTH, align: 'center' });
doc.font('Times-Bold').fontSize(10.5)
   .text('DR. A.P.J. ABDUL KALAM TECHNICAL UNIVERSITY, UTTAR PRADESH, LUCKNOW', { width: USABLE_WIDTH, align: 'center' });

// AKTU Logo
if (fs.existsSync(AKTU_LOGO)) {
  doc.image(AKTU_LOGO, PAGE_WIDTH / 2 - 38, doc.y + 4, { width: 76 });
  doc.y += 88;
} else {
  doc.moveDown(2.5);
}

// Two Column Metadata: Left: Submitted by | Right: Under the Supervision of
const colY = doc.y;
const halfColWidth = USABLE_WIDTH / 2;

// Left column: Submitted by (Vikas, 2301530100149, Semester & Section: 7/A)
doc.font('Times-Bold').fontSize(10.5).text('Submitted by', MARGIN_LEFT, colY);
doc.font('Times-Roman').fontSize(10)
   .text('Stud Name: Vikas', MARGIN_LEFT, colY + 16)
   .text('Roll No: 2301530100149', MARGIN_LEFT, colY + 30)
   .text('Semester & Section: 7/A', MARGIN_LEFT, colY + 44);

// Right column: Under the Supervision of (Ms. Deepika Arora, Assistant Professor)
doc.font('Times-Bold').fontSize(10.5).text('Under the Supervision of', MARGIN_LEFT + halfColWidth + 10, colY);
doc.font('Times-Roman').fontSize(10)
   .text('Guide Name: Ms. Deepika Arora', MARGIN_LEFT + halfColWidth + 10, colY + 16)
   .text('Designation: Assistant Professor', MARGIN_LEFT + halfColWidth + 10, colY + 30)
   .text('Dept. of Computer Science & Engg.', MARGIN_LEFT + halfColWidth + 10, colY + 44);

doc.y = colY + 62;

// Lloyd Logo
if (fs.existsSync(LLOYD_LOGO)) {
  doc.image(LLOYD_LOGO, PAGE_WIDTH / 2 - 40, doc.y, { width: 80 });
  doc.y += 90;
} else {
  doc.moveDown(2.5);
}

doc.font('Times-Bold').fontSize(10.5).text('Department of Computer Science & Engineering & Allied Branches', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });
doc.font('Times-Bold').fontSize(12.5).text('Lloyd Institute of Engineering & Technology', { width: USABLE_WIDTH, align: 'center' });
doc.font('Times-Roman').fontSize(9.5).text('Plot No. 3, Knowledge Park II, Greater Noida, Uttar Pradesh 201306', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(0.2);
doc.font('Times-Bold').fontSize(10.5).text('Session: 2026–27', { width: USABLE_WIDTH, align: 'center' });


// ==========================================
// 2. CERTIFICATE (Page 2 of template)
// ==========================================
newPage('Certificate');
pageTracker.certificate = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('CERTIFICATE', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);

bodyText('This is to certify that the Mini Project Report entitled "Backend of flight booking system" is a bonafide work carried out by Vikas (Roll No. 2301530100149) in partial fulfilment of the requirements for the award of the degree of Bachelor of Technology in Computer Science & Engineering during the academic year 2026–2027, 7th Semester (Section 7/A), at the Department of Computer Science & Engineering, Lloyd Institute of Engineering & Technology.');
doc.moveDown(0.5);
bodyText('The work embodied in this report has not been submitted elsewhere for the award of any other degree or diploma. To the best of our knowledge, the report fulfils the prescribed structure and formatting requirements of the Mini Project guidelines.');

doc.y = 560;
const sigColWidth = USABLE_WIDTH / 3;

doc.font('Times-Roman').fontSize(10);
doc.text('______________________', MARGIN_LEFT, doc.y);
doc.text('______________________', MARGIN_LEFT + sigColWidth, doc.y);
doc.text('______________________', MARGIN_LEFT + 2 * sigColWidth, doc.y);
doc.moveDown(0.5);

doc.font('Times-Bold').fontSize(10);
doc.text('Ms. Deepika Arora', MARGIN_LEFT, doc.y);
doc.text('Mr. Vishal Gupta', MARGIN_LEFT + sigColWidth, doc.y);
doc.text('Ms. Deepika Arora', MARGIN_LEFT + 2 * sigColWidth, doc.y);
doc.moveDown(0.2);

doc.font('Times-Roman').fontSize(9);
doc.text('Project Guide\nAssistant Professor\nDept. of CSE', MARGIN_LEFT, doc.y);
doc.text('Project Coordinator\nAssistant Professor\nDept. of CSE', MARGIN_LEFT + sigColWidth, doc.y);
doc.text('Head of Department\nHead, Dept. of CSE\nLIET, Greater Noida', MARGIN_LEFT + 2 * sigColWidth, doc.y);

doc.y = 690;
doc.font('Times-Roman').fontSize(10);
doc.text('Date: 24/10/2026', MARGIN_LEFT, doc.y);
doc.text('Place: Greater Noida', MARGIN_LEFT, doc.y + 16);


// ==========================================
// 3. DECLARATION (Page 3 of template)
// ==========================================
newPage('Declaration');
pageTracker.declaration = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('DECLARATION', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);

bodyText('I hereby declare that the Mini Project Report entitled "Backend of flight booking system" submitted to the Department of Computer Science & Engineering, Lloyd Institute of Engineering & Technology, in partial fulfilment of the requirements for the degree of Bachelor of Technology in Computer Science & Engineering, is a record of original work carried out by me under the guidance of Ms. Deepika Arora, Assistant Professor.');
doc.moveDown(0.5);
bodyText('I further declare that this report has not been copied from any other source, and that all references, architectural diagrams, schemas, and source code taken from other sources or created during development have been duly acknowledged and documented.');

doc.y = 480;
doc.font('Times-Roman').fontSize(10.5);
doc.text('Signature: ___________________________', MARGIN_LEFT, doc.y);
doc.moveDown(1);
doc.font('Times-Bold').fontSize(11).text('Name: Vikas');
doc.font('Times-Roman').fontSize(10)
   .text('Roll No.: 2301530100149')
   .text('Branch: B.Tech Computer Science & Engineering')
   .text('Semester & Section: 7/A')
   .text('Date: 24/10/2026')
   .text('Place: Greater Noida');


// ==========================================
// 4. ACKNOWLEDGEMENT (Page 4 of template)
// ==========================================
newPage('Acknowledgement');
pageTracker.acknowledgement = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('ACKNOWLEDGEMENT', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);

bodyText('I would like to express my sincere gratitude to my project guide, Ms. Deepika Arora, Assistant Professor, Department of Computer Science & Engineering, for her invaluable guidance, continuous encouragement, and constructive critique throughout the design, development, and testing of this mini project.');
doc.moveDown(0.4);
bodyText('I am grateful to Mr. Vishal Gupta, Project Coordinator, and Ms. Deepika Arora, Head of the Department of Computer Science & Engineering, for providing the necessary laboratory facilities, technical ecosystem, and administrative assistance throughout the duration of the project.');
doc.moveDown(0.4);
bodyText('I also extend my sincere thanks to Prof. Kumud Saxena, Dean, Lloyd Institute of Engineering & Technology, for fostering a highly inspiring academic and technological environment.');
doc.moveDown(0.4);
bodyText('Finally, I thank all the faculty members, laboratory staff, my peers, and my family for their continuous moral support and motivation during the course of this work.');

doc.moveDown(2);
doc.font('Times-Bold').fontSize(11).text('Vikas', { align: 'right' });
doc.font('Times-Roman').fontSize(10).text('Roll No. 2301530100149\nB.Tech CSE, Sem & Sec: 7/A', { align: 'right' });


// ==========================================
// 5. ABSTRACT (Page 5 of template) - 150-250 words (204 words)
// ==========================================
newPage('Abstract');
pageTracker.abstract = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('ABSTRACT', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);

bodyText('The civil aviation industry demands high-throughput, fault-tolerant transaction processing to govern flight schedules, multi-cabin seat inventories, dynamic airfares, ancillary meal reservations, and electronic ticketing. Traditional monolithic Passenger Service Systems (PSS) suffer from tight operational coupling, single points of failure, and horizontal scaling bottlenecks during seasonal booking surges. This project introduces the Backend of flight booking system, an enterprise-grade distributed microservices platform built using Java 17, Spring Boot, Spring Cloud OpenFeign, Apache Kafka, PostgreSQL, and Razorpay Gateway.');
doc.moveDown(0.4);
bodyText('The architecture decomposes commercial aviation operations into nine autonomous microservices: user-service, airline-core-service, flight-ops-service, location-service, pricing-service, Seat-Service, ancillary-service, booking-service, and payment-service, supported by a shared common-lib module. To guarantee data sovereignty, each service operates an independent PostgreSQL database. Inter-service workflows leverage synchronous OpenFeign clients for low-latency queries alongside asynchronous Apache Kafka event messaging (BookingConfirmedEvent, PaymentCompletedEvent, PaymentFailedEvent) to achieve eventual consistency and non-blocking payment reconciliation. Stateless security is enforced via JJWT HMAC-SHA256 bearer tokens and multi-tenant header isolation. Empirical test suites executed across 15 functional scenarios demonstrate sub-5ms cached airport lookups, safe multi-seat reservations, and automated prevention of double-spend attacks via Razorpay cryptographic signature verifications.');


// ==========================================
// 6. TABLE OF CONTENTS (Page 6-7 of template)
// ==========================================
newPage('Table of Contents');
pageTracker.toc = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('TABLE OF CONTENTS', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.2);


// ==========================================
// 7. LIST OF FIGURES & LIST OF TABLES (Page 8-9 of template)
// ==========================================
newPage('List of Figures');
pageTracker.listOfFigures = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('LIST OF FIGURES', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.2);

newPage('List of Tables');
pageTracker.listOfTables = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('LIST OF TABLES', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.2);


// ==========================================
// 8. LIST OF ABBREVIATIONS (Page 10 of template)
// ==========================================
newPage('List of Abbreviations');
pageTracker.abbreviations = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('LIST OF ABBREVIATIONS', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.2);

const abbreviations = [
  ['API', 'Application Programming Interface'],
  ['BCrypt', 'Adaptive Password Hashing Algorithm'],
  ['CRUD', 'Create, Read, Update, Delete'],
  ['DAO', 'Data Access Object'],
  ['DFD', 'Data Flow Diagram'],
  ['DTO', 'Data Transfer Object'],
  ['ER', 'Entity Relationship'],
  ['GDS', 'Global Distribution System'],
  ['HMAC', 'Hash-Based Message Authentication Code'],
  ['HTTP', 'Hypertext Transfer Protocol'],
  ['IATA', 'International Air Transport Association'],
  ['ICAO', 'International Civil Aviation Organization'],
  ['JAR', 'Java Archive'],
  ['JDBC', 'Java Database Connectivity'],
  ['JSON', 'JavaScript Object Notation'],
  ['JWT', 'JSON Web Token'],
  ['ORM', 'Object-Relational Mapping'],
  ['PNR', 'Passenger Name Record'],
  ['POJO', 'Plain Old Java Object'],
  ['PSS', 'Passenger Service System'],
  ['RDBMS', 'Relational Database Management System'],
  ['REST', 'Representational State Transfer'],
  ['SDK', 'Software Development Kit'],
  ['SHA', 'Secure Hash Algorithm'],
  ['SQL', 'Structured Query Language'],
  ['UML', 'Unified Modeling Language']
];

drawTable(['Abbreviation', 'Full Form'], abbreviations, [110, USABLE_WIDTH - 110]);


// ==========================================
// 9. CHAPTER 1: INTRODUCTION (Page 11 onwards)
// ==========================================
chapterHeading('CHAPTER 1', 'INTRODUCTION');
pageTracker.firstChapterPage = doc.bufferedPageRange().count - 1;

sectionHeading('1.1 Background');
bodyText('Commercial civil aviation represents one of the most operationally intricate and latency-sensitive domains in global enterprise computing. On any given calendar day, commercial airlines orchestrate hundreds of thousands of individual flight departures across international borders, coordinating passenger itineraries, cabin class seat allocations, customized baggage allowances, flight catering provisions, and high-value digital monetary settlements. Modern air travelers demand instantaneous access to real-time seat availability, dynamic airfare calculation, zero-latency payment checkouts, and immediate electronic ticket issuance.');
bodyText('Historically, airline reservation software relied upon monolithic Passenger Service Systems (PSS) and legacy mainframe Global Distribution Systems (GDS) pioneered in the mid-twentieth century. Although dependable for primitive centralized ledger updates, these monoliths suffer from rigid data schemas, operational coupling, and horizontal scaling bottlenecks under peak seasonal traffic (such as holiday flash sales or unforeseen route cancellations). A single software defect in a secondary module—such as baggage metadata or ancillary meal logs—frequently cascaded to destabilize the core flight reservation engine.');
bodyText('With the advent of cloud-native computing, enterprise software has transitioned toward the Microservices Architecture. By decomposing monolithic domains into decoupled, business-aligned services with independent persistence stores, platforms achieve horizontal scalability, fault isolation, independent CI/CD release cycles, and real-time asynchronous reconciliation.');

sectionHeading('1.2 Problem Statement');
bodyText('Engineering a high-performance distributed backend for an airline booking ecosystem presents several critical technical and operational challenges:');
bulletPoint('Cascading Failures and Single Points of Failure (SPOF): ', 'In traditional monolithic backends, runtime memory exhaustion or database lock deadlocks in auxiliary modules immediately compromise mission-critical customer bookings.');
bulletPoint('Distributed Inventory Consistency: ', 'Partitioning databases across independent microservices creates the hazard of stale flight instance availability, phantom bookings, or double-selling of physical aircraft seats.');
bulletPoint('Operational Lifecycle Complexity: ', 'Airlines require strict coordination across diverse domains: governmental IATA/ICAO code governance, fleet specs (cabin layout, cruising speed, range), dynamic baggage rules, recurring flight schedules, and live flight seat instances.');
bulletPoint('Payment Security & Fraud Prevention: ', 'Financial checkout flows demand tamper-proof order generation and cryptographic signature verification (such as Razorpay HMAC-SHA256) without introducing blocking latency into passenger reservation threads.');

sectionHeading('1.3 Objectives');
bodyText('The principal objectives of the Backend of flight booking system are:');
bulletPoint('Domain-Driven Microservice Decomposition: ', 'Architect and implement nine discrete Spring Boot microservices (user-service, airline-core-service, flight-ops-service, location-service, pricing-service, Seat-Service, ancillary-service, booking-service, payment-service) coupled via a common domain library (common-lib).');
bulletPoint('Database-per-Service Pattern: ', 'Deploy nine independent PostgreSQL databases on isolated schemas, eliminating cross-service SQL joins.');
bulletPoint('Hybrid Synchronous and Asynchronous Integration: ', 'Integrate services synchronously using Spring Cloud OpenFeign for real-time queries and asynchronously via Apache Kafka message brokers for event-driven transaction completion.');
bulletPoint('Stateless Authentication & Multi-Tenancy: ', 'Implement stateless security via JJWT (HMAC-SHA256) bearer tokens and enforce tenant isolation through custom forwarded headers (X-User-Id).');
bulletPoint('Cryptographic Payment Verification: ', 'Integrate Razorpay Java SDK for order creation and HMAC webhook validation, utilizing Kafka to transition bookings from PENDING to CONFIRMED.');
bulletPoint('Sub-5ms Navigation Caching: ', 'Implement in-memory cache abstraction (ConcurrentMapCacheManager) on high-frequency airport lookups.');

sectionHeading('1.4 Scope of the Project');
bodyText('The functional and technical scope encompasses:');
bulletPoint('Identity & Access Management: ', 'Registration, BCrypt password hashing, and role-based access control (ROLE_USER, ROLE_AIRLINE_OWNER, ROLE_SYSTEM_ADMIN).');
bulletPoint('Fleet & Route Administration: ', 'Airline registration, admin approvals/suspensions, aircraft fleet configuration, and international airport route scheduling.');
bulletPoint('Seat Map & Availability Engine: ', 'Cabin class definitions, multi-column seat map grid generation, and real-time seat instance availability tracking.');
bulletPoint('Pricing & Ancillary Add-ons: ', 'Base fare structures, baggage policy rules, dietary meal catalogs, and total surcharge calculations.');
bulletPoint('Booking & Payment Lifecycle: ', 'Multi-passenger booking creation, PNR generation, payment link generation, cryptographic verification, and e-ticket generation.');

sectionHeading('1.5 Organisation of the Report');
bodyText('The report is organized as follows: Chapter 1 provides the foundational context, problem statement, objectives, and project scope. Subsequent chapters detail literature review, system analysis and design, microservices implementation, testing strategies, empirical results, and future enhancements.');


// ==========================================
// SECOND PASS: POPULATE DYNAMIC TOC, LISTS & NUMBERING
// ==========================================
console.log('Populating dynamic Table of Contents, Lists, and Page Numbers...');

function getDisplayPage(pageIdx) {
  const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
  if (pageIdx < pageTracker.firstChapterPage) {
    return roman[pageIdx - 1] || String(pageIdx);
  }
  return String(pageIdx - pageTracker.firstChapterPage + 1);
}

// 1. Fill Table of Contents on pageTracker.toc
doc.switchToPage(pageTracker.toc);
doc.y = 115;

const tocEntries = [
  ['Certificate', pageTracker.certificate],
  ['Declaration', pageTracker.declaration],
  ['Acknowledgement', pageTracker.acknowledgement],
  ['Abstract', pageTracker.abstract],
  ['Table of Contents', pageTracker.toc],
  ['List of Figures', pageTracker.listOfFigures],
  ['List of Tables', pageTracker.listOfTables],
  ['List of Abbreviations', pageTracker.abbreviations],
  ['CHAPTER 1: INTRODUCTION', pageTracker.chapter1],
  ['    1.1 Background', pageTracker.chapter1],
  ['    1.2 Problem Statement', pageTracker.chapter1],
  ['    1.3 Objectives', pageTracker.chapter1],
  ['    1.4 Scope of the Project', pageTracker.chapter1],
  ['    1.5 Organisation of the Report', pageTracker.chapter1]
];

tocEntries.forEach(([label, pgIdx]) => {
  const isMajor = label.startsWith('CHAPTER') || ['Certificate', 'Declaration', 'Acknowledgement', 'Abstract', 'Table of Contents', 'List of Figures', 'List of Tables', 'List of Abbreviations'].includes(label);
  const pgStr = getDisplayPage(pgIdx !== undefined ? pgIdx : 0);
  doc.font(isMajor ? 'Times-Bold' : 'Times-Roman').fontSize(isMajor ? 10 : 9).fillColor('#000000');
  
  const textWidth = doc.widthOfString(label);
  const numWidth = doc.widthOfString(pgStr);
  const dotWidth = doc.widthOfString('. ');
  const numDots = Math.max(2, Math.floor((USABLE_WIDTH - textWidth - numWidth - 10) / dotWidth));
  const dots = '. '.repeat(numDots);

  doc.text(label, MARGIN_LEFT, doc.y, { continued: true });
  doc.text(' ' + dots + ' ' + pgStr, { align: 'right', width: USABLE_WIDTH - (doc.x - MARGIN_LEFT) });
  doc.moveDown(0.24);
});

// 2. Fill List of Figures on pageTracker.listOfFigures
doc.switchToPage(pageTracker.listOfFigures);
doc.y = 120;
doc.font('Times-Italic').fontSize(10).fillColor('#475569')
   .text('(Detailed architectural and workflow figures are documented in Chapter 3 onwards as per the project roadmap)', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });

// 3. Fill List of Tables on pageTracker.listOfTables
doc.switchToPage(pageTracker.listOfTables);
doc.y = 120;
doc.font('Times-Italic').fontSize(10).fillColor('#475569')
   .text('(System specification and verification tables are documented in Chapter 3 onwards as per the project roadmap)', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });

// 4. Stamping Page Numbers Centered at Bottom
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  if (i === 0) {
    // Cover page has no visible page number per department guidelines
    continue;
  }
  const pageStr = getDisplayPage(i);
  
  doc.font('Times-Roman').fontSize(10).fillColor('#000000')
     .text(pageStr, 0, PAGE_HEIGHT - 45, {
       width: PAGE_WIDTH,
       align: 'center'
     });
}

doc.end();

writeStream.on('finish', () => {
  // Also create a copy named Backend_Flight_Booking_System_Report_Chapter1.pdf
  fs.copyFileSync(OUTPUT_PATH, CH1_COPY_PATH);
  console.log(`PDF successfully generated at: ${OUTPUT_PATH} and ${CH1_COPY_PATH} (Total: ${totalPages} pages)`);
});
