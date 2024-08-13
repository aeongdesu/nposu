import { osuapi, twitch } from "../modules/utils/apiClient"
import database from "../modules/utils/database"

export default {
    ownerOnly: true,
    execute: async (cmd: string[]) => {
        if (cmd.length !== 3) return "Usage: adduser <twitch username> <osu username>"
        const twitch_userid = (await twitch.api.users.getUserByName(cmd[1]))?.id
        if (!twitch_userid) return "twitch user not found?"
        const osu_userid = (await osuapi.getUser(cmd[2]))?.id
        if (!osu_userid) return "osu user not found?"
        const check_existing_user = database.get_users().find(user => user.twitch_id === +twitch_userid || user.osu_id === osu_userid)
        if (check_existing_user) return "user already exists!"
        database.add_user(twitch_userid, osu_userid)
        twitch.chat.join(cmd[1])
        return "user added!"
    }
}