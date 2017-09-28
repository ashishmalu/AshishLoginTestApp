import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SqlStorage } from './sql-storage.service'; 

const win: any = window;

@Injectable()
export class UserSettings {
    private sqlMode = false;

    constructor(public events: Events, public storage: Storage, private sql: SqlStorage) {
        if (win.sqlitePlugin) {
            this.sqlMode = true;
        } else {
            console.warn('SQLite plugin not installed. Falling back to regular Ionic Storage.');
        }
    }

    favoriteTeam(team, tournamentId, tournamentName) {
        let item = { team: team, tournamentId: tournamentId, tournamentName: tournamentName };

        if (this.sqlMode) {
            this.sql.set(team.id.toString(), JSON.stringify(item)).then(data => {
                this.events.publish('favorites:changed');
            });
        } else {
            return new Promise(resolve => {
                this.storage.set(team.id.toString(), JSON.stringify(item)).then(() => {
                    this.events.publish('favorites:changed');
                    resolve();
                });
            });
        }
    }

    unfavoriteTeam(team) {
        if (this.sqlMode) {
            this.sql.remove(team.id.toString()).then(data => {
                this.events.publish('favorites:changed');
            });
        } else {
            return new Promise(resolve => {
                this.storage.remove(team.id.toString()).then(() => {
                    this.events.publish('favorites:changed');
                    resolve();
                });
            });
        }
    }

    isFavoriteTeam(teamId) : Promise<boolean> {
        if (this.sqlMode) {
            return this.sql.get(teamId.toString()).then(value => value ? true : false);
        } else {
            return new Promise(resolve => resolve(this.storage.get(teamId.toString()).then(value => value ? true : false)));
        }
    }

    getAllFavorites() : Promise<any[]> {
        if (this.sqlMode) {
            return this.sql.getAll();
        } else {
            return new Promise(resolve => {
                let results = [];
                this.storage.forEach(data => {
                    console.log('***inside foreach', data);
                    results.push(JSON.parse(data));
                });
                return resolve(results);
            });
       }
    }

    initStorage() : Promise<any> {
        if (this.sqlMode) {
            return this.sql.initializeDatabase();
        } else {
            return new Promise(resolve => resolve());
        }
    }
}