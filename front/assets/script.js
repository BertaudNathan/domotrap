document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("inscription-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Récupération des valeurs
    const pseudo = document.getElementById("player_pseudo").value.trim();
    const name = document.getElementById("player_name").value.trim();
    const birth = document.getElementById("player_birthday").value;
    const pwd = document.getElementById("player_password").value;
    const confirm_pwd = document.getElementById("confirm_password").value;

    // Vérification des champs
    if (!pseudo || !name || !birth || !pwd || !confirm_pwd) {
      alert("Please fill in all fields.");
      return;
    }

    if (pwd !== confirm_pwd) {
      alert("Passwords do not match!");
      return;
    }

    // Préparation des données pour le backend
    const data = {
      player_pseudo: pseudo,
      player_name: name,
      player_birthday: birth,
      player_password: pwd
    };

    try {
      // Envoi au backend
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      // Gestion de la réponse
      if (response.ok) {
        const result = await response.json();
        alert("Account created successfully!");
        console.log(result);
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
