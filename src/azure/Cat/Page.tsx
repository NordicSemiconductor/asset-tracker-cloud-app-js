import React from 'react'
import { Main } from '../../Styles'
import { ApiClientConsumer } from '../App'
import { Cat } from './Cat'
import { CatRouteProps } from '../../Cat/CatRouteProps'
import { CatLoader } from '../../Cat/CatLoader'
import { Device } from '../api'

export const CatPage = (props: CatRouteProps) => (
	<Main>
		<ApiClientConsumer>
			{apiClient => (
				<CatLoader<Device>
					catId={props.match.params.catId}
					loader={async catId => apiClient.getDevice(catId)}
				>
					{(cat, update) => (
						<Cat cat={cat} update={update} apiClient={apiClient} />
					)}
				</CatLoader>
			)}
		</ApiClientConsumer>
	</Main>
)
