document.addEventListener("DOMContentLoaded", () => {
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
      player_password: pwd,
    };

    try {
      // Envoi au backend
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

// Créer une carte de match
function createMatchCard(match, tables) {
  const card = document.createElement("div");
  card.className = "match-card";

  // Trouver la table
  const table = tables.find(
    (t) => t.Id_babyfoot_table === match.Id_babyfoot_table
  );
  const tableName = table ? table.table_location : "Unknown Table";

  // Formater la date
  const date = new Date(match.match_date);
  const dateStr = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`;

  // Durée
  const duration = match.match_duration
    ? `${Math.floor(match.match_duration / 60)} min`
    : "N/A";

  // Déterminer le gagnant
  const redWon = match.match_winner === "red";
  const blueWon = match.match_winner === "blue";

  card.innerHTML = `
      <div class="match-header">
          <span class="match-date"> ${dateStr}</span>
          <span class="match-duration"> ${duration}</span>
      </div>
      <div class="match-body">
          <div class="team team-red">
              <span class="team-label"> Red Team</span>
              <span class="player-name">Team Red</span>
              ${redWon ? '<span class="winner-badge"> Winner</span>' : ""}
          </div>

          <div class="score-display">
              <div class="score-numbers">
                  ${
                    match.match_final_score_red
                  } <span class="score-vs">-</span> ${
    match.match_final_score_blue
  }
              </div>
          </div>

          <div class="team team-blue">
              <span class="team-label"> Blue Team</span>
              <span class="player-name">Team Blue</span>
              ${blueWon ? '<span class="winner-badge"> Winner</span>' : ""}
          </div>
      </div>
      <div style="text-align:center; margin-top:10px; font-size:0.85rem; color:#888;">
          📍 ${tableName}
      </div>
  `;

  return card;
}

// Charger au démarrage (ajoutez cette ligne dans votre DOMContentLoaded existant)
if (document.getElementById("recentMatchesContainer")) {
  loadRecentMatches();
}

/***** Match live******/
let refreshInterval;

// Charger les matchs live au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  loadLiveMatches();
  // Rafraîchir automatiquement toutes les 3 secondes
  refreshInterval = setInterval(loadLiveMatches, 3000);
});

// Fonction principale pour charger les matchs live
async function loadLiveMatches() {
  const container = document.getElementById("liveMatchesContainer");

  try {
    // 1. Récupérer tous les matchs
    const matchResponse = await fetch(`http://localhost:8000/match`);
    if (!matchResponse.ok) throw new Error("Failed to fetch matches");
    const allMatches = await matchResponse.json();

    // 2. Récupérer toutes les tables
    const tableResponse = await fetch(`${API_URL}/table`);
    if (!tableResponse.ok) throw new Error("Failed to fetch tables");
    const tables = await tableResponse.json();

    // 3. Filtrer les matchs en cours (winner = null)
    const liveMatches = allMatches.filter(
      (match) => match.match_winner === null
    );

    // 4. Afficher les résultats
    if (liveMatches.length === 0) {
      container.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1;">
              <h2> No live matches right now</h2>
              <p>Check back later or start a new game!</p>
          </div>
                  `;
      return;
    }

    // 5. Créer une carte pour chaque match
    container.innerHTML = "";
    for (const match of liveMatches) {
      const card = await createLiveMatchCard(match, tables);
      container.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading live matches:", error);
    container.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1; color: red;">
              Unable to load matches. Please try again.
          </div>
              `;
  }
}

// Créer une carte de match live
async function createLiveMatchCard(match, tables) {
  const card = document.createElement("div");
  card.className = "live-match-card";

  // Trouver la table correspondante
  const table = tables.find(
    (t) => t.Id_babyfoot_table === match.Id_babyfoot_table
  );
  const tableName = table ? table.table_location : "Unknown Table";

  // Calculer le temps écoulé
  const startTime = new Date(match.match_date);
  const now = new Date();
  const elapsed = Math.floor((now - startTime) / 1000); // en secondes
  const timer = formatTimer(elapsed);

  // Récupérer les joueurs de ce match
  const players = await getMatchPlayers(match.Id_match);

  // Séparer les équipes
  const redTeam = players.filter((p) => p.team_color === "red");
  const blueTeam = players.filter((p) => p.team_color === "blue");

  // Boutons disponibles uniquement si une équipe n’est pas complète
  const canJoinRed = redTeam.length < 2;
  const canJoinBlue = blueTeam.length < 2;

  card.innerHTML = `
              <div class="live-badge">
                   LIVE
              </div>

              <div class="match-info">
                  <div class="table-name"> ${tableName}</div>
                  <div class="match-timer"> ${timer}</div>
              </div>

              <div class="teams-display">
                  <div class="team team-red">
                      <div class="team-label"> Red Team</div>
                      <div class="team-players">
                          ${redTeam
                            .map(
                              (p) =>
                                `<div class="player-tag">${p.player_name}</div>`
                            )
                            .join("")}
                      </div>
                       ${
                         canJoinRed
                           ? `<button class="player-tag" data-match="${match.Id_match}" data-team="red">Join Red</button>`
                           : ""
                       }
                  </div>

                  <div class="score-display">
                      <div class="score-numbers">
                          ${
                            match.match_final_score_red
                          } <span class="score-vs">-</span> ${
    match.match_final_score_blue
  }
                      </div>
                  </div>

                  <div class="team team-blue">
                      <div class="team-label"> Blue Team</div>
                      <div class="team-players">
                          ${blueTeam
                            .map(
                              (p) =>
                                `<div class="player-tag">${p.player_named}</div>`
                            )
                            .join("")}
                  </div>
                  ${
                    canJoinBlue
                      ? `<button class="player-tag" data-match="${match.Id_match}" data-team="blue">Join Blue</button>`
                      : ""
                  }
              </div>
          `;

  // Ajout des événements sur les boutons
  const joinButtons = card.querySelectorAll(".join-btn");
  joinButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const matchId = btn.dataset.match;
      const team = btn.dataset.team;
      await joinTeam(matchId, team);
    });
  });

  return card;
}

