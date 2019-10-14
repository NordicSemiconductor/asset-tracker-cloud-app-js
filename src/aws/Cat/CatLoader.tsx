import { ThingInfo } from '../describeIotThing'
import React, { useContext, useEffect, useState } from 'react'
import { Error } from '../../Error/Error'
import { Card, CardBody } from 'reactstrap'
import { Loading } from '../../Loading/Loading'
import { CatNavbar } from '../../Cat/CatNavbar'
import { NavbarBrandContext } from '../../Navigation/NavbarBrand'

export type CatInfo = {
	id: string
	name: string
	avatar: string
	version: number
}
export const CatLoader = ({
	catId,
	describeThing,
	children,
}: {
	catId: string
	describeThing: (deviceId: string) => Promise<ThingInfo>
	children: (
		cat: CatInfo,
		update: (cat: CatInfo) => void,
	) => React.ReactElement<any>
}) => {
	const [cat, setCat] = useState<CatInfo>()
	const [error, setError] = useState<Error>()

	const navbarBrandState = useContext(NavbarBrandContext)
	const resetNavbar = navbarBrandState.reset
	const setNavbar = navbarBrandState.set

	useEffect(() => {
		describeThing(catId)
			.then(({ thingName, attributes, version }) => {
				if (thingName) {
					const name = (attributes && attributes.name) || thingName
					setCat({
						id: catId,
						name,
						avatar:
							(attributes && attributes.avatar) ||
							'https://placekitten.com/75/75',
						version: version || 0,
					})
					setNavbar(
						<CatNavbar name={name} avatar={attributes && attributes.avatar} />,
					)
				}
			})
			.catch(setError)
		return () => {
			resetNavbar()
		}
	}, [describeThing, setNavbar, resetNavbar, catId])

	const update = (cat: CatInfo) => {
		setCat(cat)
		setNavbar(<CatNavbar name={cat.name} avatar={cat.avatar} />)
	}

	if (!cat || error)
		return (
			<Card>
				<CardBody>
					{!cat && <Loading text={`Opening can for ${catId}...`} />}
					{error && <Error error={error} />}
				</CardBody>
			</Card>
		)

	return children(cat, update)
}
