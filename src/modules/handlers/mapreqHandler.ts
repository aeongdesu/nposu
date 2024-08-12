import type { API } from "osu-api-v2-js"

const osu_beatmap_patterns: { [key: string]: RegExp } = {
    "beatmap_official": /https?:\/\/osu.ppy.sh\/beatmapsets\/[0-9]+\#(osu|taiko|fruits|mania)\/([0-9]+)/,
    "beatmap_old": /https?:\/\/(osu|old).ppy.sh\/b\/([0-9]+)/,
    "beatmap_alternate": /https?:\/\/osu.ppy.sh\/beatmaps\/([0-9]+)/,
    "beatmap_old_alternate": /https?:\/\/(osu|old).ppy.sh\/p\/beatmap\?b=([0-9]+)/,
    "beatmapset_official": /https?:\/\/osu.ppy.sh\/beatmapsets\/([0-9]+)/,
    "beatmapset_old": /https?:\/\/(osu|old).ppy.sh\/s\/([0-9]+)/,
    "beatmapset_old_alternate": /https?:\/\/(osu|old).ppy.sh\/p\/beatmap\?s=([0-9]+)/,
}

const MAP_TYPE = {
    "BEATMAP": 0,
    "BEATMAPSET": 1
}

export type MAP = {
    id: number,
    type: number
}

export const mapreq_check = (message: string): MAP | undefined => {
    for (let pattern in osu_beatmap_patterns) {
        const matches = message.match(osu_beatmap_patterns[pattern])
        if (matches) {
            const id = +matches[matches.length - 1]
            if (id === 0 || isNaN(id)) return

            if (pattern.includes("beatmap_")) {
                return { id, type: MAP_TYPE.BEATMAP }
            } else {
                return { id, type: MAP_TYPE.BEATMAPSET }
            }
        }
    }
    return
}

export const mapreq_handler = async (osuapi: API, map: MAP) => {
    try {
        if (map.type === MAP_TYPE.BEATMAPSET) {
            const beatmapset = await osuapi.getBeatmapset(map.id)
            const beatmap = beatmapset.beatmaps[beatmapset.beatmaps.length - 1]
            return { beatmapset_info: beatmapset, beatmap_info: beatmap }
        } else {
            const beatmap = await osuapi.getBeatmap(map.id)
            return { beatmapset_info: beatmap.beatmapset, beatmap_info: beatmap }
        }
    } catch (e) {
        console.error(e)
        return
    }
}