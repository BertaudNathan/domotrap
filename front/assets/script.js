/*************** Animation html ***************/


/************** Element for Form **************/
//Select information of the player (inscription)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("inscription-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        //Get elements
        const pseudo = document.getElementById("pseudo").value.trim();
        const name = document.getElementById("name").value.trim();
        const birth = document.getElementById("birth").value;
        const pwd = document.getElementById("pwd").value;
        const comfirm_pwd = document.getElementById("confirm-pwd").value;

        if (!pseudo || !name || !birth || !pwd || !confirm_pwd){
            alert("Please fill in all fields."); 
            return;
        }

        if (pwd !== confirm_pwd){
            alert("Passwords do not match !");
            return;
        }

         // Object containing data to send
        const data = {
        pseudo,
        name,
        birth,
        pwd
        };

        try {
        // Send to backend
        const response = await fetch("https://api.com/api/inscription", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Response management
        if (response.ok) {
            const result = await response.json();
            alert("Account created successfully !");
            console.log(result);

            // Redirection to connexion page
            window.location.href = "connexion.html";
        } else {
            const error = await response.json();
            alert("Error: " + error.message);
        }
        } catch (err) {
        console.error("Network error:", err);
        alert("Server unreachable. Please try again later.");
        }
    });
});