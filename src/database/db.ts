import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'medsight.sqlite');
const db = new sqlite3.Database(dbPath);

export const initDb = () => {
    return new Promise<void>((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number TEXT NOT NULL,
                message TEXT NOT NULL,
                role TEXT NOT NULL, -- 'user' or 'assistant'
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

export const saveMessage = (phoneNumber: string, message: string, role: 'user' | 'assistant') => {
    return new Promise<void>((resolve, reject) => {
        db.run(
            `INSERT INTO messages (phone_number, message, role) VALUES (?, ?, ?)`,
            [phoneNumber, message, role],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};

export const getHistory = (phoneNumber: string, limit: number = 10): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT message, role FROM messages WHERE phone_number = ? ORDER BY timestamp ASC LIMIT ?`,
            [phoneNumber, limit],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
};

export const cleanupOldMessages = () => {
    return new Promise<number>((resolve, reject) => {
        // Delete messages older than 24 hours to preserve privacy
        db.run(`DELETE FROM messages WHERE timestamp <= datetime('now', '-24 hours')`, function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

export default db;
