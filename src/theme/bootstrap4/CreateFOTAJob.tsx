import React from 'react'
import { Button, Form, FormGroup, Input, Label } from 'reactstrap'
import { FilePicker } from '../../FilePicker/FilePicker'
import { FooterWithFullWidthButton } from '../../Settings/Settings'

export class CreateFOTAJob<
	P extends {
		onJob: (job: { file: File; targetBoard: string; version: string }) => void
		detectNextVersion: (file: File) => string
		detectTargetBoard: (file: File) => string
	},
> extends React.Component<
	P,
	{
		upgradeFile?: File
		nextVersion: string
		targetBoard: string
		saving: boolean
	}
> {
	constructor(props: Readonly<P>) {
		super(props)
		this.state = {
			nextVersion: '',
			targetBoard: '',
			saving: false,
		}
	}

	render() {
		const { saving, upgradeFile, nextVersion, targetBoard } = this.state
		const { detectNextVersion, detectTargetBoard, onJob } = this.props
		return (
			<Form>
				<fieldset>
					<FormGroup>
						<Label>Firmware file</Label>
						<p>
							<FilePicker
								accept={'text/octet-stream,.bin'}
								maxSize={1024 * 1024}
								disabled={saving}
								onFile={(file) => {
									this.setState({
										upgradeFile: file,
										nextVersion: detectNextVersion(file),
										targetBoard: detectTargetBoard(file),
									})
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
										this.setState({ nextVersion: value })
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
										this.setState({ targetBoard: value })
									}}
								/>
							</FormGroup>
						</fieldset>
						<FooterWithFullWidthButton>
							<Button
								color={'primary'}
								disabled={saving}
								onClick={() => {
									this.setState({ saving: true })
									onJob({
										file: upgradeFile,
										targetBoard,
										version: nextVersion,
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
		)
	}
}
