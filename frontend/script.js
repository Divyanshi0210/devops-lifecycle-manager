
const API = "http://localhost:3001";

// Load dashboard statistics
async function loadStats() {
    try {
        const response = await fetch(`${API}/api/stats`);

        if (!response.ok) {
            throw new Error("Unable to fetch statistics");
        }

        const data = await response.json();

        document.getElementById("projectCount").textContent =
            String(data.totalProjects).padStart(2, "0");

        document.getElementById("pipelineCount").textContent =
            String(data.pipelineRuns).padStart(2, "0");

        document.getElementById("containerCount").textContent =
            String(data.activeContainers).padStart(2, "0");

        document.getElementById("deploymentCount").textContent =
            String(data.deployments).padStart(2, "0");

    } catch (error) {
        console.error("Statistics Error:", error);
    }
}


// Check backend health
async function checkHealth() {
    const backendStatus = document.getElementById("backendHealth");
    const frontendStatus = document.getElementById("frontendHealth");
    const overallHealth = document.getElementById("overallHealth");

    frontendStatus.textContent = "Online";

    try {
        const response = await fetch(`${API}/api/health`);

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const data = await response.json();

        backendStatus.textContent = data.status;
        backendStatus.className = "health-value";

        overallHealth.textContent = "Healthy";

    } catch (error) {
        backendStatus.textContent = "Offline";
        backendStatus.className = "health-value pending";

        overallHealth.textContent = "Issue Detected";

        console.error("Health Check Error:", error);
    }
}


// Run pipeline API demonstration
const pipelineBtn = document.getElementById("pipelineBtn");

pipelineBtn.addEventListener("click", async () => {

    pipelineBtn.disabled = true;
    pipelineBtn.textContent = "Checking...";

    try {
        const response = await fetch(`${API}/api/pipeline`);

        if (!response.ok) {
            throw new Error("Pipeline API failed");
        }

        const data = await response.json();

        document.getElementById("pipelineStatus").textContent =
            data.status;

        document.getElementById("pipelineMessage").textContent =
            "Backend responded successfully. Real CI/CD automation will be integrated later.";

        await loadStats();

    } catch (error) {
        document.getElementById("pipelineMessage").textContent =
            "Backend connection failed. Please check your server.";
    }

    pipelineBtn.disabled = false;
    pipelineBtn.innerHTML =
        '<i data-lucide="play"></i> Run Pipeline';

    if (window.lucide) {
        lucide.createIcons();
    }
});


// New Project button
document.getElementById("newProjectBtn").addEventListener("click", () => {
    window.location.href = "projects.html";
});


// View Pipeline button
document.getElementById("viewPipelineBtn").addEventListener("click", () => {
    document.querySelector(".pipeline-panel").scrollIntoView({
        behavior: "smooth"
    });
});


// Monitoring button
document.getElementById("monitorBtn").addEventListener("click", () => {
    alert("Real-time monitoring integration will be added soon!");
});


// Load data when dashboard opens
loadStats();
checkHealth();
