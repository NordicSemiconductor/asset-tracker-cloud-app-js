import React, { useContext, useEffect, useState } from 'react'
import { isRight, Either } from 'fp-ts/lib/Either'
import { ErrorInfo } from '../Error/ErrorInfo'
import { FlavouredNavbarBrandContext } from '../theme/bootstrap4/Navigation/NavbarBrand'

export type LoadedCat = {
	id: string
	name: string
	avatar: string
	version: number
}

export function CatLoader<
	T extends {
		name?: string
		avatar?: string
		version: number
	},
>({
	catId,
	render,
	loader,
}: {
	catId: string
	loader: (catId: string) => Promise<Either<ErrorInfo, T>>
	render: (args: {
		cat?: T & LoadedCat
		update?: (cat: T & LoadedCat) => void
		loading: boolean
		error?: Error | ErrorInfo
	}) => JSX.Element
}) {
	const [cat, setCat] = useState<T & LoadedCat>()
	const [error, setError] = useState<ErrorInfo>()
	const { setCatInfo } = useContext(FlavouredNavbarBrandContext)

	useEffect(() => {
		let isCancelled = false
		loader(catId)
			.then((cat) => {
				if (!isCancelled) {
					if (isRight(cat)) {
						const c = {
							...cat.right,
							id: catId,
							name: cat.right.name ?? catId,
							avatar: cat.right.avatar ?? 'https://placekitten.com/75/75',
						}
						setCat(c)
						setCatInfo(c)
					} else {
						setError(cat.left)
					}
				}
			})
			.catch((err) => {
				if (!isCancelled) setError(err)
			})
		return () => {
			isCancelled = true
			setCatInfo(undefined)
		}
	}, [catId, loader, setCatInfo])

	const update = (cat: T & LoadedCat) => {
		setCat(cat)
	}

	return render({ cat, update, loading: !error && !cat, error })
}
