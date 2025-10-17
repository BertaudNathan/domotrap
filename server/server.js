import express from "express";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import cors from "cors";
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use(cors());

const db = new sqlite3.Database("./ma_base.db");

//route pour la connexion
app.post("/login", (req, res) => {
  console.log(req.body);
  const { player_name, player_password } = req.body;
  const sql = `SELECT * FROM player WHERE player_name = ?`;

  db.get(sql, [player_name], async (err, user) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Erreur base de données", error: err.message });
    }

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isValid = await bcrypt.compare(player_password, user.player_password);
    if (!isValid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    res.status(200).json({
      message: "Connexion réussie",
      player: { player_id: user.player_id, player_name: user.player_name },
    });
  });
});

// Route d'inscription
app.post("/register", async (req, res) => {
  console.log(req.body);
  const { player_pseudo, player_name, player_password, player_birthday } =
    req.body;
  if (!player_pseudo || !player_name || !player_password) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }
  db.get(
    "SELECT * FROM player WHERE player_name = ?",
    [player_name],
    async (err, user) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Erreur base de données", error: err.message });

      if (user) {
        return res.status(409).json({ message: "Utilisateur déjà existant" });
      }
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(player_password, 10);
      db.run(
        "INSERT INTO player (player_pseudo, player_name, player_password, player_birthday) VALUES (?, ?, ?, ?)",
        [player_pseudo, player_name, hashedPassword, player_birthday || null],
        function (err) {
          if (err) {
            return res.status(500).json({
              message: "Erreur lors de la création de l’utilisateur",
              error: err.message,
            });
          }
          res.status(201).json({
            message: "Utilisateur inscrit avec succès",
            userId: this.lastID,
          });
        }
      );
    }
  );
});

//renvoie tous les joueurs au format json
app.get("/player", (req, res) => {
  const sql = "SELECT * FROM player";

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des joueurs",
        error: err.message,
      });
    }
    res.json(rows);
  });
});

//renvoie un joueur à partir de son id
app.get("/player/:id", (req, res) => {
  const playerId = req.params.id;

  const sql = "SELECT * FROM player WHERE player_id = ?";
  db.get(sql, [playerId], (err, player) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur base de données", error: err.message });
    }
    if (!player) {
      return res.status(404).json({ message: "Joueur non trouvé" });
    }
    res.status(200).json(player);
  });
});

app.patch("/player/:id", (req, res) => {});

app.delete("/player/:id", (req, res) => {});

// Routes pour les tables

//get all table
app.get("/table", (req, res) => {
  const sql = "SELECT * FROM babyfoot_table";

  db.all(sql, [], (err, tables) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur base de données", error: err.message });
    }
    res.json(tables);
  });
});

//route pour trouver une table avec son id
app.get("/table/:id", (req, res) => {
  const tableId = req.params.id;
  const sql = "SELECT * FROM babyfoot_table WHERE Id_babyfoot_table = ?";
  db.get(sql, [tableId], (err, table) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur base de données", error: err.message });
    }
    if (!table) {
      return res.status(404).json({ message: "Table non trouvée" });
    }
    res.status(200).json(table);
  });
});

//route pour ajouter une table
app.post("/table", (req, res) => {
  const { table_location, table_condition, table_state, table_music } =
    req.body;
  if (!table_location) {
    return res
      .status(400)
      .json({ message: "Le champ 'table_location' est obligatoire." });
  }
  const sql = `
    INSERT INTO babyfoot_table 
    (table_location, table_condition, table_state, table_music) 
    VALUES (?, ?, ?, ?)
  `;
  db.run(
    sql,
    [table_location, table_condition, table_state, table_music],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de l'ajout de la table",
          error: err.message,
        });
      }
      res.status(201).json({
        message: "Table ajoutée avec succès",
        tableId: this.lastID,
      });
    }
  );
});

//route pour modifier une table
app.patch("/table/:id", (req, res) => {
  const id = req.params.id;
  const { table_location, table_condition, table_state, table_music } =
    req.body;

  // Construire un tableau des champs à mettre à jour
  const fields = [];
  const values = [];

  if (table_location !== undefined) {
    fields.push("table_location = ?");
    values.push(table_location);
  }
  if (table_condition !== undefined) {
    fields.push("table_condition = ?");
    values.push(table_condition);
  }
  if (table_state !== undefined) {
    fields.push("table_state = ?");
    values.push(table_state);
  }
  if (table_music !== undefined) {
    fields.push("table_music = ?");
    values.push(table_music);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  // Ajouter l'id à la fin des valeurs pour la clause WHERE
  values.push(id);

  const sql = `UPDATE babyfoot_table SET ${fields.join(
    ", "
  )} WHERE Id_babyfoot_table = ?`;

  db.run(sql, values, function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Table non trouvée" });
    }
    res.json({ message: "Table mise à jour avec succès" });
  });
});

app.delete("/table/:id", (req, res) => {});

//Routes pour les matchs
app.get("/match", (req, res) => {
  const sql = `SELECT * FROM match_`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur base de données", error: err.message });
    }
    res.json(rows);
  });
});

