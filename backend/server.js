
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Temporary project storage
let projects = [
    {
        id: 1,
        name: "DevOpsFlow",
        description: "DevOps lifecycle management platform",
        technology: "Node.js, Express",
        status: "Active"
    },
    {
        id: 2,
        name: "Netflix Clone",
        description: "Streaming website with DevOps pipeline",
        technology: "HTML, CSS, JavaScript",
        status: "Planning"
    }
];

// HOME API
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to DevOpsFlow Backend!",
        status: "Running"
    });
});

// HEALTH CHECK API
app.get("/api/health", (req, res) => {
    res.json({
        status: "Healthy",
        application: "DevOpsFlow",
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// DASHBOARD STATISTICS API
app.get("/api/stats", (req, res) => {
    res.json({
        totalProjects: projects.length,
        pipelineRuns: 19,
        activeContainers: 0,
        deployments: 0
    });
});

// GET ALL PROJECTS
app.get("/api/projects", (req, res) => {
    res.json(projects);
});

// ADD NEW PROJECT
app.post("/api/projects", (req, res) => {
    const { name, description, technology } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            message: "Project name is required"
        });
    }

    const project = {
        id: Date.now(),
        name: name.trim(),
        description: description || "",
        technology: technology || "Not specified",
        status: "Active"
    };

    projects.push(project);

    res.status(201).json({
        message: "Project created successfully",
        project
    });
});

// DELETE PROJECT
app.delete("/api/projects/:id", (req, res) => {
    const id = Number(req.params.id);

    const previousLength = projects.length;

    projects = projects.filter(project => project.id !== id);

    if (projects.length === previousLength) {
        return res.status(404).json({
            message: "Project not found"
        });
    }

    res.json({
        message: "Project deleted successfully"
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`DevOpsFlow backend running on port ${PORT}`);
});
