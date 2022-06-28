import { CatMapMain } from '../../CatsMap/Container'
import { ApiClientConsumer } from '../App'
import { CatMapLoader } from './Loader'

export const CatsMapPage = () => (
	<CatMapMain>
		<ApiClientConsumer>
			{(apiClient) => <CatMapLoader apiClient={apiClient} />}
		</ApiClientConsumer>
	</CatMapMain>
)
