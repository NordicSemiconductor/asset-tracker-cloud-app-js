import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { ReactAppConfigType } from '..'

export const About = ({ config }: { config: ReactAppConfigType }) => (
	<Card data-intro="Did you know that this application is open source? Check out the links!">
		<CardHeader>About</CardHeader>
		<CardBody>
			<p>
				This is the web application of <em>Bifravst</em> which aims to provide a
				concrete end-to-end sample for an IoT product in the asset tracker
				space, a Cat Tracker. You can find the source code on{' '}
				<a
					href={'https://github.com/bifravst'}
					target="_blank"
					rel="noopener noreferrer"
				>
					GitHub
				</a>
				.
			</p>
			<p>
				Please also consider the{' '}
				<a
					href={
						'https://nordicsemiconductor.github.io/asset-tracker-cloud-docs/'
					}
					target="_blank"
					rel="noopener noreferrer"
				>
					Bifravst handbook
				</a>
				.
			</p>
			<dl>
				<dt>Version</dt>
				<dd>
					<code>{config.version}</code>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
