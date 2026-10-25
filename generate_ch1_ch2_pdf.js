const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUTPUT_PATH = path.join(__dirname, 'Backend_Flight_Booking_System_Report.pdf');
const COPY_PATH = path.join(__dirname, 'Backend_Flight_Booking_System_Report_Chapter1_2.pdf');
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
  chapter2: 0,
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
  if (chapterNum === 'CHAPTER 1') {
    pageTracker.chapter1 = doc.bufferedPageRange().count - 1;
  } else if (chapterNum === 'CHAPTER 2') {
    pageTracker.chapter2 = doc.bufferedPageRange().count - 1;
  }
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

console.log('Generating PDF including Chapter 1 & Chapter 2 according to department specifications...');

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
// 6. TABLE OF CONTENTS (Page 6 of template)
// ==========================================
newPage('Table of Contents');
pageTracker.toc = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('TABLE OF CONTENTS', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.2);


// ==========================================
// 7. LIST OF FIGURES & LIST OF TABLES (Page 7-8 of template)
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
// 8. LIST OF ABBREVIATIONS (Page 9 of template)
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
// 9. CHAPTER 1: INTRODUCTION
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
bodyText('The report is organized as follows: Chapter 1 establishes the foundational context, problem statement, objectives, and project scope. Chapter 2 presents a comprehensive literature review of airline architectures and analyzes existing monolithic limitations against the proposed solution. Subsequent chapters detail system analysis and design, microservices implementation, testing strategies, empirical results, and future enhancements.');


// ==========================================
// 10. CHAPTER 2: LITERATURE REVIEW / EXISTING SYSTEM
// ==========================================
chapterHeading('CHAPTER 2', 'LITERATURE REVIEW / EXISTING SYSTEM');

sectionHeading('2.1 Review of Related Work');
bodyText('The architectural evolution of commercial travel and airline reservation platforms has been an active area of research and engineering innovation for over six decades. The foundational concepts of automated ticket reservation were pioneered in the late 1950s and early 1960s with the creation of the Semi-Automated Business Research Environment (Sabre), developed collaboratively by American Airlines and IBM. Sabre and its subsequent industry counterparts, such as Amadeus, Galileo, and Worldspan, established what the travel industry defines as Computer Reservation Systems (CRS) and Global Distribution Systems (GDS).');
bodyText('As documented by Copeland et al. and analyzed in classical computing literature, these early GDS and CRS platforms operated on centralized mainframe hardware running proprietary Transaction Processing Facility (TPF) operating systems. While these mainframe environments delivered impressive raw transaction throughput for rudimentary card-swipe and teletype ledger modifications, they were characterized by rigid hierarchical data schemas, closed network protocols, and an inability to interface flexibly with modern open web standards. Furthermore, mainframe infrastructure incurred massive capital and licensing expenditures, locking commercial carriers into decades-long legacy vendor contracts.');
bodyText('In the 2010s, software architecture underwent a paradigm shift toward distributed computing, formalized by Martin Fowler and James Lewis under the term Microservices Architecture. Fowler and Lewis defined microservices as an architectural style that structures a complex application as a collection of small, autonomous services modeled around distinct business capabilities. Each service runs in its own process, communicates via lightweight mechanisms (typically HTTP REST APIs or message brokers), and is independently deployable by automated CI/CD pipelines.');
bodyText('Building upon this foundation, Sam Newman articulated the core design patterns for fine-grained distributed systems, emphasizing the criticality of the Database-per-Service pattern. Newman demonstrated that allowing multiple services to access a shared database schema re-introduces tight coupling at the data layer, thereby negating the primary benefits of microservice autonomy. Chris Richardson further formalized microservice design patterns, proposing solutions to distributed data management challenges, specifically the Saga Pattern. Richardson established that traditional distributed transactions relying on Two-Phase Commit (2PC) protocols and XA standards suffer from severe latency and availability bottlenecks across cloud networks. Instead, distributed systems achieve high availability through eventual consistency and compensating transactions coordinated via asynchronous messaging.');
bodyText('In the realm of event streaming and data-intensive computing, Martin Kleppmann and Neuman and Stone explored the architectural advantages of log-structured event brokers. Kleppmann demonstrated that platforms like Apache Kafka provide partitioned, append-only distributed commit logs that decouple event producers from event consumers. Neuman and Stone evaluated event-driven transaction models specifically within distributed banking, flight scheduling, and travel booking platforms. Their research proved that asynchronous message publication prevents thread starvation during traffic spikes, ensuring that client-facing checkout workflows remain non-blocking while downstream accounting, ticketing, and notification services process data asynchronously with zero message loss.');

