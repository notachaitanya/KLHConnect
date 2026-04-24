document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const roll = document.getElementById("rollnumber").value.trim();
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("roleSelect").value;
    const year = document.getElementById("YearSelect").value;
    const course = document.getElementById("course").value;
    const adminKey = document.getElementById("adminKeyInput").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    if (role === "admin" && adminKey !== "2521") {
        alert("Invalid admin key");
        return;
    }

    const email = roll + "@klh.edu.in";

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                roll_number: roll,
                role: role,
                year: role === "admin" ? 0 : parseInt(year),
                course: role === "admin" ? "all" : course
            }
        }
    });

    if (error) {
        alert(error.message);
        return;
    }

    if (!data.user) {
        alert("Signup failed. Try again.");
        return;
    }

    alert("Signup successful!");
    window.location.href = "index.html";
});

const roleSelect = document.getElementById("roleSelect");
const adminInput = document.getElementById("adminKeyInput");
const yearParent = document.getElementById("YearSelect").closest(".signupOptionsArranger");
const courseParent = document.getElementById("course").closest(".signupOptionsArranger");

adminInput.style.display = "none";

roleSelect.addEventListener("change", () => {
    if (roleSelect.value === "admin") {
        adminInput.style.display = "block";
        yearParent.style.display = "none";
        courseParent.style.display = "none";
    } else {
        adminInput.style.display = "none";
        adminInput.value = "";
        yearParent.style.display = "flex";
        courseParent.style.display = "flex";
    }
});