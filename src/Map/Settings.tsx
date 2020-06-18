import { SettingsFormGroup } from './Map'
import React from 'react'
import { Label, Input } from 'reactstrap'

export const Settings = ({
	enabled,
	numEntries,
	onSettings,
}: {
	enabled: boolean
	numEntries: number
	onSettings: (args: { enabled: boolean; numEntries: number }) => void
}) => (
	<SettingsFormGroup check>
		<Label check>
			<Input
				type="checkbox"
				name="fetchHistoricalData"
				onChange={() => {
					onSettings({
						enabled: !enabled,
						numEntries,
					})
				}}
				checked={enabled}
			/>{' '}
			Fetch history?
		</Label>
		{enabled && (
			<Input
				bsSize={'sm'}
				type="number"
				name="numEntries"
				onChange={({ target: { value } }) => {
					const v = parseInt(value, 10)
					if (!isNaN(v)) {
						onSettings({
							enabled,
							numEntries: v,
						})
					}
				}}
				value={numEntries}
			/>
		)}
	</SettingsFormGroup>
)