// trouver un match par son id
app.get("/match/:id", (req, res) => {
  const matchId = req.params.id;
  const sql = "SELECT * FROM match_ WHERE Id_match = ?";

  db.get(sql, [matchId], (err, row) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur base de données", error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Match non trouvé" });
    }
    res.json(row);
  });
});

//ajouter un match
app.post("/match", (req, res) => {
  console.log(req.body);
  const {
    match_date,
    Id_babyfoot_table,
    match_duration = 0,
    match_final_score_red = 0,
    match_final_score_blue = 0,
    match_winner = null,
    match_rating = null,
  } = req.body;

  if (!match_date || !Id_babyfoot_table) {
    return res.status(400).json({ message: "Champs obligatoires manquants" });
  }

  const sql = `
    INSERT INTO match_ (
      match_date,
      match_duration,
      match_final_score_red,
      match_final_score_blue,
      match_winner,
      match_rating,
      Id_babyfoot_table
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      match_date,
      match_duration,
      match_final_score_red,
      match_final_score_blue,
      match_winner,
      match_rating,
      Id_babyfoot_table,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de la création du match",
          error: err.message,
        });
      }

      res.status(201).json({
        message: "Match créé avec succès",
        matchId: this.lastID,
      });
    }
  );
});

//modifier un match
app.patch("/match/:id", (req, res) => {
  const { id } = req.params;
  const {
    match_duration,
    match_final_score_red,
    match_final_score_blue,
    match_winner,
    match_rating,
  } = req.body;

  let fields = [];
  let values = [];

  if (match_duration !== undefined) {
    fields.push("match_duration = ?");
    values.push(match_duration);
  }
  if (match_final_score_red !== undefined) {
    fields.push("match_final_score_red = ?");
    values.push(match_final_score_red);
  }
  if (match_final_score_blue !== undefined) {
    fields.push("match_final_score_blue = ?");
    values.push(match_final_score_blue);
  }
  if (match_winner !== undefined) {
    fields.push("match_winner = ?");
    values.push(match_winner);
  }
  if (match_rating !== undefined) {
    fields.push("match_rating = ?");
    values.push(match_rating);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  const sql = `UPDATE match_ SET ${fields.join(", ")} WHERE Id_match = ?`;
  values.push(id);

  db.run(sql, values, function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur base de données", error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Match non trouvé" });
    }
    res.status(200).json({ message: "Match mis à jour avec succès" });
  });
});

//supprimer un match
app.delete("/match/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM match_ WHERE Id_match = ?";

  db.run(sql, [id], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur base de données", error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Match non trouvé" });
    }
    res.status(200).json({ message: "Match supprimé avec succès" });
  });
});

//route pour play
app.post("/play", (req, res) => {
  const {
    Id_match,
    player_id,
    role,
    team_color,
    is_substitute,
    goal = 0,
    own_goal = 0,
    mood = null,
    comment = null,
  } = req.body;

  // Vérification des champs obligatoires
  if (
    !Id_match ||
    !player_id ||
    !role ||
    !team_color ||
    is_substitute === undefined
  ) {
    return res.status(400).json({ message: "Champs obligatoires manquants" });
  }

  // Vérification des valeurs valides pour role et team_color
  const validRoles = ["attack", "defense"];
  const validTeams = ["red", "blue"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Role invalide" });
  }
  if (!validTeams.includes(team_color)) {
    return res.status(400).json({ message: "Team_color invalide" });
  }

  const sql = `INSERT INTO play (
    Id_match, player_id, role, team_color, is_substitute, goal, own_goal, mood, comment
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [
      Id_match,
      player_id,
      role,
      team_color,
      is_substitute ? 1 : 0,
      goal,
      own_goal,
      mood,
      comment,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de l'ajout au match",
          error: err.message,
        });
      }
      res.status(201).json({
        message: "Participation ajoutée",
        playId: { Id_match, player_id },
      });
    }
  );
});

app.patch("/play/:Id_match/:player_id", (req, res) => {
  const { Id_match, player_id } = req.params;
  const { role, goal, own_goal, mood, comment, team_color, is_substitute } =
    req.body;

  let fields = [];
  let values = [];

  if (role !== undefined) {
    fields.push("role = ?");
    values.push(role);
  }
  if (goal !== undefined) {
    fields.push("goal = ?");
    values.push(goal);
  }
  if (own_goal !== undefined) {
    fields.push("own_goal = ?");
    values.push(own_goal);
  }
  if (mood !== undefined) {
    fields.push("mood = ?");
    values.push(mood);
  }
  if (comment !== undefined) {
    fields.push("comment = ?");
    values.push(comment);
  }
  if (team_color !== undefined) {
    fields.push("team_color = ?");
    values.push(team_color);
  }
  if (is_substitute !== undefined) {
    fields.push("is_substitute = ?");
    values.push(is_substitute);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour." });
  }
  const sql = `UPDATE play SET ${fields.join(
    ", "
  )} WHERE Id_match = ? AND player_id = ?`;
  values.push(Id_match, player_id);

  db.run(sql, values, function (err) {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la mise à jour du joueur dans le match",
        error: err.message,
      });
    }

    if (this.changes === 0) {
      return res
        .status(404)
        .json({ message: "Entrée non trouvée pour la mise à jour" });
    }

    res.status(200).json({ message: "Mise à jour réussie" });
  });
});

