import React from 'react'
import { CatLoader } from '../../Cat/CatLoader'
import { right } from 'fp-ts/lib/Either'
import { ApiClient } from '../api'

export const Cat = ({
	apiClient,
	catId,
}: {
	apiClient: ApiClient
	catId: string
}) => {
	console.log(catId)
	return (
		<CatLoader<any>
			catId={catId}
			loader={async catId => apiClient.getDevice(catId).then(right)}
		>
			{(cat, update) => {
				return <p>{cat.name} is loaded.</p>
			}}
		</CatLoader>
	)
}
