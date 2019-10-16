import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'

export const About = () => (
	<Card data-intro="Did you know that this application is open source? Check out the links!">
		<CardHeader>About</CardHeader>
		<CardBody>
			<p>
				This is the web application of <em>Bifravst</em> which aims to provide a
				concrete end-to-end sample for an IoT product in the asset tracker
				space, a Cat Tracker. You can find the source code on{' '}
				<a href={'https://github.com/bifravst'} target={'_blank'}>
					GitHub
				</a>
				.
			</p>
			<p>
				Please also consider the{' '}
				<a href={'https://bifravst.github.io/'} target={'_blank'}>
					Bifravst handbook
				</a>
				.
			</p>
			<dl>
				<dt>Version</dt>
				<dd>
					<code>{process.env.REACT_APP_VERSION || '0.0.0-development'}</code>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