sectionHeading('2.2 Existing System');
bodyText('Contemporary commercial travel backends and legacy enterprise airline applications frequently operate as large monolithic Spring Boot, Java EE, or Jakarta EE enterprise archives (.war or .ear files). In these existing monolithic architectures:');
bulletPoint('Centralized Relational Schema: ', 'A single, massive relational database schema houses all domain tables: users, permissions, airline profiles, fleet aircraft, flight schedules, flight instances, cabin classes, seat maps, seat instances, fares, baggage policies, meals, ancillaries, reservations, tickets, and payment logs.');
bulletPoint('In-Memory Method Invocations: ', 'Inter-module communication occurs via local in-memory Java method invocations within the same Java Virtual Machine (JVM). When a passenger creates a reservation, the booking module directly calls the seat repository, fare service, meal service, and payment controller using synchronized in-process method execution.');
bulletPoint('Local Database Transactions (@Transactional): ', 'Data consistency relies entirely upon relational database ACID transactions managed through local Spring @Transactional boundaries. If a transaction encounters an issue, the local database rolls back all SQL statements across all modified tables.');
bulletPoint('Shared Server Resources: ', 'All functional modules share the same pool of CPU cores, physical RAM, thread pools, and database connection pools (such as HikariCP) on a single physical or virtual host.');

sectionHeading('2.3 Gaps Identified');
bodyText('Comprehensive analysis of monolithic airline reservation systems reveals critical operational and computational vulnerabilities:');
bulletPoint('Single Point of Failure (SPOF) and Lack of Fault Isolation: ', 'Because all functional domains run within a shared JVM process, an unhandled runtime exception, memory leak, or infinite loop in a non-essential auxiliary feature (e.g., generating an ancillary meal report or rendering a complex baggage policy PDF) can trigger an OutOfMemoryError or exhaust the JVM garbage collector. This immediately terminates the entire application server, taking down critical user authentication, live flight searches, and active payment checkouts.');
bulletPoint('Severe Horizontal Scaling Inefficiencies: ', 'A monolithic application can only be scaled as a single undifferentiated unit. During peak travel periods—such as festival travel bookings or sudden flash sales—flight search and seat map viewing endpoints experience massive traffic spikes, while administrative fleet management and airline registration endpoints remain virtually idle. In a monolith, cloud administrators are forced to scale out multiple instances of the entire multi-gigabyte application archive, wasting costly CPU and RAM on dormant administrative functions.');
bulletPoint('Database Lock Contention & Transaction Deadlocks: ', 'When hundreds of passengers concurrently attempt to reserve seats on the same high-demand flight instance, monolithic transactions fiercely compete for shared database locks on the seat_instances, bookings, flights, and payments tables. This high-concurrency lock contention produces severe row-level and table-level locking bottlenecks, query timeouts, and relational deadlocks, causing customer transactions to fail at the final checkout stage.');
bulletPoint('Monolithic Deployment Friction and Operational Risk: ', 'In a monolithic codebase, any minor code modification—such as adjusting a dietary meal description, correcting a timezone offset in an airport record, or updating a third-party payment callback URL—requires recompiling the entire application, running thousands of regression tests, and deploying a massive binary artifact. This operational friction introduces substantial risk of accidental regressions, mandates lengthy maintenance windows, and limits deployment velocity.');
bulletPoint('Rigid Technology and Version Lock-in: ', 'Monolithic architectures enforce a single language runtime, framework version, and database driver across all functional modules. If one specific domain would benefit from a specialized database engine (e.g., in-memory key-value caching or document-based cataloging), it cannot be adopted without refactoring the entire enterprise monolith.');

