import { left, Either, right } from 'fp-ts/lib/Either'

type Location = { lat: number; lng: number; accuracy: number }

export const geolocatNeighboringCellReport =
	(apiEndpoint: string) =>
	async (
		{ reportId }: { reportId: string },
		retryCount = 0,
	): Promise<Either<string, Location>> =>
		new Promise((resolve, reject) => {
			if (retryCount >= 10)
				return resolve(left(`Maximum retryCount reached (${retryCount})`))
			fetch(`${apiEndpoint}/report/${reportId}/location`)
				.then(async (res) => {
					if (res.status === 200) {
						const location = await res.json()
						console.debug('[geolocatNeighboringCellReport]', {
							location,
						})
						return resolve(right(location as unknown as Location))
					} else if (res.status === 409) {
						const expires = res.headers.get('expires')
						const retryInMs =
							expires !== null
								? Math.floor(new Date(expires).getTime() - Date.now())
								: 60000
						console.debug(
							'[geolocatNeighboringCellReport]',
							`Location currently not available, will try again at ${
								retryInMs / 1000
							} seconds.`,
						)
						setTimeout(async () => {
							const geolocation = await geolocatNeighboringCellReport(
								apiEndpoint,
							)({ reportId }, retryCount + 1)
							resolve(geolocation)
						}, Math.min(retryInMs, 10000))
					} else if (res.status === 404) {
						console.error(
							'[geolocatNeighboringCellReport]',
							'Geolocation for neighboring cell report not found',
							{
								reportId,
							},
						)
						return resolve(
							left(`Geolocation for neighboring cell report not found.`),
						)
					} else {
						console.error('[geolocatNeighboringCellReport]', res)
						return resolve(left(`Request failed: ${res.status}.`))
					}
				})
				.catch(reject)
		})
