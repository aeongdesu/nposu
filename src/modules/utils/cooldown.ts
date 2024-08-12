export const cooldown_check = (map: Map<string, any>, base: string, thing: string | number, amount?: number) => {
    if (!map.has(base)) map.set(base, new Map())
    const now = Date.now()
    const timestamps = map.get(base)
    const cooldownAmount = amount ?? 3e3
    if (timestamps.has(thing)) {
        const expirationTime = timestamps.get(thing) + cooldownAmount
        if (now < expirationTime) {
            return true
        }
    }
    timestamps.set(thing, now)
    setTimeout(() => timestamps.delete(thing), cooldownAmount)
    return false
}