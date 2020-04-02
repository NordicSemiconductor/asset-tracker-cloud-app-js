import React from 'react'
import { hideOnDesktop } from '../Styles'
import styled from 'styled-components'
import { AvatarPicker } from '../Avatar/AvatarPicker'
import { LoadedCat } from './CatLoader'
import { Editable } from '../Editable/Editable'

const MobileOnlyAvatarPicker = hideOnDesktop(AvatarPicker)
const MobileOnlyH2 = hideOnDesktop(styled.h2``)

export const CatHeader = ({
	cat,
	onAvatarChange,
	onNameChange,
	isNameValid,
}: {
	cat: LoadedCat
	onAvatarChange: (avatar: Blob) => void
	onNameChange: (name: string) => void
	isNameValid: (name: string) => boolean
}) => (
	<>
		<MobileOnlyAvatarPicker key={`${cat.version}`} onChange={onAvatarChange}>
			<img src={cat.avatar} alt={cat.name} className={'avatar'} />
		</MobileOnlyAvatarPicker>
		<MobileOnlyH2>
			<Editable
				key={`${cat.version}`}
				text={cat.name}
				onChange={onNameChange}
				isValid={isNameValid}
			/>
		</MobileOnlyH2>
	</>
)

export const CatPersonalization = ({
	cat,
	onAvatarChange,
	onNameChange,
	isNameValid,
}: {
	cat: LoadedCat
	onAvatarChange: (avatar: Blob) => void
	onNameChange: (name: string) => void
	isNameValid: (name: string) => boolean
}) => (
	<>
		<dl>
			<dt>Name</dt>
			<dd data-intro="Click here to edit the name of your cat.">
				<Editable
					key={`${cat.version}`}
					text={cat.name}
					onChange={onNameChange}
					isValid={isNameValid}
				/>
			</dd>
		</dl>
		<AvatarPicker key={`${cat.version}`} onChange={onAvatarChange}>
			<img
				src={cat.avatar}
				alt={cat.name}
				className={'avatar'}
				data-intro="Click here to upload a new image for your cat."
			/>
		</AvatarPicker>
	</>
)
