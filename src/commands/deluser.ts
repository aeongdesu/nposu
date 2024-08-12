import { twitch } from "../modules/utils/apiClient"
import database from "../modules/utils/database"

export default {
    ownerOnly: true,
    execute: async (cmd: string[]) => {
        if (cmd.length !== 2) return "Usage: deluser <twitch username>"
        const twitch_userid = (await twitch.api.users.getUserByName(cmd[1]))?.id
        if (!twitch_userid) return "twitch user not found?"
        const check_existing_user = database.get_users().find(user => user.twitch_id === +twitch_userid)
        if (!check_existing_user) return "user not exist!"
        twitch.chat.part(cmd[1])
        database.del_user(twitch_userid)
        return "user deleted!"
    }
}