import React from 'react'
import { ApiClientConsumer } from '../App'
import { CatMapMain } from '../../theme/bootstrap4/CatsMap/Container'
import { CatMapLoader } from './Loader'

export const CatsMapPage = () => (
	<CatMapMain>
		<ApiClientConsumer>
			{(apiClient) => <CatMapLoader apiClient={apiClient} />}
		</ApiClientConsumer>
	</CatMapMain>
)
