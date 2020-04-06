type PropertyMetadata = {
	[key: string]: {
		$lastUpdated: string
	}
}

export type DeviceState = {
	desired: {
		[key: string]: any
		$metadata: PropertyMetadata & {
			$lastUpdated: string
		}
		$version: number
	}
	reported: {
		[key: string]: any
		$metadata: PropertyMetadata & {
			$lastUpdated: string
		}
		$version: number
	}
}
