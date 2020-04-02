import React from 'react'
import { CatLoader } from '../../Cat/CatLoader'
import { ApiClient } from '../api'

export const Cat = ({
	apiClient,
	catId,
}: {
	apiClient: ApiClient
	catId: string
}) => {
	return (
		<CatLoader<any>
			catId={catId}
			loader={async catId => apiClient.getDevice(catId)}
		>
			{(cat, update) => {
				return (
					<>
						<p>{cat.name} is loaded.</p>
						<pre>{JSON.stringify(cat, null, 2)}</pre>
					</>
				)
			}}
		</CatLoader>
	)
}
