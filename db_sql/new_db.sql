-- =========================================================
-- TABLE : babyfoot_table
-- =========================================================
DROP TABLE IF EXISTS babyfoot_table;
CREATE TABLE babyfoot_table (
    Id_babyfoot_table INTEGER PRIMARY KEY AUTOINCREMENT,
    table_location TEXT NOT NULL,
    table_condition TEXT CHECK (
        table_condition IN (
            'beer stains',
            'broken leg',
            'good',
            'missing screw',
            'needs cleaning',
            'new',
            'out of alignment',
            'scratched',
            'sticky handles',
            'worn'
        ) OR table_condition IS NULL
    ),
    table_state TEXT CHECK (table_state IN ('ok', 'busy', 'down')),
    table_music TEXT
);

-- =========================================================
-- TABLE : match_
-- =========================================================
CREATE TABLE match_ (
    Id_match TEXT PRIMARY KEY,                  -- on garde le vrai ID (ex: G015295)
    match_date TEXT,
    match_duration INTEGER,
    match_final_score_red INTEGER,
    match_final_score_blue INTEGER,
    match_winner TEXT CHECK (match_winner IN ('red', 'blue', 'tie')),
    match_rating INTEGER CHECK (match_rating BETWEEN 1 AND 5),
    Id_babyfoot_table TEXT
);


-- =========================================================
-- TABLE : player
-- =========================================================
DROP TABLE IF EXISTS player;
CREATE TABLE player (
    player_id TEXT PRIMARY KEY,
    player_pseudo TEXT,
    player_name TEXT,
    player_password TEXT NOT NULL,
    player_birthday DATE
);

-- =========================================================
-- TABLE : play
-- =========================================================
DROP TABLE IF EXISTS play;
CREATE TABLE play (
    Id_match TEXT,
    player_id TEXT,
    role TEXT CHECK (role IN ('attack', 'defense')),
    goal INTEGER,
    own_goal INTEGER,
    mood INTEGER,
    comment TEXT,
    team_color TEXT CHECK (team_color IN ('red', 'blue')),
    is_substitute BOOLEAN,
    PRIMARY KEY (Id_match, player_id),
    FOREIGN KEY (Id_match) REFERENCES match_ (Id_match),
    FOREIGN KEY (player_id) REFERENCES player (player_id)
);