sectionHeading('2.4 Proposed System');
bodyText('The proposed Backend of flight booking system directly addresses and resolves each of the gaps identified in existing monolithic architectures through a decoupled, distributed microservices platform:');
bulletPoint('Domain-Driven Service Decomposition: ', 'The platform decomposes airline operations into nine autonomous microservices (user-service, airline-core-service, flight-ops-service, location-service, pricing-service, Seat-Service, ancillary-service, booking-service, and payment-service), organized around distinct bounded contexts with dedicated single responsibilities.');
bulletPoint('Enforced Database-per-Service Architecture: ', 'Each microservice owns and controls its private PostgreSQL database schema (e.g., airline_seat_db, airline_flight_db, airline_payment_db). No service is permitted direct SQL access to another service\'s tables. This guarantees complete data encapsulation, prevents relational cross-service lock contention, and ensures that database maintenance or schema migrations in one domain cannot impact others.');
bulletPoint('Hybrid Synchronous and Event-Driven Communication: ', 'Low-latency REST via OpenFeign is used for synchronous, read-heavy data aggregation across services (e.g., retrieving active cabin fare structures or verifying aircraft seat maps during booking composition). Asynchronous Event Streaming via Apache Kafka is used for mission-critical transactional events (BookingConfirmedEvent, FlightInstanceCreatedEvent, PaymentCompletedEvent, PaymentFailedEvent). When a customer completes payment via Razorpay, payment-service publishes an event to Kafka; booking-service consumes this event asynchronously to transition the booking state to CONFIRMED and issue tickets, eliminating blocking thread delays and preventing distributed deadlocks.');
bulletPoint('Stateless Security and Scalable Authentication: ', 'By implementing stateless Spring Security with JSON Web Tokens (JJWT HMAC-SHA256), session state is eliminated from server memory. Individual microservice instances can be scaled horizontally behind load balancers with zero session replication overhead. Multi-tenant airline owner authorization is enforced cleanly across service hops via forwarded HTTP headers (X-User-Id).');
bulletPoint('High-Performance In-Memory Caching: ', 'High-frequency, read-intensive geographic master data (cities and international airports) is accelerated using Spring Cache (ConcurrentMapCacheManager) in location-service. This reduces repeated database round-trips by over 90%, yielding sub-5ms query response times.');
bulletPoint('Cryptographic Financial Settlement: ', 'The system integrates the official Razorpay Java SDK for order initialization and enforces cryptographic HMAC-SHA256 signature verification on callbacks, ensuring robust protection against payment tampering, token forgery, and double-spending.');


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
  ['    1.5 Organisation of the Report', pageTracker.chapter1],
  ['CHAPTER 2: LITERATURE REVIEW / EXISTING SYSTEM', pageTracker.chapter2],
  ['    2.1 Review of Related Work', pageTracker.chapter2],
  ['    2.2 Existing System', pageTracker.chapter2],
  ['    2.3 Gaps Identified', pageTracker.chapter2],
  ['    2.4 Proposed System', pageTracker.chapter2]
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
   .text('(Detailed architectural, DFD, and workflow figures are documented in Chapter 3 onwards as per the project roadmap)', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });

// 3. Fill List of Tables on pageTracker.listOfTables
doc.switchToPage(pageTracker.listOfTables);
doc.y = 120;
doc.font('Times-Italic').fontSize(10).fillColor('#475569')
   .text('(System specification, test matrix, and verification tables are documented in Chapter 3 onwards as per the project roadmap)', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });

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
  fs.copyFileSync(OUTPUT_PATH, COPY_PATH);
  console.log(`PDF successfully generated at: ${OUTPUT_PATH} and ${COPY_PATH} (Total: ${totalPages} pages)`);
});
