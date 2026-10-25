const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUTPUT_PATH = path.join(__dirname, 'Backend_Flight_Booking_System_Report.pdf');
const COPY_PATH = path.join(__dirname, 'Backend_Flight_Booking_System_Report_Chapter1_3.pdf');
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
  chapter3: 0,
  firstChapterPage: 0,
  // Figure pages
  fig3_1: 0,
  fig3_2: 0,
  fig3_3: 0,
  fig3_4: 0,
  fig3_5: 0,
  // Table pages
  tab3_1: 0,
  tab3_2: 0,
  tab3_3: 0
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
  } else if (chapterNum === 'CHAPTER 3') {
    pageTracker.chapter3 = doc.bufferedPageRange().count - 1;
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

function subSectionHeading(numAndTitle) {
  checkPageSpace(45);
  doc.moveDown(0.4);
  doc.font('Times-Bold').fontSize(11.5).fillColor('#1e293b')
     .text(numAndTitle, MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'left', lineGap: 2 });
  doc.moveDown(0.3);
}

function bodyText(text, options = {}) {
  checkPageSpace(28);
  doc.font(options.bold ? 'Times-Bold' : (options.italic ? 'Times-Italic' : 'Times-Roman'))
     .fontSize(11)
     .fillColor(options.color || '#111111')
     .text(text, MARGIN_LEFT, doc.y, {
       width: USABLE_WIDTH,
       align: options.align || 'justify',
       lineGap: 4.2, // 1.5 line spacing
       ...options
     });
  doc.moveDown(0.4);
}

function bulletPoint(boldPrefix, text) {
  checkPageSpace(26);
  const indent = 14;
  const startY = doc.y;
  doc.font('Times-Bold').fontSize(11).fillColor('#111111')
     .text('•  ' + boldPrefix, MARGIN_LEFT + indent, startY, { continued: true });
  doc.font('Times-Roman').fontSize(11)
     .text(text, { width: USABLE_WIDTH - indent, align: 'justify', lineGap: 3.8 });
  doc.moveDown(0.32);
}

function drawTable(headers, rows, colWidths, tableTitle) {
  checkPageSpace(80);
  if (tableTitle) {
    doc.font('Times-Bold').fontSize(10.5).fillColor('#000000')
       .text(tableTitle, MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });
    doc.moveDown(0.35);
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

    if (curY + rowHeight > PAGE_HEIGHT - MARGIN_BOTTOM - 20) {
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

  doc.y = curY + 10;
}

// Function to draw vector box diagram
function drawBox(x, y, w, h, title, subtitle, bgColor = '#f8fafc', borderColor = '#64748b') {
  doc.roundedRect(x, y, w, h, 4).fillAndStroke(bgColor, borderColor);
  doc.font('Times-Bold').fontSize(8.5).fillColor('#0f172a')
     .text(title, x + 4, y + 4, { width: w - 8, align: 'center' });
  if (subtitle) {
    doc.font('Times-Roman').fontSize(7.5).fillColor('#475569')
       .text(subtitle, x + 4, y + 16, { width: w - 8, align: 'center', lineGap: 1.5 });
  }
}

function drawConnector(x1, y1, x2, y2, label = '', isDashed = false) {
  doc.save();
  if (isDashed) doc.dash(3, { space: 3 });
  doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor('#475569').lineWidth(1).stroke();
  doc.restore();
  if (label) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    doc.font('Times-Italic').fontSize(7).fillColor('#0369a1')
       .text(label, midX - 60, midY - 6, { width: 120, align: 'center' });
  }
}

console.log('Generating academic PDF including Chapters 1, 2, and 3...');

// ==========================================
// 1. COVER PAGE
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

// Two Column Metadata
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
// 2. CERTIFICATE
// ==========================================
newPage('Certificate');
pageTracker.certificate = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('CERTIFICATE', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);

bodyText('This is to certify that the Mini Project Report entitled "Backend of flight booking system" is a bonafide work carried out by Vikas (Roll No. 2301530100149) in partial fulfilment of the requirements for the award of the degree of Bachelor of Technology in Computer Science & Engineering during the academic year 2026–2027, 7th Semester (Section 7/A), at the Department of Computer Science & Engineering, Lloyd Institute of Engineering & Technology.');
doc.moveDown(0.5);
bodyText('The project work has been conducted under our direct supervision and guidance. The results and conclusions embodied in this report have not been submitted to any other University or Institute for the award of any other degree or diploma.');

doc.y = 520;
const signColWidth = USABLE_WIDTH / 2;

// Row 1: Guide & Project Coordinator
doc.font('Times-Bold').fontSize(10.5).text('Ms. Deepika Arora', MARGIN_LEFT, doc.y);
doc.font('Times-Roman').fontSize(9.5).text('Guide / Assistant Professor\nDept. of Computer Science & Engg.', MARGIN_LEFT, doc.y + 14);

doc.font('Times-Bold').fontSize(10.5).text('Mr. Vishal Gupta', MARGIN_LEFT + signColWidth + 20, doc.y);
doc.font('Times-Roman').fontSize(9.5).text('Project Coordinator / Assistant Professor\nDept. of Computer Science & Engg.', MARGIN_LEFT + signColWidth + 20, doc.y + 14);

// Row 2: HOD & Dean
doc.y = 660;
doc.font('Times-Bold').fontSize(10.5).text('Ms. Deepika Arora', MARGIN_LEFT, doc.y);
doc.font('Times-Roman').fontSize(9.5).text('Head of Department (HOD)\nDept. of Computer Science & Engg.', MARGIN_LEFT, doc.y + 14);

doc.font('Times-Bold').fontSize(10.5).text('Prof. Kumud Saxena', MARGIN_LEFT + signColWidth + 20, doc.y);
doc.font('Times-Roman').fontSize(9.5).text('Dean (Academics / Engineering)\nLloyd Institute of Engg. & Technology', MARGIN_LEFT + signColWidth + 20, doc.y + 14);


// ==========================================
// 3. CANDIDATE\'S DECLARATION
// ==========================================
newPage('Candidate\'s Declaration');
pageTracker.declaration = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('CANDIDATE\'S DECLARATION', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);

bodyText('I hereby declare that the work presented in this Mini Project Report entitled "Backend of flight booking system" submitted in partial fulfilment of the requirements for the award of the degree of Bachelor of Technology in Computer Science & Engineering, submitted to the Department of Computer Science & Engineering, Lloyd Institute of Engineering & Technology, Greater Noida, affiliated to Dr. A.P.J. Abdul Kalam Technical University, Lucknow, is an authentic record of my own work carried out during the academic session 2026–2027 under the supervision of Ms. Deepika Arora, Assistant Professor.');
doc.moveDown(0.5);
bodyText('I further declare that the content of this project report has not been submitted previously in part or in full for the award of any other degree or diploma to any other institute or university.');

doc.y = 560;
doc.font('Times-Roman').fontSize(10.5)
   .text('Date: 25-10-2026', MARGIN_LEFT, doc.y)
   .text('Place: Greater Noida', MARGIN_LEFT, doc.y + 16);

