import { ButtonWarnings } from '../../ButtonWarnings/ButtonWarnings'
import { Main } from '../../Styles'
import { ApiClientConsumer } from '../App'
import { List } from './List'

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
