export const rsrpToPercent = (rsrp: number): number => {
	if (rsrp <= -110) return 0
	if (rsrp < -70) {
		return (rsrp + 110) / 40
	}
	return 1
}
