
const form = document.getElementById("pipelineForm");
const message = document.getElementById("pipelineMessage");
const runsContainer = document.getElementById("workflowRuns");

let connectedRepository = null;

function parseRepository(url) {
    const parsed = new URL(url);

    if (parsed.hostname !== "github.com") {
        throw new Error("Please enter a valid GitHub repository URL.");
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
        throw new Error("Please enter a repository URL.");
    }

    return {
        owner: parts[0],
        repo: parts[1].replace(/\.git$/i, "")
    };
}

async function loadWorkflowRuns() {
    if (!connectedRepository) return;

    const { owner, repo } = connectedRepository;

    runsContainer.textContent = "Loading workflow runs...";

    try {
        const response = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs?per_page=10`,
            {
                headers: {
                    "Accept": "application/vnd.github+json"
                }
            }
        );

        if (response.status === 403 || response.status === 429) {
            throw new Error("GitHub API rate limit reached. Try again later.");
        }

        if (!response.ok) {
            throw new Error("Unable to load workflow runs. Check repository access.");
        }

        const data = await response.json();
        const runs = data.workflow_runs || [];

        document.getElementById("totalRuns").textContent =
            data.total_count ?? runs.length;

        document.getElementById("successfulRuns").textContent =
            runs.filter(run => run.conclusion === "success").length;

        document.getElementById("failedRuns").textContent =
            runs.filter(run => run.conclusion === "failure").length;

        document.getElementById("runningRuns").textContent =
            runs.filter(run => run.status !== "completed").length;

        document.getElementById("runStatus").textContent =
            runs.length ? "Connected" : "No runs";

        runsContainer.replaceChildren();

        if (runs.length === 0) {
            runsContainer.textContent =
                "No GitHub Actions runs found. This repository may not have a workflow configured yet.";
            return;
        }

        runs.forEach(run => {
            const item = document.createElement("div");
            item.className = "workflow-run";

            const details = document.createElement("div");

            const title = document.createElement("strong");
            title.textContent = run.name || "GitHub Actions Workflow";

            const info = document.createElement("small");
            info.textContent =
                `${run.head_branch || "Unknown branch"} · ${new Date(run.created_at).toLocaleString()}`;

            const link = document.createElement("a");
            link.href = run.html_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "View run";

            details.append(title, info, link);

            const badge = document.createElement("span");
            badge.className = "run-badge";

            if (run.status !== "completed") {
                badge.classList.add("run-pending");
                badge.textContent = run.status;
            } else if (run.conclusion === "success") {
                badge.classList.add("run-success");
                badge.textContent = "Successful";
            } else {
                badge.classList.add("run-failure");
                badge.textContent = run.conclusion || "Completed";
            }

            item.append(details, badge);
            runsContainer.appendChild(item);
        });

    } catch (error) {
        runsContainer.textContent = error.message;
        document.getElementById("runStatus").textContent = "Error";
        message.textContent = error.message;
        message.style.color = "#ff7070";
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        connectedRepository = parseRepository(
            document.getElementById("pipelineRepo").value.trim()
        );

        message.textContent = "Connecting to GitHub Actions...";
        message.style.color = "#32d69a";

        await loadWorkflowRuns();

        if (document.getElementById("runStatus").textContent !== "Error") {
            message.textContent = "Repository checked successfully.";
        }

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "#ff7070";
    }
});

document.getElementById("refreshBtn").addEventListener("click", () => {
    if (!connectedRepository) {
        message.textContent = "Connect a repository first.";
        message.style.color = "#ff7070";
        return;
    }

    loadWorkflowRuns();
});
