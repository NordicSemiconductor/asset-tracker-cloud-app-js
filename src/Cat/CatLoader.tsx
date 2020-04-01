import React, { useContext, useEffect, useState } from 'react'
import { Error } from '../Error/Error'
import { Card, CardBody } from 'reactstrap'
import { Loading } from '../Loading/Loading'
import { CatNavbar } from '../Cat/CatNavbar'
import { NavbarBrandContext } from '../Navigation/NavbarBrand'
import { isRight, Either } from 'fp-ts/lib/Either'

type LoadedCat = { id: string; name: string; avatar: string }

export function CatLoader<
	T extends {
		name?: string
		avatar?: string
	}
>({
	catId,
	children,
	loader,
}: {
	catId: string
	loader: (catId: string) => Promise<Either<Error, T>>
	children: (
		cat: LoadedCat & T,
		update: (cat: LoadedCat & T) => void,
	) => React.ReactElement<any>
}) {
	const [cat, setCat] = useState<LoadedCat & T>()
	const [error, setError] = useState<Error>()

	const navbarBrandState = useContext(NavbarBrandContext)
	const resetNavbar = navbarBrandState.reset
	const setNavbar = navbarBrandState.set

	useEffect(() => {
		let isCancelled = false
		loader(catId)
			.then(cat => {
				if (!isCancelled) {
					if (isRight(cat)) {
						const c = {
							...cat.right,
							id: catId,
							name: cat.right.name || catId,
							avatar: cat.right.avatar || 'https://placekitten.com/75/75',
						}
						setCat(c)
						setNavbar(<CatNavbar name={c.name} avatar={c.avatar} />)
					} else {
						setError(cat.left)
					}
				}
			})
			.catch(err => {
				if (!isCancelled) setError(err)
			})
		return () => {
			isCancelled = true
			resetNavbar()
		}
	}, [catId, loader, resetNavbar, setNavbar])

	const update = (cat: LoadedCat & T) => {
		setCat(cat)
		setNavbar(<CatNavbar name={cat.name} avatar={cat.avatar} />)
	}

	if (error) return <Error error={error} />

	if (!cat)
		return (
			<Card>
				<CardBody>
					<Loading text={`Opening can for ${catId}...`} />
				</CardBody>
			</Card>
		)

	return children(cat, update)
}