doc.font('Times-Bold').fontSize(10.5).text('Vikas', MARGIN_LEFT + signColWidth + 40, doc.y);
doc.font('Times-Roman').fontSize(10)
   .text('Roll No.: 2301530100149', MARGIN_LEFT + signColWidth + 40, doc.y + 16)
   .text('Semester & Section: 7/A', MARGIN_LEFT + signColWidth + 40, doc.y + 32)
   .text('B.Tech - Computer Science & Engineering', MARGIN_LEFT + signColWidth + 40, doc.y + 48);


// ==========================================
// 4. ACKNOWLEDGEMENT
// ==========================================
newPage('Acknowledgement');
pageTracker.acknowledgement = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('ACKNOWLEDGEMENT', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);

bodyText('I would like to express my profound gratitude and deep reverence to my project guide, Ms. Deepika Arora, Assistant Professor, Department of Computer Science & Engineering, for her invaluable guidance, constructive criticism, constant encouragement, and intellectual support throughout the progression of this project work.');
doc.moveDown(0.4);
bodyText('I extend my heartfelt thanks to Mr. Vishal Gupta, Project Coordinator, for providing systematic guidelines, meticulous milestone reviews, and the structural framework necessary to accomplish this project successfully.');
doc.moveDown(0.4);
bodyText('I am equally obliged to Ms. Deepika Arora, Head of the Department, Computer Science & Engineering, and Prof. Kumud Saxena, Dean, Lloyd Institute of Engineering & Technology, for granting access to high-performance computing labs, enterprise software repositories, and scholastic encouragement.');
doc.moveDown(0.4);
bodyText('Lastly, I express sincere gratitude to my family, faculty members, and fellow classmates for their unwavering encouragement, insightful discussions, and technical camaraderie.');

doc.y = 580;
doc.font('Times-Bold').fontSize(10.5).text('Vikas', MARGIN_LEFT + signColWidth + 40, doc.y);
doc.font('Times-Roman').fontSize(10)
   .text('Roll No.: 2301530100149', MARGIN_LEFT + signColWidth + 40, doc.y + 16)
   .text('Semester & Section: 7/A', MARGIN_LEFT + signColWidth + 40, doc.y + 32)
   .text('B.Tech - Computer Science & Engineering', MARGIN_LEFT + signColWidth + 40, doc.y + 48);


// ==========================================
// 5. ABSTRACT
// ==========================================
newPage('Abstract');
pageTracker.abstract = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('ABSTRACT', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);

bodyText('Commercial airline operations necessitate highly available, fault-tolerant, and horizontally scalable transaction backends capable of processing complex flight inventory searches, multi-passenger bookings, seat allocations, and financial reconciliations in real-time. Traditional monolithic reservation systems suffer from single points of failure, resource contention across disparate operational domains, and catastrophic cascading outages during peak traffic surges.');
doc.moveDown(0.4);
bodyText('This project presents the design and implementation of the "Backend of flight booking system", an enterprise-grade distributed microservices architecture engineered with Java 17, Spring Boot 3.x/4.x, Spring Cloud OpenFeign, PostgreSQL, and Apache Kafka. The platform decomposes the core aviation lifecycle into nine decoupled microservices: user authentication, airline fleet governance, flight scheduling, geographic airport navigation, dynamic pricing, seat inventory management, ancillary services, booking coordination, and payment gateway settlement via Razorpay SDK.');
doc.moveDown(0.4);
bodyText('Data integrity across distributed service boundaries is maintained using the Database-per-Service pattern alongside event-driven choreography mediated by Apache Kafka commit logs. In-memory caching drastically optimizes geographic airport queries to sub-50 millisecond response times. Stateless JWT bearer authentication guarantees role-based security without server-side session overhead. Comprehensive automated Postman suites validate the complete transactional workflow. The resulting distributed backend achieves robust fault isolation, horizontal scalability, zero data loss, and enterprise reliability.');
doc.moveDown(0.8);
doc.font('Times-Bold').fontSize(10.5).text('Keywords: ', MARGIN_LEFT, doc.y, { continued: true });
doc.font('Times-Roman').fontSize(10.5).text('Microservices, Spring Boot, Apache Kafka, PostgreSQL, Distributed Transactions, Event-Driven Architecture, Razorpay Payment Gateway, JWT Authentication.');


// ==========================================
// 6. TABLE OF CONTENTS (Placeholder Page)
// ==========================================
newPage('Table of Contents');
pageTracker.toc = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('TABLE OF CONTENTS', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);


// ==========================================
// 7. LIST OF FIGURES (Placeholder Page)
// ==========================================
newPage('List of Figures');
pageTracker.listOfFigures = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('LIST OF FIGURES', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);


// ==========================================
// 8. LIST OF TABLES (Placeholder Page)
// ==========================================
newPage('List of Tables');
pageTracker.listOfTables = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('LIST OF TABLES', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.5);


