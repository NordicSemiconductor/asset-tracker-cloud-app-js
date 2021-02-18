import semver from 'semver'
import React, { useState } from 'react'
import { Button, Form, FormGroup, Input, Label } from 'reactstrap'
import { FilePicker } from '../../FilePicker/FilePicker'
import { FooterWithFullWidthButton } from '../../Settings/Settings'
import { OnCreateUpgradeJob } from './FOTA'
import { AWSDeviceInformation } from '../../@types/aws-device'

const getNextAppVersion = (device: AWSDeviceInformation): string =>
	semver.inc(device.v.appV, 'patch') ?? device.v.appV

export const CreateFOTAJob = ({
	device,
	onJob,
	onError,
}: {
	device: AWSDeviceInformation
	onJob: OnCreateUpgradeJob
	onError: (error?: Error) => void
}) => {
	const [upgradeFile, setUpgradeFile] = useState<File>()
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
								setUpgradeFile(file)
								const semverMatch = /v([0-9]+\.[0-9]+\..+)\.[^.]+$/.exec(
									file.name,
								)
								const targetMatch = /pca[0-9]+/i.exec(file.name)
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
					{upgradeFile && <p>Size: {upgradeFile.size} bytes</p>}
				</FormGroup>
			</fieldset>
			{upgradeFile && (
				<>
					<fieldset>
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
									file: upgradeFile,
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
