
const githubForm = document.getElementById("githubForm");

const repoName = document.getElementById("repoName");
const repoStars = document.getElementById("repoStars");
const repoForks = document.getElementById("repoForks");
const repoBranches = document.getElementById("repoBranches");

const githubMessage = document.getElementById("githubMessage");
const connectBtn = document.getElementById("connectBtn");


// Extract GitHub owner and repository
function getRepoDetails(url) {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.toLowerCase() !== "github.com") {
            throw new Error("Please enter a valid GitHub URL.");
        }

        const parts = parsedUrl.pathname.split("/").filter(Boolean);

        if (parts.length < 2) {
            throw new Error("Enter a repository URL, not just a profile URL.");
        }

        const owner = parts[0];
        const repo = parts[1].replace(/\.git$/i, "");

        if (!/^[a-zA-Z0-9-]+$/.test(owner) ||
            !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
            throw new Error("Invalid repository URL.");
        }

        return { owner, repo };

    } catch (error) {
        throw new Error(error.message || "Invalid GitHub URL.");
    }
}


// Load repository information
async function loadRepository(owner, repo) {

    const baseURL = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

    const headers = {
        "Accept": "application/vnd.github+json"
    };

    const repoResponse = await fetch(baseURL, { headers });

    if (repoResponse.status === 404) {
        throw new Error("Repository not found or not publicly accessible.");
    }

    if (repoResponse.status === 403 || repoResponse.status === 429) {
        throw new Error("GitHub API rate limit reached. Please try later.");
    }

    if (!repoResponse.ok) {
        throw new Error("Unable to fetch repository information.");
    }

    const data = await repoResponse.json();


    // Repository statistics
    repoName.textContent = data.name;
    repoStars.textContent = data.stargazers_count;
    repoForks.textContent = data.forks_count;


    // Repository details
    document.getElementById("repositoryTitle").textContent =
        data.full_name;

    document.getElementById("repositoryDescription").textContent =
        data.description || "No description available.";

    document.getElementById("repoOwner").textContent =
        data.owner.login;

    document.getElementById("repoDefaultBranch").textContent =
        data.default_branch;

    document.getElementById("repoLanguage").textContent =
        data.language || "Not specified";

    document.getElementById("repoUpdated").textContent =
        new Date(data.updated_at).toLocaleDateString();

    document.getElementById("repoVisibility").textContent =
        data.private ? "Private" : "Public";

    const repoLink = document.getElementById("repoLink");
    repoLink.href = data.html_url;

    document.getElementById("repositoryPanel").hidden = false;


    // Load branches and commits
    await Promise.all([
        loadBranches(baseURL, headers),
        loadCommits(baseURL, headers)
    ]);

    return data;
}


// Load repository branches
async function loadBranches(baseURL, headers) {

    const list = document.getElementById("branchesList");

    list.textContent = "Loading branches...";

    const response = await fetch(
        `${baseURL}/branches?per_page=100`,
        { headers }
    );

    if (!response.ok) {
        list.textContent = "Unable to load branches.";
        throw new Error("Branch information could not be loaded.");
    }

    const branches = await response.json();

    repoBranches.textContent = branches.length;

    list.replaceChildren();

    if (branches.length === 0) {
        list.textContent = "No branches found.";
        return;
    }

    branches.forEach(branch => {

        const item = document.createElement("div");
        item.className = "branch-item";

        const name = document.createElement("strong");
        name.textContent = branch.name;

        const details = document.createElement("small");
        details.textContent = branch.protected
            ? "Protected branch"
            : "Regular branch";

        item.append(name, details);
        list.appendChild(item);

    });
}


// Load recent commits
async function loadCommits(baseURL, headers) {

    const list = document.getElementById("commitsList");

    list.textContent = "Loading commits...";

    const response = await fetch(
        `${baseURL}/commits?per_page=5`,
        { headers }
    );

    if (!response.ok) {
        list.textContent = "Unable to load commits.";
        throw new Error("Commit information could not be loaded.");
    }

    const commits = await response.json();

    list.replaceChildren();

    if (commits.length === 0) {
        list.textContent = "No commits found.";
        return;
    }

    commits.forEach(commit => {

        const item = document.createElement("div");
        item.className = "commit-item";

        const message = document.createElement("strong");
        message.textContent =
            commit.commit.message.split("\n")[0];

        const details = document.createElement("small");
        details.textContent =
            `${commit.commit.author?.name || "Unknown"} · ${
                new Date(commit.commit.author?.date).toLocaleDateString()
            }`;

        const link = document.createElement("a");
        link.href = commit.html_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View commit";

        item.append(message, details, link);
        list.appendChild(item);

    });
}


// Connect GitHub repository
githubForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const url = document.getElementById("repoUrl").value.trim();

    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting...";

    githubMessage.textContent = "Connecting to GitHub...";

    try {

        const { owner, repo } = getRepoDetails(url);

        await loadRepository(owner, repo);

        githubMessage.textContent =
            "Repository connected successfully!";

        githubMessage.style.color = "#32d69a";

    } catch (error) {

        githubMessage.textContent = error.message;
        githubMessage.style.color = "#ff7070";

        console.error("GitHub integration error:", error);

    } finally {

        connectBtn.disabled = false;
        connectBtn.innerHTML =
            '<i data-lucide="link"></i> Connect';

        if (window.lucide) {
            lucide.createIcons();
        }

    }

});
