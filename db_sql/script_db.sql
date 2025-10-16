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

DROP TABLE IF EXISTS match_;
CREATE TABLE match_ (
    Id_match INTEGER PRIMARY KEY AUTOINCREMENT,
    match_date DATETIME NOT NULL,
    match_duration INTEGER,
    match_final_score_red INTEGER,
    match_final_score_blue INTEGER,
    match_winner TEXT CHECK (match_winner IN ('red', 'blue', 'tie')),
    match_rating INTEGER CHECK (match_rating BETWEEN 1 AND 5),
    Id_babyfoot_table INTEGER NOT NULL,
    UNIQUE (match_date),
    FOREIGN KEY (Id_babyfoot_table) REFERENCES babyfoot_table (Id_babyfoot_table)
);

DROP TABLE IF EXISTS player;
CREATE TABLE player (
    player_id INTEGER PRIMARY KEY,
    player_pseudo TEXT NOT NULL UNIQUE,
    player_name TEXT NOT NULL UNIQUE,
    player_birthday DATE
);

DROP TABLE IF EXISTS play;
CREATE TABLE play (
    Id_match INTEGER,
    player_id INTEGER,
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
