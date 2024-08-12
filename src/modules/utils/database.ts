import type { AccessToken } from "@twurple/auth"
import { Database as BunDB } from "bun:sqlite"

class Database {
    db: BunDB
    constructor() {
        this.db = new BunDB("nposu.sqlite", { create: true })
        this.init()
    }
    init() {
        this.db.run("CREATE TABLE IF NOT EXISTS tokens (platform TEXT PRIMARY KEY, token TEXT)")
        this.db.run("CREATE TABLE IF NOT EXISTS users (osu_id INTEGER PRIMARY KEY, twitch_id INTEGER, mapinfo_enabled INTEGER, is_live INTEGER)")
    }
    get_token(platform: "twitch"): AccessToken
    get_token(platform: "osu"): { access_token: string, refresh_token: string, expires: Date }
    get_token(platform: "twitch" | "osu") {
        const { token } = this.db.prepare("SELECT token FROM tokens WHERE platform = ?").get(platform) as { token: string }
        return JSON.parse(token)
    }
    set_token(platform: "twitch" | "osu", token: any) {
        this.db.query("INSERT OR REPLACE INTO tokens (platform, token) VALUES (?, ?)").get(platform, JSON.stringify(token))
    }
    get_user(twitch_id: string) {
        return this.db.query("SELECT osu_id FROM users WHERE twitch_id = ?").get(twitch_id) as { osu_id?: number }
    }
    get_users() {
        return this.db.query("SELECT * FROM users").all() as { osu_id: number, twitch_id: number, mapinfo_enabled: number, is_live: number }[]
    }
    add_user(twitch_id: string, osu_id: number) {
        this.db.query("INSERT INTO users (osu_id, twitch_id, mapinfo_enabled, is_live) VALUES (?, ?, ?, ?)").run(osu_id, twitch_id, 1, 1)
    }
    del_user(twitch_id: string) {
        this.db.query("DELETE FROM users WHERE twitch_id = ?").run(twitch_id)
    }
    update_live_users(users: number[]) {
        const set_live = this.db.prepare("UPDATE users SET is_live = 1 WHERE twitch_id IN (?)")
        const set_not_live = this.db.prepare("UPDATE users SET is_live = 0 WHERE twitch_id NOT IN (?)")
        const batch = this.db.transaction(users => {
            for (const user of users) {
                set_live.run(user)
                set_not_live.run(user)
            }
        })
        batch(users)
    }
}

export default new Database()