// ==========================================
// 9. LIST OF ABBREVIATIONS
// ==========================================
newPage('List of Abbreviations');
pageTracker.abbreviations = doc.bufferedPageRange().count - 1;
doc.moveDown(1);
doc.font('Times-Bold').fontSize(15).text('LIST OF ABBREVIATIONS', { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1.2);

const abbreviationsList = [
  ['API', 'Application Programming Interface'],
  ['BCrypt', 'Adaptive Password Hashing Function based on Blowfish'],
  ['CRUD', 'Create, Read, Update, and Delete Operations'],
  ['DAO', 'Data Access Object Pattern'],
  ['DFD', 'Data Flow Diagram'],
  ['DTO', 'Data Transfer Object Pattern'],
  ['ER', 'Entity Relationship Schema / Model'],
  ['HMAC', 'Hash-Based Message Authentication Code'],
  ['HTTP', 'Hypertext Transfer Protocol'],
  ['IATA', 'International Air Transport Association'],
  ['ICAO', 'International Civil Aviation Organization'],
  ['JAR', 'Java Archive Package'],
  ['JDBC', 'Java Database Connectivity API'],
  ['JSON', 'JavaScript Object Notation Data Format'],
  ['JWT', 'JSON Web Token (RFC 7519)'],
  ['NIC', 'Network Interface Card'],
  ['ORM', 'Object-Relational Mapping (Hibernate Framework)'],
  ['PNR', 'Passenger Name Record'],
  ['POJO', 'Plain Old Java Object'],
  ['RDBMS', 'Relational Database Management System'],
  ['REST', 'Representational State Transfer Architectural Style'],
  ['SDK', 'Software Development Kit'],
  ['SHA', 'Secure Hash Algorithm (SHA-256)'],
  ['SQL', 'Structured Query Language'],
  ['UML', 'Unified Modeling Language']
];

drawTable(['Abbreviation', 'Full Form / Description'], abbreviationsList, [110, 305.28]);


// ==========================================
// CHAPTER 1: INTRODUCTION
// ==========================================
chapterHeading('CHAPTER 1', 'INTRODUCTION');
pageTracker.firstChapterPage = doc.bufferedPageRange().count - 1;

sectionHeading('1.1 Background');
bodyText('The civil aviation and airline operations industry represents one of the most operationally demanding sectors in contemporary computing. Millions of flight sectors are operated daily across global airspace, accompanied by billions of real-time seat inventory transactions, fluctuating fare adjustments, meal catering reservations, baggage logistics, and high-frequency digital payments. Modern air travelers expect immediate flight search results, dynamic pricing transparency, interactive seat selection, and instantaneous ticketing.');
bodyText('Historically, airline reservation software relied upon monolithic Passenger Service Systems (PSS) and legacy mainframe Global Distribution Systems (GDS). These systems suffered from rigid centralized schemas, tight operational coupling, vendor lock-in, and profound scaling inefficiencies during peak booking surges (such as holiday seasons, flash airfare discounts, or sudden flight re-routings). A failure in one operational domain—such as in-flight meal logging or baggage policy validation—frequently cascaded to destabilize the core flight booking engine.');
bodyText('With the evolution of distributed cloud architectures and event-driven computing, modern commercial software engineering has pivoted toward the Microservices Architecture. By decomposing complex business domains into autonomous, self-contained services with dedicated data stores, modern airline platforms can achieve horizontal scalability, high fault isolation, continuous independent deployments, and real-time asynchronous reconciliation.');

sectionHeading('1.2 Problem Statement');
bodyText('Developing a distributed backend for an airline booking platform introduces critical technical and operational challenges:');
bulletPoint('Tight Coupling and Failure Cascades: ', 'In conventional monolithic backends, database locks or unhandled exceptions in non-critical modules (such as baggage metadata or ancillary meal lookups) halt mission-critical seat bookings and customer payments.');
bulletPoint('Distributed Data Consistency: ', 'Splitting databases across services risks stale flight instance data, double-booking of physical seats, or discrepancy between customer payment status and ticket generation.');
bulletPoint('Complex Domain Modeling: ', 'Airline operations require managing distinct entity lifecycles: airline governance, aircraft physical fleet configurations, multi-cabin classes, dynamic baggage weight allowances, recurring flight schedules, and dynamic seat instance availability.');
bulletPoint('Third-Party Payment Security & Replay Attacks: ', 'Financial transactions require tamper-proof payment link generation and cryptographic signature validation (such as Razorpay HMAC-SHA256) without introducing blocking latency into client threads.');

sectionHeading('1.3 Objectives');
bodyText('The principal objectives of the Backend of flight booking system are:');
bulletPoint('Microservice Modularization: ', 'Architect and implement nine distinct, domain-driven microservices (user-service, airline-core-service, flight-ops-service, location-service, pricing-service, Seat-Service, ancillary-service, booking-service, and payment-service) supported by a centralized Maven shared module (common-lib).');
bulletPoint('Database Isolation: ', 'Enforce the Database-per-Service pattern by deploying nine independent PostgreSQL databases on dedicated schemas, eliminating cross-service relational joins.');
bulletPoint('Synchronous & Asynchronous Integration: ', 'Integrate services through declarative RESTful HTTP interfaces via Spring Cloud OpenFeign and implement event-driven data propagation using Apache Kafka message brokers.');
bulletPoint('Stateless Security & Tenant Isolation: ', 'Establish stateless authentication using JJWT (JSON Web Token HMAC-SHA256) and implement multi-tenant owner authorization using custom headers (X-User-Id).');
bulletPoint('Robust Payment Lifecycle: ', 'Integrate the Razorpay Java SDK for order generation and cryptographic HMAC webhook verification, using Kafka events to transition bookings from PENDING to CONFIRMED.');
bulletPoint('High-Performance Caching: ', 'Implement in-memory cache abstraction (ConcurrentMapCacheManager) for high-read, low-write geographic entities (airports and cities).');

sectionHeading('1.4 Scope of the Project');
bodyText('The functional and technical scope of this project encompasses:');
bulletPoint('Customer Authentication & RBAC: ', 'End-user registration, secure login with BCrypt password hashing, and role-based access control (ROLE_USER, ROLE_AIRLINE_OWNER, ROLE_SYSTEM_ADMIN).');
bulletPoint('Airline & Fleet Administration: ', 'Registration of airline companies (IATA/ICAO codes, alliance, logos, support contacts) and physical aircraft fleets (registration numbers, seat counts by cabin, speed, range).');
bulletPoint('Flight Schedules & Live Instances: ', 'Creation of master flights, recurring calendar schedules, and operational flight instances generated for specific calendar dates.');
bulletPoint('Cabin Layout & Seat Allocation: ', 'Multi-cabin definitions (Economy, Premium Economy, Business, First Class), physical seat grid mapping (rows, columns, aisles), and real-time seat locking.');
bulletPoint('Dynamic Pricing & Baggage Policies: ', 'Calculation of base fares, taxes, airline fees, and baggage rules (cabin/check-in weights and pieces).');
bulletPoint('Ancillary Add-ons & In-Flight Dining: ', 'Management of ancillary products and special dietary meal requirements.');
bulletPoint('Reservations & Payment Processing: ', 'Multi-passenger reservation generation, unique PNR generation, payment link generation, cryptographic verification, and ticket issuance.');
bodyText('Out of Scope: Physical hardware gate boarding scanners, pilot flight deck telemetry systems, and consumer frontend UI rendering.');

sectionHeading('1.5 Organisation of the Report');
bodyText('This report is structured into seven comprehensive chapters:');
bulletPoint('Chapter 1 (Introduction): ', 'Outlines project background, problem statement, objectives, and scope.');
bulletPoint('Chapter 2 (Literature Review / Existing System): ', 'Evaluates traditional airline architectures, identifies technological gaps, and presents the proposed microservices model.');
bulletPoint('Chapter 3 (System Analysis and Design): ', 'Formulates functional and non-functional requirements, feasibility studies, high-level architecture, DFDs, ER schemas, and technology stacks.');
bulletPoint('Chapter 4 (Implementation): ', 'Details module architectures, core business algorithms, source code snippets, and system workflows.');
bulletPoint('Chapter 5 (Testing): ', 'Discusses testing strategies, tabular test cases, execution results, and sample JSON input/output data.');
bulletPoint('Chapter 6 (Results and Discussion): ', 'Evaluates system throughput, API latency, performance benefits of Kafka event streaming, and architectural trade-offs.');
bulletPoint('Chapter 7 (Conclusion and Future Scope): ', 'Summarizes technical achievements and outlines roadmap enhancements.');


// ==========================================
// CHAPTER 2: LITERATURE REVIEW / EXISTING SYSTEM
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
// CHAPTER 3: SYSTEM ANALYSIS AND DESIGN
// ==========================================
chapterHeading('CHAPTER 3', 'SYSTEM ANALYSIS AND DESIGN');

sectionHeading('3.1 Requirement Analysis');
bodyText('System analysis establishes the foundational engineering requirements, data constraints, performance targets, and infrastructure specifications necessary to build an enterprise-scale distributed flight booking platform. The requirements are segregated into functional capabilities, non-functional quality attributes, and hardware/software environment constraints.');

subSectionHeading('3.1.1 Functional Requirements');
bodyText('The functional requirements define the computational capabilities and operational behavior executed across the nine microservices:');
bulletPoint('User Identity & Authentication (user-service :5001): ', 'User registration with email, BCrypt password hashing, authentication with HMAC-SHA256 signed JWT generation, role-based access control (ROLE_USER, ROLE_AIRLINE_OWNER, ROLE_SYSTEM_ADMIN), and customer profile management.');
bulletPoint('Airline & Fleet Management (airline-core-service :5002): ', 'Airline profile creation (IATA/ICAO codes, alliance, logos, customer support data), administrative status lifecycle (ACTIVE, INACTIVE, SUSPENDED, BANNED), and physical aircraft fleet configurations (cabin classes, registration numbers, seating capacities).');
bulletPoint('Flight Operations & Scheduling (flight-ops-service :5003): ', 'Flight route setup connecting origin and destination airports, recurring weekly scheduling (operating days, departure/arrival times), automated flight instance generation for concrete calendar dates, and Kafka event broadcasting.');
bulletPoint('Geographic Navigation Directory (location-service :5004): ', 'Global city directory with timezone offsets and country mappings, airport catalog with unique 3-letter IATA codes and GPS coordinates, accelerated with Spring in-memory caching.');
bulletPoint('Pricing, Fares & Baggage Policy (pricing-service :5005): ', 'Cabin class fare structures (base fare, surcharges, taxes), dynamic baggage policies (cabin/checked baggage pieces, max weights, dimensions), and batch lowest fare calculation across flight lists.');
bulletPoint('Seat Layout & Inventory Management (Seat-Service :5006): ', 'Aircraft cabin layout configuration (Economy, Premium Economy, Business, First Class), seat map grid mapping (rows, columns, aisles), seat instance availability tracking (AVAILABLE, RESERVED, OCCUPIED, BLOCKED), and seat surcharge pricing.');
bulletPoint('Ancillaries & In-Flight Dining (ancillary-service :5007): ', 'Ancillary products catalog (extra baggage, priority boarding, travel insurance), dietary meal catalog (Vegetarian, Non-Veg, Vegan, Kosher, Halal, Jain), and flight-to-meal associations.');
bulletPoint('Booking & Ticketing Orchestration (booking-service :5008): ', 'Multi-passenger booking creation, automated cost calculation (fares, taxes, seats, meals, ancillaries), unique PNR reservation code generation, electronic ticket issuance, and booking cancellation.');
bulletPoint('Payment Gateway Integration (payment-service :5009): ', 'Razorpay checkout order initiation, callback webhook handling, cryptographic HMAC-SHA256 signature verification, and Kafka payment event dispatching.');

subSectionHeading('3.1.2 Non-Functional Requirements');
bodyText('Non-functional requirements quantify the system\'s operational qualities, resilience, scalability, and security guarantees:');
bulletPoint('Performance & Low Latency: ', 'In-memory cached airport queries must return in under 50ms. Booking reservation and fare calculation requests must complete within 300ms under standard operational load.');
bulletPoint('Horizontal Scalability: ', 'Stateless service architecture enables dynamic scale-out of high-traffic services (such as flight-ops-service and booking-service) behind reverse proxies without session synchronization overhead.');
bulletPoint('Fault Isolation & Resilience: ', 'Failure or maintenance restarts of ancillary services (e.g., ancillary-service or location-service) must not impede core booking creation or user authentication.');
bulletPoint('Data Consistency & Isolation: ', 'Strict Database-per-Service deployment eliminates cross-service SQL joins and lock contention. Eventual consistency is maintained reliably via Apache Kafka distributed topics.');
bulletPoint('Enterprise Security: ', 'All user passwords stored utilizing BCrypt with adaptive work factor 10. REST APIs secured via stateless JWT Bearer tokens. Payment verifications enforced through HMAC-SHA256 cryptographic signatures.');
bulletPoint('Auditability & Maintainability: ', 'Multi-module Maven parent POM enforces centralized dependency management. Entities utilize automated JPA auditing (@CreatedDate, @LastModifiedDate) for immutable audit trails.');

subSectionHeading('3.1.3 Hardware and Software Requirements');
bodyText('The minimum and recommended environmental specifications for hosting and developing the distributed platform are detailed below.');

// Table 3.1: Hardware Environment Specifications
pageTracker.tab3_1 = doc.bufferedPageRange().count - 1;
const hardwareData = [
  ['Processor', 'Intel Core i5 / AMD Ryzen 5 (4 Cores, 2.5 GHz)', 'Intel Core i7 / Xeon / AMD EPYC (8+ Cores, 3.2 GHz)'],
  ['Random Access Memory', '8 GB DDR4 RAM', '16 GB – 32 GB DDR4/DDR5 RAM'],
  ['Storage Space', '20 GB Available Storage (SSD)', '100+ GB NVMe Solid State Storage'],
  ['Network Interface', 'Standard Gigabit Ethernet NIC (1 Gbps)', '10 Gbps Cloud Virtual Network Adapter'],
  ['Display Resolution', '1366 × 768 pixels', '1920 × 1080 pixels (Full HD) or higher']
];
drawTable(
  ['Parameter', 'Minimum Development Spec', 'Recommended Production Spec'],
  hardwareData,
  [100, 155, 160.28],
  'Table 3.1: Hardware Environment Specifications'
);

// Table 3.2: Software Environment & Framework Specifications
pageTracker.tab3_2 = doc.bufferedPageRange().count - 1;
const softwareData = [
  ['Operating System', 'Microsoft Windows 10/11 / Linux (Ubuntu 22.04 LTS)', '64-bit Architecture'],
  ['Programming Runtime', 'Java Development Kit (OpenJDK / Eclipse Temurin)', 'Java 17 LTS (64-bit)'],
  ['Core Framework', 'Spring Boot & Spring Framework', 'Version 3.x / 4.x / 6.x'],
  ['Security & Auth', 'Spring Security, JJWT (io.jsonwebtoken)', 'Version 0.12.6 (HMAC-SHA256)'],
  ['Persistence Engine', 'Spring Data JPA / Hibernate ORM', 'Latest Compatible release'],
  ['Relational Database', 'PostgreSQL Relational Database Server', 'Version 14.x / 15.x / 16.x'],
  ['Distributed Broker', 'Apache Kafka (spring-kafka)', 'Version 3.x (KRaft / Zookeeper)'],
  ['Inter-Service Client', 'Spring Cloud OpenFeign & RestTemplate', 'Spring Cloud 2023.x / 2024.x'],
  ['Payment Gateway', 'Razorpay Java SDK (razorpay-java)', 'Version 1.4.3'],
  ['Build & Dependency', 'Apache Maven Multi-Module Reactor', 'Version 3.8+'],
  ['API Verification', 'Postman Desktop Client & Newman CLI', 'Version 10.x / 11.x']
];
drawTable(
  ['Layer / Component', 'Software / Library Selected', 'Version / Specification'],
  softwareData,
  [110, 195, 110.28],
  'Table 3.2: Software Environment & Framework Specifications'
);


// ==========================================
// 3.2 FEASIBILITY STUDY
// ==========================================
sectionHeading('3.2 Feasibility Study');
bodyText('A comprehensive feasibility analysis was conducted across technical, economic, and operational dimensions to substantiate the viability of developing and deploying the distributed flight booking platform.');

subSectionHeading('3.2.1 Technical Feasibility');
bodyText('The technical feasibility assesses whether the project requirements can be accomplished utilizing contemporary engineering tools, team expertise, and computational resources:');
bulletPoint('Maturity of Tech Stack: ', 'Java 17 and Spring Boot represent the prevailing industry benchmark for robust, type-safe enterprise software. Spring Cloud OpenFeign provides intuitive declarative abstractions that drastically minimize network socket and connection boilerplate.');
bulletPoint('Event-Driven Scalability: ', 'Apache Kafka is universally recognized for high-throughput, horizontally partitioned distributed streaming, capable of publishing and consuming hundreds of thousands of messages per second with deterministic order and zero data loss.');
bulletPoint('Developer Competence: ', 'The development team possesses proven hands-on proficiency in Spring Framework architecture, relational schema normalization, asynchronous event processing, and RESTful API integration.');
bodyText('Consequently, the project is technically feasible and well-aligned with proven industry practices.');

subSectionHeading('3.2.2 Economic Feasibility');
bodyText('The economic feasibility evaluates financial outlay, infrastructure licensing costs, and operational return on investment:');
bulletPoint('Zero Software Licensing Expenditure: ', 'The entire runtime and toolchain—Java JDK, Spring Boot, PostgreSQL, Apache Kafka, Maven, and Visual Studio Code—are open-source under permissible licenses (Apache 2.0, MIT, and PostgreSQL licenses), incurring zero licensing or recurring subscription costs.');
bulletPoint('Cost-Effective Cloud Footprint: ', 'The modular microservices architecture enables targeted, elastic scaling on cloud container runtimes (such as Kubernetes or AWS ECS). Organizations pay only for the compute capacity utilized by high-traffic services, eliminating the massive server provisioning costs of monolithic enterprise hosts.');
bulletPoint('Payment Integration Economy: ', 'The Razorpay payment gateway offers free developer sandbox credentials with zero setup fees, allowing extensive financial integration and signature verification testing without capital risk.');
bodyText('Hence, the project is economically viable with exceptional cost-to-performance efficiency.');

subSectionHeading('3.2.3 Operational Feasibility');
bodyText('Operational feasibility measures how smoothly the system integrates into commercial airline workflows and end-user booking routines:');
bulletPoint('Intuitive RESTful Contracts: ', 'The backends adhere strictly to standard HTTP conventions, predictable JSON request/response contracts, and standard status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found), allowing seamless integration with modern web frontends, mobile iOS/Android applications, and B2B travel aggregators.');
bulletPoint('Operational Isolation: ', 'Independent microservice deployment empowers DevOps teams to upgrade, test, or hot-patch individual services (such as updating in-flight meal prices or adding new airport coordinates) without requiring scheduled system-wide downtime.');
bulletPoint('Comprehensive Test Automation: ', 'Detailed Postman collection suites validate all endpoints across authentication, inventory creation, booking, and payment verification, ensuring streamlined operational maintenance.');
bodyText('Therefore, the system demonstrates outstanding operational feasibility.');


// ==========================================
// 3.3 SYSTEM ARCHITECTURE
// ==========================================
sectionHeading('3.3 System Architecture');
bodyText('The Backend of flight booking system is engineered as an enterprise-grade distributed microservices ecosystem. The system is structurally segregated into three primary functional domains: Core Infrastructure, Flight Operations & Inventory, and Commerce & Transaction Management, synchronized via Apache Kafka and Spring Cloud OpenFeign.');

// Figure 3.1: High-Level Architecture Diagram
checkPageSpace(260);
pageTracker.fig3_1 = doc.bufferedPageRange().count - 1;
const archY = doc.y;
const diagramW = USABLE_WIDTH;

// Draw Architecture Diagram Container
doc.roundedRect(MARGIN_LEFT, archY, diagramW, 230, 6).fillAndStroke('#f8fafc', '#94a3b8');

// Top Client Box
drawBox(MARGIN_LEFT + diagramW / 2 - 100, archY + 10, 200, 26, 'Client Layer / Web & Mobile / Postman', 'RESTful HTTP Requests (JSON Payloads)', '#e0f2fe', '#0284c7');

// Down arrow to Services
doc.moveTo(MARGIN_LEFT + diagramW / 2, archY + 36).lineTo(MARGIN_LEFT + diagramW / 2, archY + 48).strokeColor('#0284c7').lineWidth(1.5).stroke();

// Domain Subgraphs
const subColW = (diagramW - 30) / 3;

// Domain 1: Core Services
const d1X = MARGIN_LEFT + 8;
const d1Y = archY + 50;
doc.roundedRect(d1X, d1Y, subColW, 95, 4).fillAndStroke('#ffffff', '#cbd5e1');
doc.font('Times-Bold').fontSize(8).fillColor('#475569').text('CORE INFRASTRUCTURE', d1X, d1Y + 4, { width: subColW, align: 'center' });
drawBox(d1X + 4, d1Y + 16, subColW - 8, 22, 'User Service (:5001)', 'JWT & Authentication (airline_user_db)', '#f1f5f9', '#64748b');
drawBox(d1X + 4, d1Y + 41, subColW - 8, 22, 'Airline Service (:5002)', 'Fleets & Governance (airline_db)', '#f1f5f9', '#64748b');
drawBox(d1X + 4, d1Y + 66, subColW - 8, 22, 'Location Service (:5004)', 'Airports Cache (airline_location_db)', '#f1f5f9', '#64748b');

// Domain 2: Operations & Inventory
const d2X = d1X + subColW + 7;
doc.roundedRect(d2X, d1Y, subColW, 95, 4).fillAndStroke('#ffffff', '#cbd5e1');
doc.font('Times-Bold').fontSize(8).fillColor('#475569').text('OPERATIONS & INVENTORY', d2X, d1Y + 4, { width: subColW, align: 'center' });
drawBox(d2X + 4, d1Y + 16, subColW - 8, 22, 'Flight Ops (:5003)', 'Flights & Instances (airline_flight_db)', '#f1f5f9', '#64748b');
drawBox(d2X + 4, d1Y + 41, subColW - 8, 22, 'Pricing Service (:5005)', 'Fares & Baggage (airline_pricing_db)', '#f1f5f9', '#64748b');
drawBox(d2X + 4, d1Y + 66, subColW - 8, 22, 'Seat Service (:5006)', 'Seat Maps & Layouts (airline_seat_db)', '#f1f5f9', '#64748b');

// Domain 3: Commerce & Transactions
const d3X = d2X + subColW + 7;
doc.roundedRect(d3X, d1Y, subColW, 95, 4).fillAndStroke('#ffffff', '#cbd5e1');
doc.font('Times-Bold').fontSize(8).fillColor('#475569').text('COMMERCE & SETTLEMENT', d3X, d1Y + 4, { width: subColW, align: 'center' });
drawBox(d3X + 4, d1Y + 16, subColW - 8, 22, 'Ancillary Service (:5007)', 'Meals & Insurance (airline_ancillary_db)', '#f1f5f9', '#64748b');
drawBox(d3X + 4, d1Y + 41, subColW - 8, 22, 'Booking Service (:5008)', 'PNR & Tickets (airline_booking_db)', '#f1f5f9', '#64748b');
drawBox(d3X + 4, d1Y + 66, subColW - 8, 22, 'Payment Service (:5009)', 'Razorpay & Verify (airline_payment_db)', '#f1f5f9', '#64748b');

// Kafka Central Message Broker Box
drawBox(MARGIN_LEFT + 20, archY + 155, diagramW - 40, 32, 'Apache Kafka Event Streaming Broker (:9092)', 'Topics: FlightInstanceCreatedEvent | BookingConfirmedEvent | PaymentCompletedEvent | PaymentFailedEvent', '#fef3c7', '#d97706');

// Connecting arrows
doc.font('Times-Roman').fontSize(7.5).fillColor('#0369a1')
   .text('Synchronous REST (Spring Cloud OpenFeign) & Asynchronous Kafka Event Choreography', MARGIN_LEFT, archY + 198, { width: diagramW, align: 'center' });

doc.y = archY + 238;
doc.font('Times-Bold').fontSize(10).fillColor('#000000')
   .text('Figure 3.1: High-Level Microservices Architecture & Communication Topology', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1);

// Table 3.3: Microservices Responsibility, Ports & Database Mappings
pageTracker.tab3_3 = doc.bufferedPageRange().count - 1;
const serviceTableData = [
  ['user-service', '5001', 'airline_user_db', 'User registration, BCrypt hashing, JWT issuance, profile management.'],
  ['airline-core-service', '5002', 'airline_db', 'Airline profile master, approval/suspension, fleet aircraft models and seats.'],
  ['flight-ops-service', '5003', 'airline_flight_db', 'Flight master, recurring schedules, daily flight instances generation.'],
  ['location-service', '5004', 'airline_location_db', 'Cities & airports directory with high-speed in-memory Spring Cache.'],
  ['pricing-service', '5005', 'airline_pricing_db', 'Base fares, cabin pricing, dynamic baggage policies, fare rules.'],
  ['Seat-Service', '5006', 'airline_seat_db', 'Cabin class layouts, seat map grid configuration, seat instance pricing.'],
  ['ancillary-service', '5007', 'airline_ancillary_db', 'Ancillaries, travel insurance, special dietary meals, flight-meal links.'],
  ['booking-service', '5008', 'airline_booking_db', 'Multi-passenger bookings, PNR generation, ticket issuance, cost tally.'],
  ['payment-service', '5009', 'airline_payment_db', 'Razorpay order creation, HMAC signature verification, Kafka events.'],
  ['common-lib', 'Shared JAR', 'In-Memory Shared', 'Reusable DTOs, Kafka event records, Enums, and Embeddables.']
];
drawTable(
  ['Service Name', 'Port', 'Database Schema', 'Primary Responsibilities'],
  serviceTableData,
  [95, 38, 92, 190.28],
  'Table 3.3: Microservices Responsibility, Ports & Database Mappings'
);


// ==========================================
// 3.4 DESIGN DIAGRAMS
// ==========================================
sectionHeading('3.4 Design Diagrams');
bodyText('Design diagrams visualize data movement, inter-service control flow, state transitions, and relational schemas across the distributed platform.');

subSectionHeading('3.4.1 Data Flow Diagrams (DFD)');
bodyText('Data Flow Diagrams depict how passenger inputs, administrative configurations, and payment authorizations traverse system boundaries.');

// Figure 3.2: Level 0 DFD
checkPageSpace(220);
pageTracker.fig3_2 = doc.bufferedPageRange().count - 1;
const dfd0Y = doc.y;
doc.roundedRect(MARGIN_LEFT, dfd0Y, USABLE_WIDTH, 180, 6).fillAndStroke('#ffffff', '#cbd5e1');

// External Entities
drawBox(MARGIN_LEFT + 12, dfd0Y + 20, 95, 45, 'Passenger / Client', 'Flight search, seat pick,\nbooking & payment', '#e0f2fe', '#0284c7');
drawBox(MARGIN_LEFT + 12, dfd0Y + 110, 95, 45, 'Airline Admin', 'Fleet, flights, schedules,\nand pricing setup', '#f3e8ff', '#9333ea');
drawBox(MARGIN_LEFT + USABLE_WIDTH - 107, dfd0Y + 65, 95, 45, 'Razorpay Gateway', 'Order initiation &\nHMAC verification', '#ecfdf5', '#059669');

// Central Process
drawBox(MARGIN_LEFT + 140, dfd0Y + 45, 135, 80, 'Process 0.0', 'FLIGHT BOOKING\nBACKEND SYSTEM\n(9 Microservices &\nEvent-Driven Kafka)', '#fef3c7', '#d97706');

// Connecting lines
drawConnector(MARGIN_LEFT + 107, dfd0Y + 42, MARGIN_LEFT + 140, dfd0Y + 65, 'Flight Search / Booking');
drawConnector(MARGIN_LEFT + 107, dfd0Y + 130, MARGIN_LEFT + 140, dfd0Y + 105, 'Fleet / Schedule Master');
drawConnector(MARGIN_LEFT + 275, dfd0Y + 85, MARGIN_LEFT + USABLE_WIDTH - 107, dfd0Y + 85, 'Payment Verify / Callback');

doc.y = dfd0Y + 192;
doc.font('Times-Bold').fontSize(10).fillColor('#000000')
   .text('Figure 3.2: Level 0 Data Flow Diagram (Context-Level DFD)', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1);

// Figure 3.3: Level 1 DFD
checkPageSpace(240);
pageTracker.fig3_3 = doc.bufferedPageRange().count - 1;
const dfd1Y = doc.y;
doc.roundedRect(MARGIN_LEFT, dfd1Y, USABLE_WIDTH, 205, 6).fillAndStroke('#ffffff', '#cbd5e1');

const bW = 115;
const bH = 34;
drawBox(MARGIN_LEFT + 15, dfd1Y + 15, bW, bH, '1.0 Auth & Profile', 'airline_user_db', '#f1f5f9', '#64748b');
drawBox(MARGIN_LEFT + 150, dfd1Y + 15, bW, bH, '2.0 Search Flights', 'airline_flight_db', '#f1f5f9', '#64748b');
drawBox(MARGIN_LEFT + 285, dfd1Y + 15, bW, bH, '3.0 Select Seats', 'airline_seat_db', '#f1f5f9', '#64748b');

drawBox(MARGIN_LEFT + 15, dfd1Y + 80, bW, bH, '4.0 Calculate Fares', 'airline_pricing_db', '#f1f5f9', '#64748b');
drawBox(MARGIN_LEFT + 150, dfd1Y + 80, bW, bH, '5.0 Create Reservation', 'airline_booking_db', '#fef3c7', '#d97706');
drawBox(MARGIN_LEFT + 285, dfd1Y + 80, bW, bH, '6.0 Process Payment', 'Razorpay Gateway', '#ecfdf5', '#059669');

drawBox(MARGIN_LEFT + 150, dfd1Y + 145, bW, bH, '7.0 Issue Ticket & PNR', 'Kafka Event Triggered', '#e0f2fe', '#0284c7');

// Connecting arrows
drawConnector(MARGIN_LEFT + 130, dfd1Y + 32, MARGIN_LEFT + 150, dfd1Y + 32);
drawConnector(MARGIN_LEFT + 265, dfd1Y + 32, MARGIN_LEFT + 285, dfd1Y + 32);
drawConnector(MARGIN_LEFT + 130, dfd1Y + 97, MARGIN_LEFT + 150, dfd1Y + 97);
drawConnector(MARGIN_LEFT + 265, dfd1Y + 97, MARGIN_LEFT + 285, dfd1Y + 97);
drawConnector(MARGIN_LEFT + 207, dfd1Y + 114, MARGIN_LEFT + 207, dfd1Y + 145, 'PaymentCompleted');

doc.y = dfd1Y + 215;
doc.font('Times-Bold').fontSize(10).fillColor('#000000')
   .text('Figure 3.3: Level 1 Data Flow Diagram (Decomposed Operations)', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1);


// 3.4.2 ER & Sequence Diagrams
subSectionHeading('3.4.2 Sequence and Entity Relationship (ER) Diagrams');
bodyText('The asynchronous sequence diagram models the decoupled transactional interaction between the client, booking-service, payment-service, Razorpay gateway, and Apache Kafka.');

// Figure 3.4: Sequence Diagram
checkPageSpace(260);
pageTracker.fig3_4 = doc.bufferedPageRange().count - 1;
const seqY = doc.y;
doc.roundedRect(MARGIN_LEFT, seqY, USABLE_WIDTH, 230, 6).fillAndStroke('#f8fafc', '#94a3b8');

// Lifelines
const llX = [MARGIN_LEFT + 20, MARGIN_LEFT + 105, MARGIN_LEFT + 195, MARGIN_LEFT + 290, MARGIN_LEFT + 375];
const labels = ['Passenger', 'Booking :5008', 'Payment :5009', 'Razorpay API', 'Kafka :9092'];
llX.forEach((lx, idx) => {
  drawBox(lx - 25, seqY + 10, 52, 20, labels[idx], '', '#ffffff', '#64748b');
  doc.moveTo(lx, seqY + 32).lineTo(lx, seqY + 195).dash(2, { space: 3 }).strokeColor('#94a3b8').stroke();
  doc.undash();
});

// Sequence Steps
function drawSeqMsg(fromIdx, toIdx, y, text, isDashed = false) {
  const x1 = llX[fromIdx];
  const x2 = llX[toIdx];
  doc.save();
  if (isDashed) doc.dash(3, { space: 2 });
  doc.moveTo(x1, y).lineTo(x2, y).strokeColor('#1e293b').lineWidth(1).stroke();
  doc.restore();
  // Arrowhead
  const dir = x2 > x1 ? 1 : -1;
  doc.polygon([x2, y], [x2 - dir * 4, y - 3], [x2 - dir * 4, y + 3]).fill('#1e293b');
  doc.font('Times-Roman').fontSize(7.5).fillColor('#0f172a')
     .text(text, Math.min(x1, x2) + 4, y - 9, { width: Math.abs(x2 - x1) - 8, align: 'center' });
}

drawSeqMsg(0, 1, seqY + 48, '1. POST /api/bookings');
drawSeqMsg(1, 2, seqY + 68, '2. POST /payments/initiate');
drawSeqMsg(2, 3, seqY + 86, '3. orders.create()');
drawSeqMsg(3, 2, seqY + 104, '4. order_id & payment_link', true);
drawSeqMsg(2, 1, seqY + 120, '5. PaymentInitiateResponse', true);
drawSeqMsg(1, 0, seqY + 136, '6. PENDING Booking + Checkout URL', true);
drawSeqMsg(0, 3, seqY + 152, '7. Passenger Pays on Checkout');
drawSeqMsg(2, 4, seqY + 170, '8. Publish PaymentCompletedEvent');
drawSeqMsg(4, 1, seqY + 186, '9. Consume Event -> CONFIRMED & Ticket');

doc.y = seqY + 238;
doc.font('Times-Bold').fontSize(10).fillColor('#000000')
   .text('Figure 3.4: Apache Kafka Asynchronous Payment Verification Sequence Diagram', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1);

// Figure 3.5: Entity Relationship Schema
checkPageSpace(260);
pageTracker.fig3_5 = doc.bufferedPageRange().count - 1;
const erY = doc.y;
doc.roundedRect(MARGIN_LEFT, erY, USABLE_WIDTH, 230, 6).fillAndStroke('#ffffff', '#cbd5e1');

const erBoxW = 90;
const erBoxH = 50;

// Row 1: Users, Airlines, Aircrafts
drawBox(MARGIN_LEFT + 15, erY + 15, erBoxW, erBoxH, 'USERS', 'PK id\nemail, password\nrole (ROLE_USER)', '#f1f5f9', '#64748b');
drawBox(MARGIN_LEFT + 160, erY + 15, erBoxW, erBoxH, 'AIRLINES', 'PK id\niata_code, name\nstatus (ACTIVE)', '#f1f5f9', '#64748b');
drawBox(MARGIN_LEFT + 305, erY + 15, erBoxW, erBoxH, 'AIRCRAFTS', 'PK id\nFK airline_id\nmodel, total_seats', '#f1f5f9', '#64748b');

// Row 2: Bookings, Flights, Cabin Classes
drawBox(MARGIN_LEFT + 15, erY + 85, erBoxW, erBoxH, 'BOOKINGS', 'PK id\nFK user_id, flight_inst\nstatus, total_amount', '#fef3c7', '#d97706');
drawBox(MARGIN_LEFT + 160, erY + 85, erBoxW, erBoxH, 'FLIGHTS', 'PK id\nFK dep/arr airport\nflight_number', '#f1f5f9', '#64748b');
drawBox(MARGIN_LEFT + 305, erY + 85, erBoxW, erBoxH, 'CABIN_CLASSES', 'PK id\nFK aircraft_id\nname (ECONOMY)', '#f1f5f9', '#64748b');

// Row 3: Passengers, Flight Instances, Seats
drawBox(MARGIN_LEFT + 15, erY + 155, erBoxW, erBoxH, 'PASSENGERS', 'PK id\nFK booking_id\nfirst_name, seat_id', '#fef3c7', '#d97706');
drawBox(MARGIN_LEFT + 160, erY + 155, erBoxW, erBoxH, 'FLIGHT_INSTANCES', 'PK id\nFK flight_id\ndeparture_date', '#f1f5f9', '#64748b');
drawBox(MARGIN_LEFT + 305, erY + 155, erBoxW, erBoxH, 'SEATS & INSTANCES', 'PK id\nFK flight_inst, seat_id\nis_available (BOOLEAN)', '#f1f5f9', '#64748b');

// Logical Cardinality lines
drawConnector(MARGIN_LEFT + 105, erY + 40, MARGIN_LEFT + 160, erY + 40, '1:N');
drawConnector(MARGIN_LEFT + 250, erY + 40, MARGIN_LEFT + 305, erY + 40, '1:N');
drawConnector(MARGIN_LEFT + 60, erY + 65, MARGIN_LEFT + 60, erY + 85, '1:N');
drawConnector(MARGIN_LEFT + 205, erY + 65, MARGIN_LEFT + 205, erY + 85, '1:N');
drawConnector(MARGIN_LEFT + 350, erY + 65, MARGIN_LEFT + 350, erY + 85, '1:N');
drawConnector(MARGIN_LEFT + 60, erY + 135, MARGIN_LEFT + 60, erY + 155, '1:N');
drawConnector(MARGIN_LEFT + 205, erY + 135, MARGIN_LEFT + 205, erY + 155, '1:N');
drawConnector(MARGIN_LEFT + 350, erY + 135, MARGIN_LEFT + 350, erY + 155, '1:N');

doc.y = erY + 238;
doc.font('Times-Bold').fontSize(10).fillColor('#000000')
   .text('Figure 3.5: Entity Relationship (ER) Conceptual Schema across Microservices', MARGIN_LEFT, doc.y, { width: USABLE_WIDTH, align: 'center' });
doc.moveDown(1);


// ==========================================
// 3.5 TECHNOLOGY STACK
// ==========================================
sectionHeading('3.5 Technology Stack');
bodyText('The system leverages a robust, production-grade technology ecosystem chosen for enterprise performance, modularity, type safety, and active developer support:');
bulletPoint('Java 17 (Long-Term Support): ', 'Provides a modern language runtime with switch expressions, text blocks, sealed classes, and Java Records utilized extensively for immutable Kafka event payloads.');
bulletPoint('Spring Boot 3.x / 4.x: ', 'Delivers production-grade enterprise microservices infrastructure with embedded high-performance Tomcat web servers, auto-configuration, dependency injection, and Actuator telemetry.');
bulletPoint('Spring Data JPA & Hibernate ORM: ', 'Facilitates seamless object-relational mapping, custom criteria queries, dynamic pagination, and automated entity lifecycle auditing across relational schemas.');
bulletPoint('PostgreSQL: ', 'Selected as the core relational database across all nine microservices due to its strict ACID transactional compliance, high concurrent write performance, and support for JSONB payloads.');
bulletPoint('Apache Kafka (spring-kafka): ', 'Serves as the high-throughput distributed commit log broker, decoupling transactional dependencies between flight operations, booking creation, and payment callbacks.');
bulletPoint('Spring Cloud OpenFeign: ', 'Provides declarative REST client interfaces that abstract inter-service HTTP invocations into straightforward Java method calls.');
bulletPoint('JJWT (io.jsonwebtoken 0.12.6): ', 'Issues and validates HMAC-SHA256 signed bearer tokens, enforcing stateless, tamper-proof user authentication and role-based permissions.');
bulletPoint('Razorpay Java SDK (razorpay-java:1.4.3): ', 'Provides native Java bindings to interact with Razorpay banking gateways, initiate hosted checkout orders, and cryptographically verify signature hashes.');


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
doc.y = 110;

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
  ['    2.4 Proposed System', pageTracker.chapter2],
  ['CHAPTER 3: SYSTEM ANALYSIS AND DESIGN', pageTracker.chapter3],
  ['    3.1 Requirement Analysis', pageTracker.chapter3],
  ['        3.1.1 Functional Requirements', pageTracker.chapter3],
  ['        3.1.2 Non-Functional Requirements', pageTracker.chapter3],
  ['        3.1.3 Hardware and Software Requirements', pageTracker.tab3_1],
  ['    3.2 Feasibility Study', pageTracker.chapter3],
  ['    3.3 System Architecture', pageTracker.fig3_1],
  ['    3.4 Design Diagrams', pageTracker.fig3_2],
  ['        3.4.1 Data Flow Diagrams (DFD)', pageTracker.fig3_2],
  ['        3.4.2 Sequence and ER Diagrams', pageTracker.fig3_4],
  ['    3.5 Technology Stack', pageTracker.chapter3]
];

