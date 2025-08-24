const backendUrl = "http://localhost:8080";

async function fetchUsers() {
    try {
        const res = await fetch(`${backendUrl}/api/users`);
        const users = await res.json();
        renderUsers(users);
    } catch (err) {
        console.error("Error loading users:", err);
    }
}

function renderUsers(users) {
    const userList = document.getElementById("userList");
    const showInfo = document.getElementById("show-info-users");
    userList.innerHTML = "";
    showInfo.innerHTML = "";

    users.forEach(u => {
        const card = document.createElement("div");
        card.classList.add("user-card");
        card.textContent = u.name;
        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
            chrome.storage.sync.set({ userInfo: u.info }, () => {
                alert(`User selected: ${u.name}`);
            });

            showInfo.innerHTML = `
                <div class="info-card">
                    <p><strong>USERNAME:</strong> ${u.name}</p>
                    <p><strong>INFO:</strong> ${u.info}</p>
                </div>
            `;

        });

        userList.appendChild(card);
    });
}


document.getElementById("createUserBtn").addEventListener("click", async () => {
    const name = document.getElementById("newUserName").value.trim();
    const info = document.getElementById("newUserInfo").value.trim();

    if (!name || !info) return alert("Rellena ambos campos");

    try {
        const res = await fetch(`${backendUrl}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, info })
        });

        if (!res.ok) throw new Error("Error creando usuario");

        document.getElementById("newUserName").value = "";
        document.getElementById("newUserInfo").value = "";

        fetchUsers();
    } catch (err) {
        console.error(err);
        alert("Error creating new user.");
    }
});

fetchUsers();