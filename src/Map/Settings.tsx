import { useState } from 'react'
import { Input, Label } from 'reactstrap'
import styled from 'styled-components'
import { mobileBreakpoint } from '../Styles'
import { SettingsFormGroup } from './Map'

const CheckboxContainer = styled.div`
	width: 100%;
	padding: 0 2rem 0 2rem;
	height: 48px;
	display: flex;
	align-items: center;
	@media (min-width: ${mobileBreakpoint}) {
		width: 50%;
		height: auto;
		top: auto;
		right: auto;
		bottom: 0;
		z-index: 10000;
	}
	label {
		font-weight: 400;
	}
`

export type MapSettingsType = {
	enabledLayers: {
		Headings: boolean
		SinglecellLocations: boolean
		MulticellLocations: boolean
		FetchHistory: boolean
	}
	numEntries: number
	follow: boolean
}

export const MapSettings = ({
	initial,
	onSettings,
}: {
	initial: MapSettingsType
	onSettings: (args: MapSettingsType) => void
}) => {
	const [settings, updateSettings] = useState<MapSettingsType>(initial)

	const updateEnabledLayers = (
		update: Partial<MapSettingsType['enabledLayers']>,
	) => {
		const newState: MapSettingsType = {
			...settings,
			enabledLayers: {
				...settings.enabledLayers,
				...update,
			},
		}
		updateSettings(newState)
		onSettings({
			...settings,
			enabledLayers: newState.enabledLayers,
		})
	}

	const UpdateNumEntries = (update: Partial<MapSettingsType['numEntries']>) => {
		const newState: MapSettingsType = {
			...settings,
			numEntries: update,
		}
		updateSettings(newState)
		onSettings({
			numEntries: newState.numEntries,
			enabledLayers: settings.enabledLayers,
			follow: settings.follow,
		})
	}

	return (
		<SettingsFormGroup check>
			<CheckboxContainer>
				<Label>
					<Input
						type="checkbox"
						name="follow"
						onChange={() => {
							const newSettings = {
								...settings,
								follow: !settings.follow,
							}
							updateSettings(newSettings)
							onSettings(newSettings)
						}}
						checked={settings.follow}
					/>{' '}
					Re-center on position
				</Label>
			</CheckboxContainer>
			<CheckboxContainer>
				<Label>
					<Input
						type="checkbox"
						name="headings"
						onChange={() => {
							updateEnabledLayers({
								Headings: !settings.enabledLayers.Headings,
							})
						}}
						checked={settings.enabledLayers.Headings}
					/>{' '}
					Headingmarker
				</Label>
			</CheckboxContainer>
			<CheckboxContainer>
				<Label>
					<Input
						type="checkbox"
						name="singlecellLocation"
						onChange={() => {
							updateEnabledLayers({
								SinglecellLocations:
									!settings.enabledLayers.SinglecellLocations,
							})
						}}
						checked={settings.enabledLayers.SinglecellLocations}
					/>{' '}
					Singlecell locations
				</Label>
			</CheckboxContainer>
			<CheckboxContainer>
				<Label>
					<Input
						type="checkbox"
						name="fetchHistoricalData"
						onChange={() => {
							updateEnabledLayers({
								FetchHistory: !settings.enabledLayers.FetchHistory,
							})
						}}
						checked={settings.enabledLayers.FetchHistory}
					/>{' '}
					Fetch history
				</Label>
				{settings.enabledLayers.FetchHistory && (
					<Input
						bsSize={'sm'}
						type="number"
						name="numEntries"
						onChange={({ target: { value } }) => {
							const v = parseInt(value, 10)
							if (!isNaN(v)) {
								UpdateNumEntries(v)
							}
						}}
						value={settings.numEntries}
					/>
				)}
			</CheckboxContainer>
			<CheckboxContainer>
				<Label>
					<Input
						type="checkbox"
						name="multicellLocation"
						onChange={() => {
							updateEnabledLayers({
								MulticellLocations: !settings.enabledLayers.MulticellLocations,
							})
						}}
						checked={settings.enabledLayers.MulticellLocations}
					/>{' '}
					Multicell locations
				</Label>
			</CheckboxContainer>
		</SettingsFormGroup>
	)
}
