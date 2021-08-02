import React from 'react'
import { NavbarBrand } from 'reactstrap'
import logo from '../../../logo.svg'
import styled from 'styled-components'
import { CloudFlavour } from '../../../flavour'
import { CatNavbar } from './CatNavbar'
import { CurrentCatInfoContext } from '../../CurrentCatInfoContext'

export const LogoImg = styled.img`
	margin-right: 0.25rem;
	border-radius: 100%;
`

const Flavour = styled.small`
	opacity: 0.75;
	:before {
		content: '(';
		opacity: 0.75;
	}
	:after {
		content: ')';
		opacity: 0.75;
	}
`
export const FlavouredNavbarBrand = ({
	cloudFlavour,
}: {
	cloudFlavour: CloudFlavour
}) => (
	<CurrentCatInfoContext.Consumer>
		{({ avatar, name }) => {
			if (avatar !== undefined && name !== undefined)
				return <CatNavbar name={name} avatar={avatar} />
			return (
				<NavbarBrand href="/">
					<LogoImg
						src={logo}
						width="30"
						height="30"
						className="d-inline-block align-top"
						alt={`Cat Tracker (${cloudFlavour})`}
					/>
					Cat Tracker <Flavour>{cloudFlavour}</Flavour>
				</NavbarBrand>
			)
		}}
	</CurrentCatInfoContext.Consumer>
)