// Récupérer les joueurs d'un match
async function getMatchPlayers(matchId) {
  try {
    const response = await fetch(`${API_URL}/match/${matchId}/players`);
    if (!response.ok) return [];
    const players = await response.json();
    return players;
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

// Formater le temps en MM:SS
function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Nettoyer l'intervalle quand on quitte la page
window.addEventListener("beforeunload", () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

/** Gestion formulaire création de match */
document.addEventListener("DOMContentLoaded", () => {
  loadTables(); // remplir le select avec les tables du backend

  const createForm = document.getElementById("createMatchForm");
  if (createForm) {
    createForm.addEventListener("submit", handleCreateMatch);
  }
});

// Charger les tables depuis le backend
async function loadTables() {
  const select = document.getElementById("tableSelect");
  try {
    const response = await fetch(`${API_URL}/table`);
    if (!response.ok) throw new Error("Failed to fetch tables");
    const tables = await response.json();

    tables.forEach((table) => {
      const option = document.createElement("option");
      option.value = table.Id_babyfoot_table;
      option.textContent = table.table_location;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading tables:", err);
    select.innerHTML = `<option value=""> Error loading tables</option>`;
  }
}

async function handleCreateMatch(e) {
  e.preventDefault();
  console.log("handleCreateMatch triggered");

  const tableId = document.getElementById("tableSelect").value;

  if (!tableId) {
    alert("Please select a table!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        match_date: new Date().toISOString(),
        Id_babyfoot_table: parseInt(tableId),
      }),
    });

    if (!response.ok) throw new Error("Failed to create match");

    const data = await response.json();
    const matchId = data.matchId;

    alert(`Match created successfully! ID: ${matchId}`);

    // Après création du match, tu peux maintenant appeler la fonction pour ajouter un joueur
    // addPlayerToMatch(matchId, pseudo, teamColor);

    loadLiveMatches();
    document.getElementById("createMatchForm").reset();
  } catch (err) {
    console.error("Error creating match:", err);
    alert("Could not create match. Try again later.");
  }
}

/*Joindre la team*/
async function joinTeam(matchId, teamColor) {
  const playerPseudo = prompt("Enter your pseudo to join the team:");
  if (!playerPseudo) return;

  try {
    const response = await fetch(`${API_URL}/match/${matchId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_pseudo: playerPseudo,
        team_color: teamColor,
      }),
    });

    if (response.ok) {
      alert(` You joined the ${teamColor} team!`);
      loadLiveMatches(); // rafraîchir l'affichage
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server unreachable, try again later.");
  }
}