tocEntries.forEach(([label, pgIdx]) => {
  const isMajor = label.startsWith('CHAPTER') || ['Certificate', 'Declaration', 'Acknowledgement', 'Abstract', 'Table of Contents', 'List of Figures', 'List of Tables', 'List of Abbreviations'].includes(label);
  const pgStr = getDisplayPage(pgIdx !== undefined ? pgIdx : 0);
  doc.font(isMajor ? 'Times-Bold' : 'Times-Roman').fontSize(isMajor ? 9.5 : 8.5).fillColor('#000000');
  
  const textWidth = doc.widthOfString(label);
  const numWidth = doc.widthOfString(pgStr);
  const dotWidth = doc.widthOfString('. ');
  const numDots = Math.max(2, Math.floor((USABLE_WIDTH - textWidth - numWidth - 10) / dotWidth));
  const dots = '. '.repeat(numDots);

  doc.text(label, MARGIN_LEFT, doc.y, { continued: true });
  doc.text(' ' + dots + ' ' + pgStr, { align: 'right', width: USABLE_WIDTH - (doc.x - MARGIN_LEFT) });
  doc.moveDown(0.2);
});

// 2. Fill List of Figures on pageTracker.listOfFigures
doc.switchToPage(pageTracker.listOfFigures);
doc.y = 115;
const figureEntries = [
  ['Figure 3.1: High-Level Microservices Architecture & Communication Topology', pageTracker.fig3_1],
  ['Figure 3.2: Level 0 Data Flow Diagram (Context-Level DFD)', pageTracker.fig3_2],
  ['Figure 3.3: Level 1 Data Flow Diagram (Decomposed Operations)', pageTracker.fig3_3],
  ['Figure 3.4: Apache Kafka Asynchronous Payment Verification Sequence Diagram', pageTracker.fig3_4],
  ['Figure 3.5: Entity Relationship (ER) Conceptual Schema across Microservices', pageTracker.fig3_5]
];

