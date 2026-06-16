const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Default starting data
const DEFAULT_SERVICES = [
    {
        id: "serv_1",
        icon: "fa-solid fa-code",
        title: "Web Development",
        description: "Engineering full-scale, fast-loading, and responsive web applications utilizing robust frontend and backend frameworks.",
        details: "Full-stack application development, RESTful APIs, SQL/NoSQL integrations, and secure authentication models.",
        order: 1
    },
    {
        id: "serv_2",
        icon: "fa-solid fa-laptop-code",
        title: "Frontend Design",
        description: "Designing gorgeous user interfaces featuring premium glassmorphism layouts, fluid micro-interactions, and custom keyframes.",
        details: "Clean layout styling, custom CSS architectures, Figma to responsive HTML/React compilations, and CSS Grid systems.",
        order: 2
    },
    {
        id: "serv_3",
        icon: "fa-solid fa-database",
        title: "Backend & APIs",
        description: "Building highly secure server structures, optimized database schemas, transaction managers, and modern cloud logic.",
        details: "Node.js/Express frameworks, robust database query optimizations, state management setups, and API security practices.",
        order: 3
    },
    {
        id: "serv_4",
        icon: "fa-solid fa-mobile-screen-button",
        title: "Responsive Tuning",
        description: "Optimizing layouts to compile flawlessly across a diverse array of mobile devices, tablets, and large screen monitors.",
        details: "Mobile-first viewport frameworks, flexible image scaling, responsive fluid grids, and touch gesture interactions.",
        order: 4
    },
    {
        id: "serv_5",
        icon: "fa-solid fa-shield-halved",
        title: "Security Audits",
        description: "Implementing state-of-the-art authentication protocols, session protection systems, and standard database encryption.",
        details: "Secure login sessions, input sanitization routines, CORS configurations, and sensitive database parameter storage.",
        order: 5
    },
    {
        id: "serv_6",
        icon: "fa-solid fa-cloud",
        title: "Cloud Deployment",
        description: "Setting up CI/CD workflows, automated build scripts, and deploying static or full stack nodes to modern servers.",
        details: "Cloud hosting deployment platforms (Vercel, Render), Github Action integrations, and domain manager setups.",
        order: 6
    }
];

const DEFAULT_SKILLS = [
    { id: "skill_1", name: "HTML5 & CSS3", percent: 95, order: 1 },
    { id: "skill_2", name: "JavaScript (ES6+)", percent: 90, order: 2 },
    { id: "skill_3", name: "React.js", percent: 85, order: 3 },
    { id: "skill_4", name: "Node.js & Express", percent: 80, order: 4 },
    { id: "skill_5", name: "MongoDB & PostgreSQL", percent: 75, order: 5 },
    { id: "skill_6", name: "Git & Web Deployment", percent: 85, order: 6 }
];

const DEFAULT_PROJECTS = [
    {
        id: "proj_1",
        title: "CampChat - Campus Social Media App",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        video: "",
        github: "https://github.com/vishal-prajapati/campchat",
        demo: "https://campchat-media.vercel.app",
        description: "A secure and vibrant social connection platform specifically designed for campus university students. Features rich text messaging, post attachments, like systems, and user profiles.",
        createdAt: Date.now() - 30000
    },
    {
        id: "proj_2",
        title: "DevQuest - Tech Learning Hub",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
        video: "",
        github: "https://github.com/vishal-prajapati/devquest",
        demo: "",
        description: "An gamified online learning web application with interactive programming pathways. Built utilizing React, Node.js, and complex SQL transaction engines.",
        createdAt: Date.now() - 20000
    },
    {
        id: "proj_3",
        title: "AuraUI - Glassmorphism System",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        video: "",
        github: "https://github.com/vishal-prajapati/auraui",
        demo: "https://aura-ui-glass.vercel.app",
        description: "A lightweight, modern utility CSS/JS component framework based purely on premium frosted glassmorphism elements, micro-interactions, and pre-built responsive components.",
        createdAt: Date.now() - 10000
    }
];

const DEFAULT_CONTACT_INFO = {
    email: "vishal@gmail.com",
    phone: "+91 9876543210",
    location: "Mumbai, India",
    availability: "Mon – Sat, 10am – 8pm IST"
};

// Initialize database file
function initDb() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DB_PATH)) {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPasswordRaw = process.env.ADMIN_PASSWORD || 'admin124';
        const salt = bcrypt.genSaltSync(10);
        const adminPasswordHash = bcrypt.hashSync(adminPasswordRaw, salt);

        const initialDb = {
            services: DEFAULT_SERVICES,
            skills: DEFAULT_SKILLS,
            projects: DEFAULT_PROJECTS,
            messages: [],
            contactInfo: DEFAULT_CONTACT_INFO,
            admin: {
                username: adminUsername,
                passwordHash: adminPasswordHash
            }
        };

        fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 4), 'utf8');
        console.log("Database initialized and seeded successfully.");
    }
}

// Read database
function readDb() {
    initDb();
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Write database
function writeDb(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4), 'utf8');
}

module.exports = {
    readDb,
    writeDb
};
