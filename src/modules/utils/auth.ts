import { RefreshingAuthProvider } from "@twurple/auth"
import database from "./database"

const tokenData = database.get_token("twitch")
export const authProvider = new RefreshingAuthProvider({
    clientId: process.env["TWITCH_CLIENT_ID"]!,
    clientSecret: process.env["TWITCH_CLIENT_SECRET"]!
})

authProvider.onRefresh(async (_userid, token) => database.set_token("twitch", token))
export const selfid = await authProvider.addUserForToken(tokenData, ["chat"])