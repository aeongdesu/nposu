import fs from "fs"
import path from "path"
import { twitch } from "./modules/utils/apiClient"
import database from "./modules/utils/database"
import twitchChatEvent from "./modules/events/twitchChat"
import { twitch_join_channels } from "./modules/handlers/streamHandler"
import { selfid } from "./modules/utils/auth"
if (!database.get_token("twitch") || !database.get_token("osu")) throw new Error("Tokens not found in database, please run \"bun run auth\" first and try again!")

const foldersPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(path.join(foldersPath)).filter((file: string) => file.endsWith(".ts"))
for (const file of commandFiles as string[]) {
    const command = (await import(path.join(foldersPath, file)))?.default
    if ("execute" in command) {
        twitch.commands.set(file.replace(".ts", ""), command)
    } else {
        console.log(`cannot load ${file}`)
    }
}

export const selfname = (await twitch.api.users.getUserById(selfid))?.name

twitch.chat.onMessage(twitchChatEvent)

twitch.chat.onConnect(async () => {
    await twitch.chat.join(selfname!)
    console.log("nposu by HDDTHR")
    await twitch_join_channels()
})

twitch.chat.connect()