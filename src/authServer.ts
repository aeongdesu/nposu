import { exchangeCode } from "@twurple/auth"
import * as osu from "osu-api-v2-js"
import database from "./modules/utils/database"

const TWITCH_URL = "https://id.twitch.tv/oauth2/authorize?" + new URLSearchParams({
    client_id: process.env["TWITCH_CLIENT_ID"]!,
    redirect_uri: "http://localhost:3000",
    response_type: "code",
    scope: "chat:read chat:edit"
})
const OSU_URL = osu.generateAuthorizationURL(Number(process.env["OSU_CLIENT_ID"]!), "http://localhost:3000", ["public", "chat.write", "identify"])

console.log(TWITCH_URL)
console.log(OSU_URL)

const server = Bun.serve({
    async fetch(req) {
        const params = new URL(req.url).searchParams
        const code = params.get("code")
        if (!code) return new Response(null, { status: 400 })
        if (params.has("scope")) { // twitch
            try {
                const tokenData = await exchangeCode(process.env["TWITCH_CLIENT_ID"]!, process.env["TWITCH_CLIENT_SECRET"]!, code, "http://localhost:3000")
                database.set_token("twitch", tokenData)
                console.log("adding twitch token success")
            } catch (e) {
                console.log(e)
                return new Response("wrong code?")
            }
        } else { // osu
            try {
                const tokenData = await osu.API.createAsync(Number(process.env["OSU_CLIENT_ID"]!), process.env["OSU_CLIENT_SECRET"]!, { redirect_uri: "http://localhost:3000", code })
                database.set_token("osu", {
                    access_token: tokenData.access_token,
                    expires: tokenData.expires,
                    refresh_token: tokenData.refresh_token
                })
                console.log("adding osu token success")
            } catch (e) {
                console.log(e)
                return new Response("wrong code?")
            }
        }
        server.stop(false)
        return new Response("good to go!")
    }
})