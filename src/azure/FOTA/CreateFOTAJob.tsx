import React, { useState } from 'react'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import { FilePicker } from '../../FilePicker/FilePicker'
import { FooterWithFullWidthButton } from '../../Settings/Settings'
import { OnCreateUpgradeJob } from './FOTA'
import semver from 'semver'
import { AzureFOTAJobProgress } from '../../@types/azure-device'

const getNextAppVersion = (fw: AzureFOTAJobProgress): string =>
	semver.inc(fw.currentFwVersion, 'patch') ?? fw.currentFwVersion

export const CreateReportedFOTAJobProgress = ({
	fw,
	onJob,
	onError,
}: {
	fw: AzureFOTAJobProgress
	onJob: OnCreateUpgradeJob
	onError: (error?: Error) => void
}) => {
	const [upgradeFile, setupgradeFile] = useState<File>()
	const [nextVersion, setNextVersion] = useState('')
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
							onFile={(file) => {
								onError(undefined)
								setupgradeFile(file)
								const semverMatch = /v([0-9]+\.[0-9]+\..+)\.[^.]+$/.exec(
									file.name,
								)
								if (semverMatch) {
									setNextVersion(semverMatch[1])
								} else {
									setNextVersion(getNextAppVersion(fw))
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
								name={'nextVersion'}
								id={'nextVersion'}
								value={nextVersion}
								onChange={({ target: { value } }) => {
									setNextVersion(value)
								}}
							/>
						</FormGroup>
					</fieldset>
					<FooterWithFullWidthButton>
						<Button
							color={'primary'}
							disabled={upgradeFile === undefined || nextVersion.length === 0}
							onClick={() => {
								if (upgradeFile !== undefined) {
									onJob({
										file: upgradeFile,
										version: nextVersion,
									})
								}
							}}
						>
							Deploy upgrade
						</Button>
					</FooterWithFullWidthButton>
				</>
			)}
		</Form>
	)
}
