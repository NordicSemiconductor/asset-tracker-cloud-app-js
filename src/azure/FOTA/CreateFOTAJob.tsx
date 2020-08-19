import React, { useState } from 'react'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import { FilePicker } from '../../FilePicker/FilePicker'
import { FooterWithFullWidthButton } from '../../Settings/Settings'
import { DeviceInformation } from '../../@types/device-state'
import { OnCreateUpgradeJob } from './FOTA'

export const CreateReportedFOTAJobProgress = ({
	onJob,
	onError,
}: {
	device: DeviceInformation
	onJob: OnCreateUpgradeJob
	onError: (error?: Error) => void
}) => {
	const [updateFile, setUpdateFile] = useState<{
		file: File
		data: ArrayBuffer
	}>()
	const [nextVersion, setNextVersion] = useState('')
	return (
		<Form>
			<fieldset>
				<FormGroup>
					<Label for={'nextVersion'}>Firmware version</Label>
					<Input
						type={'text'}
						name={'nextVersion'}
						id={'nextVersion'}
						value={nextVersion}
						onChange={({ target: { value } }) => {
							setNextVersion(value)
						}}
					/>
				</FormGroup>
				<FormGroup>
					<Label>Firmware file</Label>
					<p>
						<FilePicker
							accept={'text/octet-stream,.bin'}
							maxSize={1024 * 1024}
							onError={onError}
							onFile={(file) => {
								onError(undefined)
								setUpdateFile(file)
							}}
						/>
					</p>
				</FormGroup>
			</fieldset>
			{updateFile && (
				<fieldset>
					<FormGroup>
						<Label>Size</Label>
						<p>{updateFile.file.size} bytes</p>
					</FormGroup>
				</fieldset>
			)}
			<FooterWithFullWidthButton>
				<Button
					color={'primary'}
					disabled={updateFile === undefined || nextVersion.length === 0}
					onClick={() => {
						if (updateFile !== undefined) {
							onJob({
								data: updateFile.data,
								file: updateFile.file,
								version: nextVersion,
							})
						}
					}}
				>
					Deploy upgrade
				</Button>
			</FooterWithFullWidthButton>
		</Form>
	)
}
