import React from 'react'
import { Cat } from './Cat'
import { RouteComponentProps } from 'react-router-dom'
import { Main } from '../Styles'

type routeProps = RouteComponentProps<{
	catId: string
}>

export const CatPage = (props: routeProps) => (
	<Main>
		<Cat catId={props.match.params.catId} />
	</Main>
)
