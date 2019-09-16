import React, { useState } from 'react'
import { ReportedTime } from './ReportedTime'
import { DeviceInformation } from '../DeviceShadow'
import { Collapsable } from '../Collapsable/Collapsable'
import { emojify } from '../Emojify/Emojify'
import { Alert } from 'reactstrap'
import { DeviceInformationDl } from './DeviceInformation'
import { Error as ShowError } from '../Error/Error'
import { FilePicker } from '../FilePicker/FilePicker'
import semver from 'semver'

export const DFU = ({ device }: { device: DeviceInformation }) => (
	<>
		<hr />
		<Collapsable
			id={'cat:dfu'}
			title={<h3>{emojify('🌩️ Device Firmware Upgrade (DFU)')}</h3>}
		>
			{(!device.v.appV && (
				<Alert color={'danger'}>
					The device has not yet reported an application version.
				</Alert>
			)) ||
				null}
			{device.v.appV && (
				<>
					<AppInfo device={device} />
					<UploadFile device={device} />
				</>
			)}
		</Collapsable>
	</>
)

export const AppInfo = ({ device }: { device: DeviceInformation }) => (
	<DeviceInformationDl>
		<dt>Current version</dt>
		<dd>
			<code>{device.v.appV.value}</code>
		</dd>
		<dt>Last updated</dt>
		<dd>
			<ReportedTime
				receivedAt={device.v.brdV.receivedAt}
				reportedAt={new Date(device.ts.value)}
			/>
		</dd>
	</DeviceInformationDl>
)

const getNextAppVersion = (device: DeviceInformation): string =>
	semver.inc(device.v.appV.value, 'patch') || device.v.appV.value

export const UploadFile = ({ device }: { device: DeviceInformation }) => {
	const [hexfile, setHexFile] = useState()
	const [nextVersion, setNextVersion] = useState(getNextAppVersion(device))
	const [target, setTarget] = useState(device.v.brdV.value)
	const [error, setError] = useState()
	return (
		<>
			<h4>Deploy upgrade</h4>
			{error && <ShowError error={error} />}
			<FilePicker
				accept={'text/x-hex,.hex'}
				maxSize={1024 * 1024}
				onError={setError}
				onFile={file => {
					setError(undefined)
					setHexFile(file)
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
						setTarget(targetMatch[0])
					} else {
						setTarget(device.v.brdV.value)
					}
				}}
			/>
			{hexfile && (
				<DeviceInformationDl>
					<dt>Filename</dt>
					<dd>
						<code>{hexfile.file.name}</code>
					</dd>
					<dt>Size</dt>
					<dd>{hexfile.file.size} bytes</dd>
					<dt>Firmware version</dt>
					<dd>
						<input
							type={'text'}
							name={'nextVersion'}
							value={nextVersion}
							onChange={({ target: { value } }) => {
								setNextVersion(value)
							}}
						/>
					</dd>
					<dt>Target </dt>
					<dd>
						<input
							type={'text'}
							name={'target'}
							value={target}
							onChange={({ target: { value } }) => {
								setTarget(value)
							}}
						/>
					</dd>
				</DeviceInformationDl>
			)}
		</>
	)
}
