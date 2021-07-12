type Position = { lat: number; lng: number }

export const centerOnLatestLocation = <
	L extends { position: Position; ts: Date },
>(
	locations: (L | undefined)[],
): Position => {
	const isNotUndefined = (el?: L): el is L => el !== undefined
	const possibleCenters: { position: Position; ts: Date }[] =
		locations.filter(isNotUndefined)
	return possibleCenters.sort(
		({ ts: tsA }, { ts: tsB }) => tsB.getTime() - tsA.getTime(),
	)[0].position
}
