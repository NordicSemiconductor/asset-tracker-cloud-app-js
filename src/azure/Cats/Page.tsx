import React from 'react'
import { Main } from '../../Styles'
import { ApiClientConsumer } from '../App'
import { List } from './List'
import { ButtonWarnings } from '../../ButtonWarnings/ButtonWarnings'

export const CatsPage = () => (
	<Main>
		<ApiClientConsumer>
			{(apiClient) => (
				<ButtonWarnings>
					{(buttonWarningProps) => (
						<List apiClient={apiClient} {...buttonWarningProps} />
					)}
				</ButtonWarnings>
			)}
		</ApiClientConsumer>
	</Main>
)
