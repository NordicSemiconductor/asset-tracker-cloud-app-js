import React from 'react'
import { CatActions } from './CatActions'
import { Main } from '../../Styles'
import { CatRouteProps } from '../../Cat/CatRouteProps'
import { CatDeleted } from '../../theme/bootstrap4/Cat/CatDeleted'
import { DisplayError } from '../../theme/bootstrap4/Error'
import { ConnectionInformation } from '../../theme/ConnectionInformation'
import { HistoricalButtonPresses } from '../../theme/bootstrap4/HistoricalButtonPresses'
import { Collapsable } from '../../theme/Collapsable/Collapsable'
import { DeleteCat } from '../../theme/bootstrap4/Cat/DeleteCat'
import { Cat } from '../../theme/bootstrap4/Cat/CatCard'
import { Progress } from '../../theme/bootstrap4/Progress'

export const CatPage = (props: CatRouteProps) => (
	<Main>
		<CatActions
			catId={props.match.params.catId}
			renderOnDeleted={() => <CatDeleted catId={props.match.params.catId} />}
			renderError={DisplayError}
			renderConnectionInformation={ConnectionInformation}
			renderHistoricalButtonPresses={HistoricalButtonPresses}
			renderCollapsable={Collapsable}
			renderDelete={DeleteCat}
			renderDivider={() => <hr />}
			render={Cat}
			renderLoading={() => (
				<Progress title={`Opening can for cat ${props.match.params.catId}`} />
			)}
		/>
	</Main>
)
