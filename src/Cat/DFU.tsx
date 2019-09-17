import React, { useState, useEffect } from 'react'
import { DeviceInformation } from '../DeviceShadow'
import { Collapsable } from '../Collapsable/Collapsable'
import { emojify } from '../Emojify/Emojify'
import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap'
import { Error as ShowError } from '../Error/Error'
import { FilePicker } from '../FilePicker/FilePicker'
import semver from 'semver'
import { FooterWithFullWidthButton } from '../Settings/Settings'
import { DeviceUpgradeFirmwareJob } from './listUpgradeFirmwareJobs'
import { useDebouncedCallback } from 'use-debounce'
import styled from 'styled-components'
import { RelativeTime } from '../RelativeTime/RelativeTime'

export type OnCreateUpgradeJob = (args: {
	file: File
	data: Blob
	targetBoard: string
	version: string
}) => Promise<DeviceUpgradeFirmwareJob>

export const DFU = ({
	device,
	onCreateUpgradeJob,
	listUpgradeJobs,
	cancelUpgradeJob,
	deleteUpgradeJob,
}: {
	device: DeviceInformation
	onCreateUpgradeJob: OnCreateUpgradeJob
	listUpgradeJobs: () => Promise<DeviceUpgradeFirmwareJob[]>
	cancelUpgradeJob: (jobId: string) => Promise<void>
	deleteUpgradeJob: (args: {
		jobId: string
		executionNumber: number
	}) => Promise<void>
}) => {
	const [error, setError] = useState()
	const [jobs, setJobs] = useState([] as DeviceUpgradeFirmwareJob[])
	const [addJobKey, setAddJobKey] = useState(1)

	const [debouncedListUpgradeJobs] = useDebouncedCallback(() => {
		listUpgradeJobs()
			.then(setJobs)
			.catch(err => {
				console.error(err)
			})
	}, 250)

	useEffect(() => {
		debouncedListUpgradeJobs()
	}, [debouncedListUpgradeJobs])

	return (
		<>
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
						{error && <ShowError error={error} />}
						<UploadFile
							key={`uploadfile-${addJobKey}`}
							device={device}
							onError={setError}
							onJob={async job =>
								onCreateUpgradeJob(job).then(createdJob => {
									setJobs([createdJob, ...jobs])
									setAddJobKey(addJobKey + 1)
									return createdJob
								})
							}
						/>
					</>
				)}
				{jobs.length > 0 ? (
					<>
						<hr />
						<Jobs
							jobs={jobs}
							cancelUpgradeJob={jobId => {
								cancelUpgradeJob(jobId)
									.then(() => {
										debouncedListUpgradeJobs()
									})
									.catch(err => {
										console.error(err)
									})
							}}
							deleteUpgradeJob={args => {
								deleteUpgradeJob(args)
									.then(() => {
										debouncedListUpgradeJobs()
									})
									.catch(err => {
										console.error(err)
									})
							}}
						/>
					</>
				) : null}
			</Collapsable>
		</>
	)
}

const JobItem = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

const TimeInfo = styled.span`
	margin-left: 0.5rem;
`

const UpgradeDocument = styled.dl`
	display: flex;
	font-size: 80%;
	dt,
	dl {
		margin-right: 0.25rem;
		margin-left: 0.25rem;
	}
	dt:first-child {
		margin-left: 0;
	}
`

const DownloadLink = styled.a`
	font-size: 80%;
`

const Jobs = ({
	jobs,
	cancelUpgradeJob,
	deleteUpgradeJob,
}: {
	jobs: DeviceUpgradeFirmwareJob[]
	cancelUpgradeJob: (jobId: string) => void
	deleteUpgradeJob: (args: { jobId: string; executionNumber: number }) => void
}) => {
	return (
		<>
			<h4>Jobs for this device</h4>
			{jobs.map(
				({
					jobId,
					status,
					description,
					queuedAt,
					startedAt,
					lastUpdatedAt,
					executionNumber,
					document: { size, fwversion, targetBoard, location, filename },
				}) => {
					const isCanceled = status === 'CANCELED'
					const canCancel = status === 'QUEUED'
					return (
						<JobItem key={jobId}>
							<span>
								<code>{status}</code>{' '}
								{!isCanceled && queuedAt && (
									<TimeInfo>
										{emojify('📩 ')}
										<RelativeTime ts={queuedAt} />
									</TimeInfo>
								)}
								{startedAt && (
									<TimeInfo>
										{emojify('⏳ ')}
										<RelativeTime ts={startedAt} />
									</TimeInfo>
								)}
								{lastUpdatedAt && (
									<TimeInfo>
										{emojify('🕒 ')}
										<RelativeTime ts={lastUpdatedAt} />
									</TimeInfo>
								)}
								<br />
								<em>{description}</em>
								<br />
								<DownloadLink href={location} target={'_blank'}>
									{filename}
								</DownloadLink>
								<UpgradeDocument>
									<dt>Version:</dt>
									<dd>{fwversion}</dd>
									<dt>Size:</dt>
									<dd>{size} byte</dd>
									<dt>Target Board:</dt>
									<dd>{targetBoard}</dd>
								</UpgradeDocument>
							</span>
							{canCancel && (
								<Button
									color={'danger'}
									onClick={() => cancelUpgradeJob(jobId)}
								>
									Cancel
								</Button>
							)}
							{isCanceled && (
								<Button
									color={'danger'}
									outline
									onClick={() =>
										deleteUpgradeJob({
											jobId,
											executionNumber,
										})
									}
								>
									Delete
								</Button>
							)}
						</JobItem>
					)
				},
			)}
		</>
	)
}

const getNextAppVersion = (device: DeviceInformation): string =>
	semver.inc(device.v.appV.value, 'patch') || device.v.appV.value

export const UploadFile = ({
	device,
	onJob,
	onError,
}: {
	device: DeviceInformation
	onJob: OnCreateUpgradeJob
	onError: (error?: Error) => void
}) => {
	const [hexfile, setHexFile] = useState()
	const [nextVersion, setNextVersion] = useState(getNextAppVersion(device))
	const [targetBoard, setTargetBoard] = useState(device.v.brdV.value)
	const [saving, setSaving] = useState(false)
	return (
		<>
			<Form>
				<fieldset>
					<FormGroup>
						<Label>Firmware file</Label>
						<p>
							<FilePicker
								accept={'text/x-hex,.hex'}
								maxSize={1024 * 1024}
								onError={onError}
								disabled={saving}
								onFile={file => {
									onError(undefined)
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
										setTargetBoard(targetMatch[0])
									} else {
										setTargetBoard(device.v.brdV.value)
									}
								}}
							/>
						</p>
					</FormGroup>
				</fieldset>
				{hexfile && (
					<>
						<fieldset>
							<FormGroup>
								<Label>Size</Label>
								<p>{hexfile.file.size} bytes</p>
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
										data: hexfile.data,
										file: hexfile.file,
										targetBoard,
										version: nextVersion,
									}).catch(error => {
										console.log(error)
									})
								}}
							>
								{saving && 'Creating ...'}
								{!saving && 'Create upgrade job'}
							</Button>
						</FooterWithFullWidthButton>
					</>
				)}
			</Form>
		</>
	)
}
