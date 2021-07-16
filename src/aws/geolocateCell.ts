import { left, Either, right } from 'fp-ts/lib/Either'

type Location = { lat: number; lng: number; accuracy: number }

export const geolocateCell =
	(apiEndpoint: string) =>
	async (
		{
			area,
			mccmnc,
			cell,
			nw,
		}: {
			area: number
			mccmnc: number
			cell: number
			nw: 'ltem' | 'nbiot'
		},
		retryCount = 0,
	): Promise<Either<string, Location>> =>
		new Promise((resolve, reject) => {
			if (retryCount >= 10)
				return resolve(left(`Maximum retryCount reached (${retryCount})`))
			fetch(
				`${apiEndpoint}/cell?${Object.entries({
					area,
					mccmnc,
					cell,
					nw,
				})
					.map(
						([key, value]) =>
							encodeURIComponent(key) + '=' + encodeURIComponent(value),
					)
					.join('&')}`,
			)
				.then(async (res) => {
					if (res.status === 200) {
						const geolocation = await res.json()
						console.debug('[geolocateCell]', {
							cell: { area, mccmnc, cell },
							geolocation,
						})
						return resolve(right(geolocation as unknown as Location))
					} else if (res.status === 409) {
						const expires = res.headers.get('expires')
						const retryInMs =
							expires !== null
								? Math.floor(new Date(expires).getTime() - Date.now())
								: 60000
						console.debug(
							'[geolocateCell]',
							`Location currently not available, will try again in ${Math.round(
								retryInMs / 1000,
							)} seconds.`,
						)
						setTimeout(async () => {
							const geolocation = await geolocateCell(apiEndpoint)(
								{ area, mccmnc, cell, nw },
								retryCount + 1,
							)
							resolve(geolocation)
						}, Math.min(retryInMs, 10000))
					} else if (res.status === 404) {
						console.error('[geolocateCell]', 'Geolocation for cell not found', {
							cell,
						})
						return resolve(left(`Geolocation for cell not found.`))
					} else {
						console.error('[geolocateCell]', res)
						return resolve(left(`Request failed: ${res.status}.`))
					}
				})
				.catch(reject)
		})
