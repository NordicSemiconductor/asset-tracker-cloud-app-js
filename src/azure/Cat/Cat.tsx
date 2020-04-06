import React, { useState } from 'react'
import { ApiClient } from '../api'
import { CatCard } from '../../Cat/CatCard'
import { CatHeader, CatPersonalization } from '../../Cat/CatPersonality'
import { CardHeader, CardBody, Alert, Card } from 'reactstrap'
import { emojify } from '../../Emojify/Emojify'
import { Collapsable } from '../../Collapsable/Collapsable'
import { DeleteCat } from '../../Cat/DeleteCat'
import { DisplayError } from '../../Error/Error'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { isLeft } from 'fp-ts/lib/Either'
import { Loading } from '../../Loading/Loading'
import { LoadedCat } from '../../Cat/CatLoader'

const isNameValid = (name: string) => /^.{1,255}$/i.test(name)

export const Cat = ({
	apiClient,
	cat,
	update,
}: {
	apiClient: ApiClient
	cat: LoadedCat
	update: (cat: LoadedCat) => void
}) => {
	const [deleted, setDeleted] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<ErrorInfo>()

	if (deleting) {
		return (
			<Card>
				<CardBody>
					<Loading text={`Deleting ${cat.id}...`} />
				</CardBody>
			</Card>
		)
	}

	if (deleted) {
		return (
			<Alert color={'success'}>
				The cat <code>{cat.id}</code> has been deleted.
			</Alert>
		)
	}

	if (error) return <DisplayError error={error} />

	const onAvatarChange = (avatar: Blob) => {
		console.log(`Avatar changed for ${cat.id}.`)
		// Display image directly
		const reader = new FileReader()
		reader.onload = (e: any) => {
			update({
				...cat,
				avatar: e.target.result,
			})
		}
		reader.readAsDataURL(avatar)

		apiClient
			.storeImage(avatar)
			.then(maybeUrl => {
				if (isLeft(maybeUrl)) {
					setError(maybeUrl.left)
				} else {
					apiClient
						.setDeviceAvatar(cat.id, maybeUrl.right.url)
						.then(res => {
							if (isLeft(res)) {
								setError(res.left)
							}
						})
						.catch(setError)
				}
			})
			.catch(setError)

		// FIXME: Implement avatar upload and change
	}
	const onNameChange = (name: string) => {
		console.log(`Name change to ${name}`)
		// FIXME: Implement name change
		update({
			...cat,
			name,
		})
		apiClient
			.setDeviceName(cat.id, name)
			.then(res => {
				if (isLeft(res)) {
					setError(res.left)
				}
			})
			.catch(setError)
	}

	return (
		<CatCard>
			{/* FIXME: Map goes here */}
			<CardHeader>
				<CatHeader
					{...{
						cat,
						isNameValid,
						onAvatarChange,
						onNameChange,
					}}
				></CatHeader>
			</CardHeader>
			<CardBody>
				<Collapsable
					id={'cat:personalization'}
					title={<h3>{emojify('⭐ Personalization')}</h3>}
				>
					<CatPersonalization
						{...{
							cat,
							isNameValid,
							onAvatarChange,
							onNameChange,
						}}
					/>
				</Collapsable>
				<hr />
				<Collapsable
					id={'cat:dangerzone'}
					title={<h3>{emojify('☠️ Danger Zone')}</h3>}
				>
					<DeleteCat
						catId={cat.id}
						onDelete={() => {
							setDeleting(true)
							apiClient
								.deleteDevice(cat.id)
								.then(maybeSuccess => {
									setDeleting(false)
									if (isLeft(maybeSuccess)) {
										setError(maybeSuccess.left)
									} else {
										setDeleted(maybeSuccess.right.success)
									}
								})
								.catch(error => {
									setDeleting(false)
									setError(error)
								})
						}}
					/>
				</Collapsable>
			</CardBody>
		</CatCard>
	)
}
