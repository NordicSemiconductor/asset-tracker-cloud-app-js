import React from 'react'
import { Main } from '../../Styles'
import { ApiClientConsumer } from '../App'
import { Cat } from './Cat'
import { CatRouteProps } from '../../Cat/CatRouteProps'

export const CatPage = (props: CatRouteProps) => (
	<Main>
		<ApiClientConsumer>
			{apiClient => (
				<Cat catId={props.match.params.catId} apiClient={apiClient} />
			)}
		</ApiClientConsumer>
	</Main>
)
