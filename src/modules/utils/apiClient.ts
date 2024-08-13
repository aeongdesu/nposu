import { ApiClient } from "@twurple/api"
import { ChatClient } from "@twurple/chat"
import * as osu from "osu-api-v2-js"
import database from "./database"
import { authProvider } from "./auth"

const osutoken = database.get_token("osu")
export const osuapi = new osu.API({
    client: {
        id: +process.env["OSU_CLIENT_ID"]!,
        secret: process.env["OSU_CLIENT_SECRET"]!
    },
    access_token: osutoken.access_token,
    expires: new Date(osutoken.expires),
    refresh_token: osutoken.refresh_token,
    token_type: "Bearer",
    // verbose: "all"
})

export const twitch = {
    api: new ApiClient({ authProvider }),
    chat: new ChatClient({ authProvider }),
    commands: new Map()
}

setInterval(() => {
    if (osuapi.access_token === osutoken.access_token) return
    database.set_token("osu", {
        access_token: osuapi.access_token,
        expires: osuapi.expires,
        refresh_token: osuapi.refresh_token
    })
}, 1000 * 60 * 60) // 1 hour