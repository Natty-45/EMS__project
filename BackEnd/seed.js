import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";
import Event from "./models/event.model.js";
import RequestedEvent from "./models/requestedEvent.model.js";
import Ticket from "./models/ticket.model.js";

dotenv.config();

const day = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(Date.now() + n * day);
const daysAgo = (n) => new Date(Date.now() - n * day);

const UPLOAD_IMAGES = [
  "1753350984602.png",
  "1753350982867.jpg",
  "1753350981527.jpg",
  "1753301755681.png",
  "1753301737604.png",
  "1753301724767.png",
  "1753301717198.png",
  "1753301672284.jpg",
  "1753301188137.png",
  "1753301156199.png",
];

const eventsData = [
  {
    title: "Annual Leadership Summit",
    description: "A full-day summit bringing together industry leaders to discuss the future of work, innovation and leadership strategies. Keynote sessions, panel discussions and networking breaks included.",
    date: daysFromNow(7),
    StartTime: "09:00 AM",
    location: "Grand Hyatt Convention Center",
    eventType: "Public",
    eventCategory: "Conference",
    eventStatus: "Active",
    host: "EMS Events Team",
    images: [UPLOAD_IMAGES[0], UPLOAD_IMAGES[1]],
  },
  {
    title: "Corporate Team Building Retreat",
    description: "An action-packed weekend of outdoor activities, workshops and games designed to strengthen team bonds and build company culture. Lunch and transport provided.",
    date: daysFromNow(14),
    StartTime: "08:30 AM",
    location: "Lakeview Resort & Spa",
    eventType: "Public",
    eventCategory: "Party",
    eventStatus: "Active",
    host: "HR Department",
    images: [UPLOAD_IMAGES[2]],
  },
  {
    title: "Tech Conference 2026",
    description: "The biggest tech conference of the year with 40+ speakers, hands-on workshops and an expo hall featuring the latest innovations in AI, cloud and software engineering.",
    date: daysFromNow(21),
    StartTime: "10:00 AM",
    location: "Metro Expo Hall",
    eventType: "Public",
    eventCategory: "Conference",
    eventStatus: "Active",
    host: "Tech Innovators Inc.",
    images: [UPLOAD_IMAGES[3], UPLOAD_IMAGES[4]],
  },
  {
    title: "Summer Music Festival",
    description: "An electrifying open-air music festival featuring 15 live bands, food trucks and a night market. VIP areas available with premium seating and refreshments.",
    date: daysFromNow(10),
    StartTime: "04:00 PM",
    location: "City Park Amphitheater",
    eventType: "Public",
    eventCategory: "Concert",
    eventStatus: "Active",
    host: "SoundWave Productions",
    images: [UPLOAD_IMAGES[5]],
  },
  {
    title: "Annual Company Gala Dinner",
    description: "A glamorous black-tie gala celebrating our company's achievements over the past year. Fine dining, live orchestra and awards ceremony included.",
    date: daysFromNow(30),
    StartTime: "07:00 PM",
    location: "Royal Palace Ballroom",
    eventType: "Private",
    eventCategory: "Party",
    eventStatus: "Active",
    host: "Executive Board",
    bookingCode: "GALA2026",
    images: [UPLOAD_IMAGES[6], UPLOAD_IMAGES[7]],
  },
  {
    title: "Wedding Expo 2026",
    description: "Discover the latest wedding trends, meet top vendors and plan your dream wedding. Exhibitors, live demos and exclusive show-day discounts.",
    date: daysFromNow(45),
    StartTime: "11:00 AM",
    location: "Downtown Exhibition Center",
    eventType: "Public",
    eventCategory: "Wedding",
    eventStatus: "Pending",
    host: "DreamWeddings Co.",
    images: [UPLOAD_IMAGES[8]],
  },
  {
    title: "Marketing Masterclass Workshop",
    description: "Hands-on workshop covering modern digital marketing strategies: SEO, social media, content creation and analytics. Certificate provided at the end.",
    date: daysFromNow(18),
    StartTime: "02:00 PM",
    location: "Innovation Hub Meeting Room B",
    eventType: "Public",
    eventCategory: "Conference",
    eventStatus: "Active",
    host: "Growth Academy",
    images: [UPLOAD_IMAGES[9]],
  },
  {
    title: "New Year Countdown Party",
    description: "Ring in the new year with a spectacular rooftop party featuring DJ sets, fireworks and a champagne toast at midnight. Open bar for VIP ticket holders.",
    date: daysAgo(45),
    StartTime: "10:00 PM",
    location: "Skyline Rooftop Lounge",
    eventType: "Public",
    eventCategory: "Party",
    eventStatus: "Ended",
    host: "Skyline Events",
    images: [UPLOAD_IMAGES[0], UPLOAD_IMAGES[5]],
  },
  {
    title: "Charity Fundraising Gala",
    description: "An elegant evening of dinner and live auctions raising funds for local children's education programs. All proceeds go directly to the cause.",
    date: daysFromNow(60),
    StartTime: "06:30 PM",
    location: "Grand Hotel Ballroom",
    eventType: "Private",
    eventCategory: "Others",
    eventStatus: "Active",
    host: "Hope Foundation",
    bookingCode: "HOPE2026",
    images: [UPLOAD_IMAGES[1], UPLOAD_IMAGES[3]],
  },
  {
    title: "Product Launch: Nova X1",
    description: "Join us for the official unveiling of our flagship product Nova X1. Live demo, Q&A session with the founders and hands-on experience zone.",
    date: daysFromNow(5),
    StartTime: "05:00 PM",
    location: "Tech Plaza Auditorium",
    eventType: "Public",
    eventCategory: "Conference",
    eventStatus: "Active",
    host: "Nova Technologies",
    images: [UPLOAD_IMAGES[4]],
  },
  {
    title: "Jazz Night Under the Stars",
    description: "An intimate evening of live jazz performed by award-winning artists under the open sky. Candlelit tables, gourmet appetizers and fine wine.",
    date: daysFromNow(12),
    StartTime: "08:00 PM",
    location: "Botanical Garden Terrace",
    eventType: "Public",
    eventCategory: "Concert",
    eventStatus: "Pending",
    host: "Blue Note Events",
    images: [UPLOAD_IMAGES[2], UPLOAD_IMAGES[7]],
  },
];

