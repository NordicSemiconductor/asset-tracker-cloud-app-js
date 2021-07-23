import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'

export const DLCard = ({
	title,
	intro,
	entries,
	children,
}: React.PropsWithChildren<{
	title: string
	intro: string
	entries?: Record<string, React.ReactElement | string>
}>) => (
	<Card data-intro={intro}>
		<CardHeader>{title}</CardHeader>
		<CardBody>
			{children}
			{entries && (
				<dl>
					{Object.entries(entries).map(([k, v]) => (
						<React.Fragment key={k}>
							<dt>{k}</dt>
							<dd>{v}</dd>
						</React.Fragment>
					))}
				</dl>
			)}
		</CardBody>
	</Card>
)
