-- Create tables for our database
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    team1_id INTEGER REFERENCES teams(id),
    team2_id INTEGER REFERENCES teams(id),
    tournament_id INTEGER REFERENCES tournaments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS streaming_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS streaming_offers (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    package_id INTEGER REFERENCES streaming_packages(id),
    live_streaming BOOLEAN DEFAULT false,
    highlights_available BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, package_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_teams ON games(team1_id, team2_id);
CREATE INDEX IF NOT EXISTS idx_games_tournament ON games(tournament_id);
CREATE INDEX IF NOT EXISTS idx_streaming_offers_game ON streaming_offers(game_id);
CREATE INDEX IF NOT EXISTS idx_streaming_offers_package ON streaming_offers(package_id);