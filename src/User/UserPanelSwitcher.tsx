import React, { useState } from 'react'
import { Button, Card, CardHeader, Form } from 'reactstrap'
import styled from 'styled-components'

import { Main } from '../Styles'

const HeaderWithLinks = styled(CardHeader)`
	display: flex;
	justify-content: space-between;
	align-items: center;
`
const HeaderLinks = styled.div``
const Title = styled.h2`
	font-size: 140%;
	font-weight: 200;
	margin-bottom: 0;
`

export const UserPanelSwitcher = ({
	children,
}: {
	children: {
		[key: string]: {
			title: string
			child: React.ReactElement<any>
		}
	}
}) => {
	const [current, setCurrent] = useState<string>(Object.keys(children)[0])

	const { title, child } = children[current]

	const isNotCurrent = (v: string) => current !== v

	return (
		<Main>
			<Form>
				<Card>
					{title && (
						<>
							<HeaderWithLinks>
								<Title>{title}</Title>
								<HeaderLinks>
									{Object.keys(children)
										.filter(isNotCurrent)
										.map((o, k) => (
											<Button
												key={k}
												color="link"
												onClick={() => setCurrent(o)}
											>
												{children[o].title}
											</Button>
										))}
								</HeaderLinks>
							</HeaderWithLinks>
							{child}
						</>
					)}
				</Card>
			</Form>
		</Main>
	)
}
