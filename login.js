document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const roll = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const email = roll + "@klh.edu.in";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert(error.message);
        return;
    }

    window.location.href = "home.html";
});