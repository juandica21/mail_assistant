const backendUrl = "http://localhost:8080"; // Cambia si tienes otro backend

async function fetchUsers() {
    try {
        const res = await fetch(`${backendUrl}/api/users`);
        const users = await res.json();
        renderUsers(users);
    } catch (err) {
        console.error("Error cargando usuarios:", err);
    }
}

function renderUsers(users) {
    const userList = document.getElementById("userList");
    const showInfo = document.getElementById("show-info-users");
    userList.innerHTML = "";
    showInfo.innerHTML = "";

    users.forEach(u => {
        const div = document.createElement("div");
        div.textContent = u.name;
        div.style.cursor = "pointer";
        div.addEventListener("click", () => {

            chrome.storage.sync.set({ userInfo: u.info }, () => {
                alert(`Usuario seleccionado: ${u.name}`);
            });

            showInfo.innerHTML = `<strong>USERNAME:</strong> ${u.name}<br><strong>INFO:</strong> ${u.info}`;
        });
        userList.appendChild(div);
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
        alert("Error al crear usuario");
    }
});

fetchUsers();