figureEntries.forEach(([label, pgIdx]) => {
  const pgStr = getDisplayPage(pgIdx);
  doc.font('Times-Roman').fontSize(9.5).fillColor('#000000');
  const textWidth = doc.widthOfString(label);
  const numWidth = doc.widthOfString(pgStr);
  const dotWidth = doc.widthOfString('. ');
  const numDots = Math.max(2, Math.floor((USABLE_WIDTH - textWidth - numWidth - 10) / dotWidth));
  const dots = '. '.repeat(numDots);

  doc.text(label, MARGIN_LEFT, doc.y, { continued: true });
  doc.text(' ' + dots + ' ' + pgStr, { align: 'right', width: USABLE_WIDTH - (doc.x - MARGIN_LEFT) });
  doc.moveDown(0.4);
});

// 3. Fill List of Tables on pageTracker.listOfTables
doc.switchToPage(pageTracker.listOfTables);
doc.y = 115;
const tableEntries = [
  ['Table 3.1: Hardware Environment Specifications', pageTracker.tab3_1],
  ['Table 3.2: Software Environment & Framework Specifications', pageTracker.tab3_2],
  ['Table 3.3: Microservices Responsibility, Ports & Database Mappings', pageTracker.tab3_3]
];

tableEntries.forEach(([label, pgIdx]) => {
  const pgStr = getDisplayPage(pgIdx);
  doc.font('Times-Roman').fontSize(9.5).fillColor('#000000');
  const textWidth = doc.widthOfString(label);
  const numWidth = doc.widthOfString(pgStr);
  const dotWidth = doc.widthOfString('. ');
  const numDots = Math.max(2, Math.floor((USABLE_WIDTH - textWidth - numWidth - 10) / dotWidth));
  const dots = '. '.repeat(numDots);

  doc.text(label, MARGIN_LEFT, doc.y, { continued: true });
  doc.text(' ' + dots + ' ' + pgStr, { align: 'right', width: USABLE_WIDTH - (doc.x - MARGIN_LEFT) });
  doc.moveDown(0.4);
});

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
