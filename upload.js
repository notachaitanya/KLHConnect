document.querySelectorAll(".uploadOptions").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".uploadOptions").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
    });
});

document.getElementById("postButton").addEventListener("click", async () => {

    const message = document.getElementById("message").value.trim();

    if (!message) {
        alert("Please write an announcement");
        return;
    }

    const category = document.querySelector(".uploadOptions.selected")?.id;
    if (!category) {
        alert("Please select a category");
        return;
    }

    const yearCheckboxes = document.querySelectorAll('input[name="year"]:checked');
    let years = [];
    yearCheckboxes.forEach(cb => years.push(parseInt(cb.value)));

    if (years.length === 0) {
        alert("Please select at least one year");
        return;
    }

    const deptCheckboxes = document.querySelectorAll('input[name="department"]:checked');
    let departments = [];
    deptCheckboxes.forEach(cb => departments.push(cb.value));

    if (departments.length === 0) {
        alert("Please select at least one department");
        return;
    }

    // if ALL years selected simplify to [5]
    if (years.includes(5)) years = [5];

    // if all depts selected simplify to ["all"]
    const allDepts = ["cse", "csit", "ece", "aids"];
    if (allDepts.every(d => departments.includes(d))) departments = ["all"];

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Not logged in");
        window.location.href = "index.html";
        return;
    }

    const { error } = await supabaseClient.from("posts").insert([{
        posted_by: user.id,
        message: message,
        category: category,
        target_years: years,
        target_departments: departments
    }]);

    if (error) {
        console.log(error);
        alert(error.message);
        return;
    }

    alert("Posted successfully!");
    window.location.href = "home.html";
});

document.getElementById("discardButton").addEventListener("click", () => {
    window.location.href = "home.html";
});

window.onload = async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const { data } = await supabaseClient
        .from("users")
        .select("roll_number, role")
        .eq("id", user.id)
        .single();

    if (data) {
        document.getElementById("usernameInUpload").innerText = data.roll_number;
        if (data.role !== "admin") {
            alert("Only admins can post");
            window.location.href = "home.html";
        }
    }
};
