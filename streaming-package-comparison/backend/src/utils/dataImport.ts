import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import pool, { query } from '../config/database';

interface Game {
    date: string;
    team1: string;
    team2: string;
    tournament: string;
}

interface StreamingPackage {
    name: string;
    provider: string;
    price_monthly: number;
    price_yearly: number;
}

interface StreamingOffer {
    game_id: number;
    package_name: string;
    live_streaming: boolean;
    highlights_available: boolean;
}

export async function importData() {
    try {
        // Start a transaction
        await query('BEGIN');

        // Import teams and tournaments first
        const gamesData = await readCSVFile<Game>('../data/games.csv');
        const teams = new Set<string>();
        const tournaments = new Set<string>();

        gamesData.forEach(game => {
            teams.add(game.team1);
            teams.add(game.team2);
            tournaments.add(game.tournament);
        });

        // Insert teams
        for (const team of teams) {
            await query(
                'INSERT INTO teams (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
                [team]
            );
        }

        // Insert tournaments
        for (const tournament of tournaments) {
            await query(
                'INSERT INTO tournaments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
                [tournament]
            );
        }

        // Import games
        for (const game of gamesData) {
            const { team1_id } = await query('SELECT id as team1_id FROM teams WHERE name = $1', [game.team1]);
            const { team2_id } = await query('SELECT id as team2_id FROM teams WHERE name = $1', [game.team2]);
            const { tournament_id } = await query('SELECT id as tournament_id FROM tournaments WHERE name = $1', [game.tournament]);

            await query(
                `INSERT INTO games (date, team1_id, team2_id, tournament_id) 
                 VALUES ($1, $2, $3, $4)`,
                [new Date(game.date), team1_id, team2_id, tournament_id]
            );
        }

        // Import streaming packages
        const packagesData = await readCSVFile<StreamingPackage>('../data/streaming_packages.csv');
        for (const pkg of packagesData) {
            await query(
                `INSERT INTO streaming_packages (name, provider, price_monthly, price_yearly) 
                 VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
                [pkg.name, pkg.provider, pkg.price_monthly, pkg.price_yearly]
            );
        }

        // Import streaming offers
        const offersData = await readCSVFile<StreamingOffer>('../data/streaming_offers.csv');
        for (const offer of offersData) {
            const { package_id } = await query('SELECT id as package_id FROM streaming_packages WHERE name = $1', [offer.package_name]);
            
            await query(
                `INSERT INTO streaming_offers (game_id, package_id, live_streaming, highlights_available) 
                 VALUES ($1, $2, $3, $4) ON CONFLICT (game_id, package_id) DO NOTHING`,
                [offer.game_id, package_id, offer.live_streaming, offer.highlights_available]
            );
        }

        // Commit transaction
        await query('COMMIT');
        console.log('Data import completed successfully');
    } catch (error) {
        // Rollback transaction on error
        await query('ROLLBACK');
        console.error('Error importing data:', error);
        throw error;
    }
}

function readCSVFile<T>(filePath: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        fs.createReadStream(path.join(__dirname, filePath))
            .pipe(parse({ columns: true, skip_empty_lines: true }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// Execute import if run directly
if (require.main === module) {
    importData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}