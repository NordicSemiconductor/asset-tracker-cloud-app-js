import React, { useState } from 'react'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import { FilePicker } from '../../FilePicker/FilePicker'
import { FooterWithFullWidthButton } from '../../Settings/Settings'
import { DeviceInformation } from '../../@types/device-state'
import { OnCreateUpgradeJob } from './FOTA'
import semver from 'semver'

const getNextAppVersion = (device: DeviceInformation): string =>
	semver.inc(device.v.appV, 'patch') ?? device.v.appV

export const CreateReportedFOTAJobProgress = ({
	device,
	onJob,
	onError,
}: {
	device: DeviceInformation
	onJob: OnCreateUpgradeJob
	onError: (error?: Error) => void
}) => {
	const [updateFile, setUpdateFile] = useState<File>()
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
								const semverMatch = /v([0-9]+\.[0-9]+\..+)\.[^.]+$/.exec(
									file.name,
								)
								if (semverMatch) {
									setNextVersion(semverMatch[1])
								} else {
									setNextVersion(getNextAppVersion(device))
								}
							}}
						/>
					</p>
				</FormGroup>
			</fieldset>
			{updateFile && (
				<fieldset>
					<FormGroup>
						<Label>Size</Label>
						<p>{updateFile.size} bytes</p>
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
								file: updateFile,
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
