
const API = "http://localhost:3001";

const projectForm = document.getElementById("projectForm");
const projectFormPanel = document.getElementById("projectFormPanel");
const projectsList = document.getElementById("projectsList");

const openFormBtn = document.getElementById("openFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");

openFormBtn.addEventListener("click", () => {
    projectFormPanel.hidden = false;
    projectFormPanel.scrollIntoView({ behavior: "smooth" });
});

cancelFormBtn.addEventListener("click", () => {
    projectFormPanel.hidden = true;
    projectForm.reset();
});


// Load projects from backend
async function loadProjects() {
    try {
        const response = await fetch(`${API}/api/projects`);

        if (!response.ok) {
            throw new Error("Unable to load projects");
        }

        const projects = await response.json();

        projectsList.innerHTML = "";

        if (projects.length === 0) {
            projectsList.innerHTML = "<p>No projects found. Create your first project!</p>";
        }

        projects.forEach(project => {
            const card = document.createElement("div");
            card.className = "project-card";

            const title = document.createElement("h3");
            title.textContent = project.name;

            const description = document.createElement("p");
            description.textContent = project.description || "No description provided";

            const technology = document.createElement("p");
            technology.textContent = "Technology: " + project.technology;

            const status = document.createElement("small");
            status.textContent = "● " + project.status;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete Project";

            deleteButton.addEventListener("click", () => {
                deleteProject(project.id);
            });

            card.append(title, description, technology, status, deleteButton);
            projectsList.appendChild(card);
        });

        document.getElementById("totalProjects").textContent = projects.length;

        document.getElementById("activeProjects").textContent =
            projects.filter(p => p.status === "Active").length;

        document.getElementById("planningProjects").textContent =
            projects.filter(p => p.status === "Planning").length;

        document.getElementById("backendStatus").textContent = "Online";

        document.getElementById("projectLoadStatus").textContent = "Connected";

    } catch (error) {
        projectsList.textContent = "Unable to connect to backend. Please start your server.";

        document.getElementById("backendStatus").textContent = "Offline";
        document.getElementById("projectLoadStatus").textContent = "Offline";

        console.error(error);
    }
}


// Add project
projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const project = {
        name: document.getElementById("projectName").value,
        description: document.getElementById("projectDescription").value,
        technology: document.getElementById("projectTechnology").value
    };

    const message = document.getElementById("formMessage");

    try {
        const response = await fetch(`${API}/api/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(project)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Project creation failed");
        }

        message.textContent = "Project created successfully!";
        message.style.color = "#32d69a";

        projectForm.reset();

        await loadProjects();

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "#ff7070";
    }
});


// Delete project
async function deleteProject(id) {
    if (!confirm("Are you sure you want to delete this project?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/api/projects/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        alert("Project deleted successfully!");

        await loadProjects();

    } catch (error) {
        alert(error.message);
    }
}


// Initial loading
loadProjects();
