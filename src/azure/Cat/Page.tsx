import { CatLoader } from '../../Cat/CatLoader'
import { CatRouteProps } from '../../Cat/CatRouteProps'
import { Main } from '../../Styles'
import { Device } from '../api'
import { ApiClientConsumer } from '../App'
import { Cat } from './Cat'

export const CatPage = (props: CatRouteProps) => (
	<Main>
		<ApiClientConsumer>
			{(apiClient) => (
				<CatLoader<Device>
					catId={props.match.params.catId}
					loader={async (catId) => apiClient.getDevice(catId)}
				>
					{(cat, update) => (
						<Cat cat={cat} update={update} apiClient={apiClient} />
					)}
				</CatLoader>
			)}
		</ApiClientConsumer>
	</Main>
)
