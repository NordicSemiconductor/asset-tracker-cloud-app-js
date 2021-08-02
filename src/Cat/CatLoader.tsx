import { useContext, useEffect, useState } from 'react'
import { isRight, Either } from 'fp-ts/lib/Either'
import { ErrorInfo } from '../Error/ErrorInfo'
import { CurrentCatInfoContext } from '../theme/CurrentCatInfoContext'

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
	renderLoading,
	renderError,
	loader,
}: {
	catId: string
	loader: (catId: string) => Promise<Either<ErrorInfo, T>>
	renderLoading: () => JSX.Element
	renderError: (args: { error: Error | ErrorInfo }) => JSX.Element
	render: (args: {
		cat: T & LoadedCat
		update: (cat: T & LoadedCat) => void
	}) => JSX.Element
}) {
	const [cat, setCat] = useState<T & LoadedCat>()
	const [error, setError] = useState<ErrorInfo>()
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
		}
	}, [catId, loader])

	const { setCatInfo } = useContext(CurrentCatInfoContext)
	useEffect(() => {
		setCatInfo(cat)
		return () => {
			setCatInfo(undefined)
		}
	}, [cat, setCatInfo])

	const update = (cat: T & LoadedCat) => {
		setCat(cat)
	}

	const loading = !error && !cat

	if (loading) return renderLoading()
	if (error) return renderError({ error })
	if (cat === undefined || update === undefined)
		return renderError({
			error: {
				message: `Failed to load cat`,
				type: 'Error',
			},
		})

	return render({ cat, update })
}
