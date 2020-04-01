import React from 'react'
import { CatActions } from './CatActions'
import { Main } from '../../Styles'
import { CatRouteProps } from '../../Cat/CatRouteProps'

export const CatPage = (props: CatRouteProps) => (
	<Main>
		<CatActions catId={props.match.params.catId} />
	</Main>
)
