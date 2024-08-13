import database from "../modules/utils/database"

export default {
    execute: async (_cmd: string[], channelId: string | null) => {
        const status = !database.get_user(channelId!)?.mapinfo_enabled
        database.update_user(channelId!, { mapinfo_enabled: status })
        return `sending map info in chat is now ${status ? "enabled" : "disabled"}`
    }
}