import React, { useState } from 'react'
import { CatLoader } from '../../Cat/CatLoader'
import { ApiClient, Device } from '../api'
import { CatCard } from '../../Cat/CatCard'
import { CatHeader, CatPersonalization } from '../../Cat/CatPersonality'
import { CardHeader, CardBody, Alert } from 'reactstrap'
import { emojify } from '../../Emojify/Emojify'
import { Collapsable } from '../../Collapsable/Collapsable'
import { DeleteCat } from '../../Cat/DeleteCat'
import { DisplayError } from '../../Error/Error'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { isLeft } from 'fp-ts/lib/Either'

const isNameValid = (name: string) => /^.{1,255}$/i.test(name)

export const Cat = ({
	apiClient,
	catId,
}: {
	apiClient: ApiClient
	catId: string
}) => {
	const [deleted, setDeleted] = useState(false)
	const [error, setError] = useState<ErrorInfo>()

	if (deleted) {
		return (
			<Alert color={'success'}>
				The cat <code>{catId}</code> has been deleted.
			</Alert>
		)
	}

	if (error) return <DisplayError error={error} />

	return (
		<CatLoader<Device>
			catId={catId}
			loader={async catId => apiClient.getDevice(catId)}
		>
			{(cat, update) => {
				const onAvatarChange = (avatar: Blob) => {
					console.log(`Avatar changed for ${catId}.`)
					// Display image directly
					const reader = new FileReader()
					reader.onload = (e: any) => {
						update({
							...cat,
							avatar: e.target.result,
						})
					}
					reader.readAsDataURL(avatar)

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
						.setDeviceName(catId, name)
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
									catId={catId}
									onDelete={() => {
										// FIXME: Implement deletion
										setDeleted(true)
									}}
								/>
							</Collapsable>
						</CardBody>
					</CatCard>
				)
			}}
		</CatLoader>
	)
}
