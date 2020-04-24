import semver from 'semver'
import React, { useState } from 'react'
import { Button, Form, FormGroup, Input, Label } from 'reactstrap'
import { FilePicker } from '../FilePicker/FilePicker'
import { FooterWithFullWidthButton } from '../Settings/Settings'
import { OnCreateUpgradeJob } from './FOTA'
import { DeviceInformation } from '../@types/device-state'

const getNextAppVersion = (device: DeviceInformation): string =>
	semver.inc(device.v.appV, 'patch') || device.v.appV

export const CreateFOTAJob = ({
	device,
	onJob,
	onError,
}: {
	device: DeviceInformation
	onJob: OnCreateUpgradeJob
	onError: (error?: Error) => void
}) => {
	const [updateFile, setUpdateFile] = useState<{
		file: File
		data: Blob
	}>()
	const [nextVersion, setNextVersion] = useState(getNextAppVersion(device))
	const [targetBoard, setTargetBoard] = useState(device.v.brdV)
	const [saving, setSaving] = useState(false)
	return (
		<Form>
			<fieldset>
				<FormGroup>
					<Label>Firmware file</Label>
					<p>
						<FilePicker
							accept={'text/octet-stream,.bin'}
							maxSize={1024 * 1024}
							onError={onError}
							disabled={saving}
							onFile={(file) => {
								onError(undefined)
								setUpdateFile(file)
								const semverMatch = /v([0-9]+\.[0-9]+\..+)\.[^.]+$/.exec(
									file.file.name,
								)
								const targetMatch = /pca[0-9]+/i.exec(file.file.name)
								if (semverMatch) {
									setNextVersion(semverMatch[1])
								} else {
									setNextVersion(getNextAppVersion(device))
								}
								if (targetMatch) {
									setTargetBoard(targetMatch[0])
								} else {
									setTargetBoard(device.v.brdV)
								}
							}}
						/>
					</p>
				</FormGroup>
			</fieldset>
			{updateFile && (
				<>
					<fieldset>
						<FormGroup>
							<Label>Size</Label>
							<p>{updateFile.file.size} bytes</p>
						</FormGroup>
						<FormGroup>
							<Label for={'nextVersion'}>Firmware version</Label>
							<Input
								type={'text'}
								disabled={saving}
								name={'nextVersion'}
								id={'nextVersion'}
								value={nextVersion}
								onChange={({ target: { value } }) => {
									setNextVersion(value)
								}}
							/>
						</FormGroup>
						<FormGroup>
							<Label for={'targetBoard'}>Target Board</Label>
							<Input
								type={'text'}
								disabled={saving}
								id={'targetBoard'}
								name={'targetBoard'}
								value={targetBoard}
								onChange={({ target: { value } }) => {
									setTargetBoard(value)
								}}
							/>
						</FormGroup>
					</fieldset>
					<FooterWithFullWidthButton>
						<Button
							color={'primary'}
							disabled={saving}
							onClick={() => {
								setSaving(true)
								onJob({
									data: updateFile.data,
									file: updateFile.file,
									targetBoard,
									version: nextVersion,
								}).catch(console.error)
							}}
						>
							{saving && 'Creating ...'}
							{!saving && 'Create upgrade job'}
						</Button>
					</FooterWithFullWidthButton>
				</>
			)}
		</Form>
	)
}
