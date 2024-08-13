import { osuapi, twitch } from "../utils/apiClient"
import { selfid } from "../utils/auth"
import { cooldown_check } from "../utils/cooldown"
import { prepare_osu_message } from "../utils/osuMessage"
import { mapreq_check, mapreq_handler } from "../handlers/mapreqHandler"
import type { ChatMessage } from "@twurple/chat"
import database from "../utils/database"

const cooldowns = new Map()
const last_beatmap_cooldowns = new Map()

export default async (channel: string, user: string, ctx: string, msg: ChatMessage) => {
    if (msg.userInfo.userId === selfid) return
    ctx = ctx.trim()

    if (ctx.startsWith("!")) {
        if (!msg.userInfo.isBroadcaster && !msg.userInfo.isMod && msg.userInfo.userId !== process.env["OWNER_TWITCH_ID"]) return
        const command = ctx.substring(1).trim().toLowerCase().split(" ")
        if (twitch.commands.has(command[0])) {
            let result = await twitch.commands.get(command[0])
            if (result.ownerOnly && msg.userInfo.userId !== process.env["OWNER_TWITCH_ID"]) return
            const user_cooldown = cooldown_check(cooldowns, user, channel)
            if (user_cooldown) return
            result = await result.execute(command, msg.channelId)
            if (!result) return
            twitch.chat.say(channel, result, { replyTo: msg })
        }
    }

    if (msg.userInfo.isBroadcaster) return

    const db_user = database.get_user(msg.channelId!)
    if (!db_user) return

    const get_map = mapreq_check(ctx)
    if (!get_map) return

    const user_cooldown = cooldown_check(cooldowns, user, channel)
    if (user_cooldown) return

    const result = await mapreq_handler(osuapi, get_map)
    if (!result) return

    const last_beatmap_cooldown = cooldown_check(last_beatmap_cooldowns, channel, result.beatmapset_info.id, 3e4)
    if (last_beatmap_cooldown) return

    try {
        await osuapi.sendChatPrivateMessage(db_user.osu_id, `@${user} -> ` + prepare_osu_message(result))
    } catch (err) {
        console.error(err)
        return await twitch.chat.say(channel, `Failed to send beatmap to osu!`, { replyTo: msg })
    }
    if (db_user.mapinfo_enabled) await twitch.chat.say(channel, `${result.beatmapset_info.artist} - ${result.beatmapset_info.title} [${result.beatmap_info.version}] sent.`, { replyTo: msg })
}