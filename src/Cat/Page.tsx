import React from 'react'
import { CatActions } from './aws/CatActions'
import { RouteComponentProps } from 'react-router-dom'
import { Main } from '../Styles'

type routeProps = RouteComponentProps<{
	catId: string
}>

export const CatPage = (props: routeProps) => (
	<Main>
		<CatActions catId={props.match.params.catId} />
	</Main>
)
