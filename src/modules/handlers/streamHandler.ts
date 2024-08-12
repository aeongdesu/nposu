import type { HelixStream } from "@twurple/api"
import { twitch } from "../utils/apiClient"
import database from "../utils/database"
import { selfname } from "../../index"

export const twitch_join_channels = async () => {
    while (true) { // not using setInterval because need to wait for the task to finish and repeat
        await task()
        await new Promise(resolve => setTimeout(resolve, 30000)) // 30 seconds
    }
}

const task = async () => {
    const channels = await streaming_channels()
    if (!channels) return

    const current_channels = new Set(twitch.chat.currentChannels.map(channel => channel.replace("#", "")))
    const new_channels = new Set(channels.map(channel => channel.userName))
    const join_channels = [...new_channels].filter(channel => !current_channels.has(channel))
    const part_channels = [...current_channels].filter(channel => !new_channels.has(channel) && channel !== selfname)

    if (join_channels.length > 0) {
        console.log(`joining ${join_channels.length} channels`)
        for (const channel of join_channels) twitch.chat.join(channel)
    }
    if (part_channels.length > 0) {
        console.log(`parting ${part_channels.length} channels`)
        for (const channel of part_channels) twitch.chat.part(channel)
    }
}

const streaming_channels = async () => {
    // 21465 is osu!
    const users = database.get_users().map(user => user.twitch_id.toString())
    if (users.length === 0) return
    const channels = (await twitch.api.streams.getStreams({ limit: 100, type: "live", userId: users }))?.data
    if (!channels) return

    const streaming_channel_names = [] as HelixStream[]

    for (const channel of channels) {
        streaming_channel_names.push(channel)
    }

    database.update_live_users(streaming_channel_names.map(channel => +channel.userId))

    return streaming_channel_names
}