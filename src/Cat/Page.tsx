import React from 'react'
import { Cat } from './Cat'
import { RouteComponentProps } from 'react-router-dom'

type routeProps = RouteComponentProps<{
	catId: string;
}>;

export const CatPage = (props: routeProps) => (
	<main>
		<Cat catId={props.match.params.catId}/>
	</main>
)