const requestedEventsData = [
  {
    title: "Quarterly Product Roadmap Review",
    description: "Internal session to review the product roadmap for the next quarter with stakeholders. Attendance is by invitation only.",
    date: daysFromNow(9),
    StartTime: "01:00 PM",
    location: "HQ Conference Room 3",
    eventType: "Private",
    eventCategory: "Conference",
    eventStatus: "Pending",
    requestEventStatus: "Pending",
    host: "Product Team",
    bookingCode: "ROADMAP",
    images: [UPLOAD_IMAGES[6]],
  },
  {
    title: "Employee Wellness Day",
    description: "A relaxing day of yoga sessions, meditation workshops and health screenings for all employees. Refreshments provided.",
    date: daysFromNow(25),
    StartTime: "09:30 AM",
    location: "Wellness Center Park",
    eventType: "Public",
    eventCategory: "Others",
    eventStatus: "Pending",
    requestEventStatus: "Pending",
    host: "People Operations",
    images: [UPLOAD_IMAGES[8]],
  },
];

const usersData = [
  {
    fullName: "System Super Admin",
    username: "superadmin",
    email: "superadmin@ems.com",
    password: "Super@1234",
    role: "superAdmin",
  },
  {
    fullName: "Event Admin",
    username: "admin",
    email: "admin@ems.com",
    password: "Admin@1234",
    role: "Admin",
  },
  {
    fullName: "Alice Johnson",
    username: "alice",
    email: "alice@ems.com",
    password: "User@1234",
    role: "user",
  },
  {
    fullName: "Bob Smith",
    username: "bob",
    email: "bob@ems.com",
    password: "User@1234",
    role: "user",
  },
  {
    fullName: "Carol Martinez",
    username: "carol",
    email: "carol@ems.com",
    password: "User@1234",
    role: "user",
  },
  {
    fullName: "David Lee",
    username: "david",
    email: "david@ems.com",
    password: "User@1234",
    role: "user",
  },
  {
    fullName: "Emma Wilson",
    username: "emma",
    email: "emma@ems.com",
    password: "User@1234",
    role: "user",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      RequestedEvent.deleteMany({}),
      Ticket.deleteMany({}),
    ]);

    console.log("Seeding users...");
    const users = [];
    for (const data of usersData) {
      const hashedPassword = bcrypt.hashSync(data.password, 10);
      const user = await User.create({
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        isVerified: true,
      });
      users.push(user);
      console.log(`  ✔ ${data.role.padEnd(10)} ${data.username} (${data.email})`);
    }

    const admin = users.find((u) => u.role === "Admin");
    const regularUsers = users.filter((u) => u.role === "user");

    console.log("Seeding events...");
    const events = [];
    for (const data of eventsData) {
      const event = await Event.create({
        title: data.title,
        description: data.description,
        date: data.date,
        StartTime: data.StartTime,
        location: data.location,
        image: data.images,
        eventType: data.eventType,
        eventCategory: data.eventCategory,
        eventStatus: data.eventStatus,
        host: data.host,
        createdBy: admin._id,
        bookingCode: data.bookingCode,
        locked: data.eventStatus === "Active",
      });
      events.push(event);
      console.log(`  ✔ ${data.eventStatus.padEnd(9)} ${data.title}`);
    }

    console.log("Seeding requested events (pending admin approval)...");
    const requestedEvents = [];
    for (let i = 0; i < requestedEventsData.length; i++) {
      const data = requestedEventsData[i];
      const requester = regularUsers[i % regularUsers.length];
      const requested = await RequestedEvent.create({
        title: data.title,
        description: data.description,
        date: data.date,
        StartTime: data.StartTime,
        location: data.location,
        image: data.images,
        eventType: data.eventType,
        eventCategory: data.eventCategory,
        eventStatus: data.eventStatus,
        requestEventStatus: data.requestEventStatus,
        host: data.host,
        bookingCode: data.bookingCode,
        requester: requester._id,
      });
      requestedEvents.push(requested);
      console.log(`  ✔ Pending   ${data.title} (requested by ${requester.username})`);
    }

    console.log("Seeding tickets...");
    const bookableEvents = events.filter((e) => e.eventStatus === "Active");
    let ticketCount = 0;
    for (let i = 0; i < regularUsers.length; i++) {
      const user = regularUsers[i];
      const event = bookableEvents[i % bookableEvents.length];
      const ticketType = i % 2 === 0 ? "Regular" : "VIP";
      const numberOfTickets = (i % 3) + 1;
      await Ticket.create({
        eventId: event._id,
        userId: user._id,
        ticketType,
        ticketPrice: ticketType === "VIP" ? 25 * numberOfTickets : 0,
        status: "Booked",
        numberOfTickets,
        bookingDate: daysAgo(i + 2),
      });
      ticketCount += numberOfTickets;
      console.log(`  ✔ ${ticketType.padEnd(7)} x${numberOfTickets} — ${user.username} → "${event.title}"`);
    }

    await mongoose.disconnect();
    console.log("\n✅ Seed completed successfully!");
    console.log("\n================ CREDENTIALS ================");
    console.log("  superAdmin : superadmin / Super@1234");
    console.log("  Admin      : admin / Admin@1234");
    console.log("  users      : alice, bob, carol, david, emma / User@1234");
    console.log("==============================================");
    console.log(`\nSeeded: ${users.length} users, ${events.length} events, ${requestedEvents.length} requested events, ${ticketCount} tickets.`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();