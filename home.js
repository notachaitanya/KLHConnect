let currentUserData = null;

async function getUserData() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        console.log("getUserData error:", error);
        return;
    }

    console.log("User data:", data);
    console.log("Roll number:", data.roll_number);

    currentUserData = data;
    document.getElementById("userNameDisplay").innerText = data.roll_number;

    if (data.role !== "admin") {
        const uploadBtn = document.getElementById("SendMessageButton");
        if (uploadBtn) uploadBtn.style.display = "none";
    }
}

async function loadPosts(category = "all") {
    if (!currentUserData) return;

    const dept = currentUserData.course;
    const year = parseInt(currentUserData.year);

    let query = supabaseClient
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (category !== "all") {
        query = query.eq("category", category);
    }

    const { data: posts, error } = await query;

    if (error) {
        console.log("loadPosts error:", error);
        return;
    }

    const filteredPosts = posts.filter(post => {

    // admins see everything
    if (currentUserData.role === "admin") return true;

    const dept = currentUserData.course;
    const year = parseInt(currentUserData.year);

    const deptMatch =
        post.target_departments.includes("all") ||
        post.target_departments.includes(dept);

    const yearMatch =
        post.target_years.includes(5) ||
        post.target_years.includes(year);

    return deptMatch && yearMatch;
});

    displayPosts(filteredPosts);
}

async function displayPosts(posts) {
    const container = document.getElementById("msgSpace");
    container.innerHTML = "";

    if (posts.length === 0) {
        container.innerHTML = "<p style='color:#555;text-align:center;margin-top:40px;'>No announcements yet</p>";
        return;
    }

    // use posted_by instead of user_id — matches your DB column
    const userIds = [...new Set(posts.map(p => p.posted_by))];
    const { data: usersData } = await supabaseClient
        .from("users")
        .select("id, roll_number")
        .in("id", userIds);

    const usersMap = {};
    usersData?.forEach(u => usersMap[u.id] = u.roll_number);

    for (const post of posts) {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.category = post.category;

        const username = usersMap[post.posted_by] || "Unknown";
        const date = new Date(post.created_at).toLocaleString();

        card.innerHTML = `
            <div class="card-header">
                <span class="card-sender">${username}</span>
                <span class="card-tick">✓</span>
                <span class="card-tag">${post.category.toUpperCase()}</span>
                <span class="card-time">${date}</span>
            </div>
            <p class="card-message">${post.message}</p>
        `;

        container.appendChild(card);
    }
}

window.onload = async () => {
    await getUserData();
    await loadPosts();
};