app.get("/play", (req, res) => {
  const sql = "SELECT * FROM play";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des participations",
        error: err.message,
      });
    }
    res.json(rows);
  });
});

// Route pour le classement
app.get("/leaderboard", (req, res) => {
  const sql = `
  SELECT
  RANK() OVER (ORDER BY COALESCE(SUM(play.goal), 0) DESC) AS rank,
  player.player_pseudo AS name,
  COALESCE(SUM(play.goal), 0) AS score,
  MAX(match_.match_date) AS last_match_date,
  COUNT(DISTINCT play.Id_match) AS total_matches
  FROM player
  LEFT JOIN play ON player.player_id = play.player_id
  LEFT JOIN match_ ON play.Id_match = match_.Id_match
  GROUP BY player.player_id
  ORDER BY score DESC
  LIMIT 5

  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération du classement",
        error: err.message,
      });
    }
    res.status(200).json(rows);
  });
});

// Attribution automatique des buts aux attaquants
app.post("/auto-assign-goals/:matchId", (req, res) => {
  const matchId = req.params.matchId;

  // 1. Récupérer le score du match
  const matchSql = `SELECT match_final_score_red, match_final_score_blue FROM match_ WHERE Id_match = ?`;

  db.get(matchSql, [matchId], (err, match) => {
    if (err || !match) {
      return res.status(404).json({ message: "Match introuvable" });
    }

    const { match_final_score_red, match_final_score_blue } = match;

    // 2. Récupérer les joueurs qui ont joué ce match
    const playerSql = `
      SELECT player_id, role, team_color FROM play 
      WHERE Id_match = ? AND role = 'attack'
    `;

    db.all(playerSql, [matchId], (err, attackers) => {
      if (err) {
        return res.status(500).json({
          message: "Erreur en récupérant les attaquants",
          error: err.message,
        });
      }

      let updates = [];

      attackers.forEach((player) => {
        let goals = 0;
        if (player.team_color === "red") goals = match_final_score_red;
        if (player.team_color === "blue") goals = match_final_score_blue;

        const updateSql = `
          UPDATE play SET goal = ? 
          WHERE Id_match = ? AND player_id = ?
        `;

        updates.push(
          new Promise((resolve, reject) => {
            db.run(
              updateSql,
              [goals, matchId, player.player_id],
              function (err) {
                if (err) reject(err);
                else resolve();
              }
            );
          })
        );
      });

      Promise.all(updates)
        .then(() => {
          res
            .status(200)
            .json({ message: "Buts attribués automatiquement aux attaquants" });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Erreur lors de la mise à jour des buts",
            error: err.message,
          });
        });
    });
  });
});

//render match duration
app.patch("/match/:id/duration", (req, res) => {
  const matchId = req.params.id;
  const { duration } = req.body;

  if (duration === undefined || typeof duration !== "number") {
    return res.status(400).json({ message: "Durée invalide ou manquante" });
  }

  const sql = `UPDATE match_ SET match_duration = ? WHERE Id_match = ?`;

  db.run(sql, [duration, matchId], function (err) {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la mise à jour de la durée",
        error: err.message,
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Match non trouvé" });
    }

    res.status(200).json({ message: "Durée du match mise à jour avec succès" });
  });
});

app.post("/match/:id/duration", (req, res) => {
  const matchId = req.params.id;
  const { duration } = req.body;

  if (duration === undefined || typeof duration !== "number") {
    return res.status(400).json({ message: "Durée manquante ou invalide" });
  }

  const sql = `UPDATE match_ SET match_duration = ? WHERE Id_match = ?`;

  db.run(sql, [duration, matchId], function (err) {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de l'enregistrement de la durée",
        error: err.message,
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Match non trouvé" });
    }

    res.status(200).json({ message: "Durée enregistrée avec succès" });
  });
});

//recupérer la durée
app.get("/match/:id/duration", (req, res) => {
  const matchId = req.params.id;

  const sql = `SELECT match_duration FROM match_ WHERE Id_match = ?`;

  db.get(sql, [matchId], (err, row) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération de la durée",
        error: err.message,
      });
    }

    if (!row) {
      return res.status(404).json({ message: "Match non trouvé" });
    }

    res.status(200).json({
      match_id: matchId,
      duration: row.match_duration,
    });
  });
});

app.get("/match/:id/players", (req, res) => {
  const matchId = req.params.id;

  // Récupérer les joueurs d'un match avec infos de la table play et du joueur
  const sql = `
    SELECT p.player_id, p.player_pseudo, p.player_name, pl.role, pl.team_color, pl.is_substitute, pl.goal, pl.own_goal, pl.mood, pl.comment
    FROM play pl
    JOIN player p ON pl.player_id = p.player_id
    WHERE pl.Id_match = ?
  `;

  db.all(sql, [matchId], (err, players) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des joueurs du match",
        error: err.message,
      });
    }
    res.json(players);
  });
});

app.listen(port, () => {
  console.log("Server app listening on port " + port);
});
