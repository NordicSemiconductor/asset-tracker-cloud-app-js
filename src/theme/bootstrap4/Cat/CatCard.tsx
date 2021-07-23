import styled from 'styled-components'
import { Card } from 'reactstrap'
import { mobileBreakpoint } from '../../../Styles'
import { CardBody, CardHeader } from 'reactstrap'

const CatCard = styled(Card)`
	img.avatar {
		width: 75px;
		border-radius: 100%;
		border: 2px solid #000000b5;
		box-shadow: 0 2px 4px #00000057;
		background-color: #fff;
	}

	.card-header {
		position: relative;
		text-align: center;
		img.avatar {
			position: absolute;
			top: 0;
			left: 50%;
			margin-left: -38.5px;
			margin-top: -53.5px;
			z-index: 9000;
		}
		h2 {
			margin: 10px;
		}
		div.info {
			text-align: left;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			@media (min-width: ${mobileBreakpoint}) {
				display: grid;
				grid-template: auto / 1fr 1fr 2fr;
				&.connection-information {
					grid-template: auto / 1fr 1fr 1fr 1fr;
				}
			}
			font-size: 85%;
			opacity: 0.75;
			span.reportedTime {
				font-size: 85%;
				opacity: 0.75;
				text-align: right;
				span.textWithIcon {
					width: auto;
					display: inline-block;
				}
			}
			padding-top: 0.5rem;
		}
		div.toggle + div.toggle {
			margin-top: 0.5rem;
			border-top: 1px solid #dcdcdc;
		}
		@media (max-width: ${mobileBreakpoint}) {
			div.info {
				.reportedTime {
					time {
						display: none;
					}
				}
			}
			.toggle.toggle-on {
				div.info {
					.reportedTime {
						time {
							display: inline;
						}
					}
				}
			}
		}
	}
	.card-body {
		h3 {
			font-size: 100%;
			@media (min-width: ${mobileBreakpoint}) {
				font-size: 115%;
			}
			margin: 0;
		}
		h4 {
			font-size: 105%;
		}
		.collapsable {
			&.personalization {
				.content {
					display: flex;
					justify-content: space-between;
				}
			}
		}
	}
`

export const Cat = ({
	header,
	body,
	map,
}: {
	map?: JSX.Element
	header: JSX.Element
	body: JSX.Element
}) => (
	<CatCard>
		{map}
		<CardHeader>{header}</CardHeader>
		<CardBody>{body}</CardBody>
	</CatCard>
)
