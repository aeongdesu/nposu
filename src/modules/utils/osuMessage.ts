import { Beatmap, Beatmapset } from "osu-api-v2-js"

export const prepare_osu_message = ({ beatmap_info, beatmapset_info }: { beatmap_info: Beatmap.Extended.WithFailtimes, beatmapset_info: Beatmapset.Extended } | { beatmap_info: Beatmap.Extended.WithFailtimesBeatmapset, beatmapset_info: Beatmapset.Extended.Plus }) => {
    const beatmap_id = beatmap_info.id
    const beatmapset_id = beatmapset_info.id
    const artist = beatmapset_info.artist
    const title = beatmapset_info.title
    const status = beatmapset_info.status.toUpperCase()
    const creator = beatmapset_info.creator
    const diff_rating = beatmap_info.difficulty_rating
    const bpm = beatmap_info.bpm
    const version = beatmap_info.version

    return `[${status}] [https://osu.ppy.sh/b/${beatmap_id} ${artist} - ${title} [${version}]] Mapped by ${creator} | ${diff_rating}★ | ${bpm}bpm [https://api.nerinyan.moe/d/${beatmapset_id} NeriNyan]`
}