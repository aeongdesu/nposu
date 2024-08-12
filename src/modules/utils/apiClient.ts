import { ApiClient } from "@twurple/api"
import { ChatClient } from "@twurple/chat"
import * as osu from "osu-api-v2-js"
import database from "./database"
import { authProvider } from "./auth"

const osutoken = database.get_token("osu")
const osuconfig = {
    client_id: process.env["OSU_CLIENT_ID"],
    client_secret: process.env["OSU_CLIENT_SECRET"],
    access_token: osutoken.access_token,
    expires: new Date(osutoken.expires),
    refresh_token: osutoken.refresh_token,
    token_type: "Bearer"
}
// i love oauth2 auth flow
export const osuapi = new osu.API(osuconfig)
await osuapi.refreshToken()

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
}, 10000)