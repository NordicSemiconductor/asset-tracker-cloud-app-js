import React, { useState } from 'react'
import { NavbarBrand } from 'reactstrap'
import logo from '../../../logo.svg'
import styled from 'styled-components'
import { CloudFlavour } from '../../../flavour'
import { CatNavbar } from './CatNavbar'

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
type CatInfo = { avatar: string; name: string }
export const FlavouredNavbarBrandContext = React.createContext<{
	setCatInfo: (args?: CatInfo) => void
	catInfo?: CatInfo
}>({
	setCatInfo: () => undefined,
})

export const FlavouredNavbarBrandContextProvider = ({
	children,
}: React.PropsWithChildren<any>) => {
	const [catInfo, setCatInfo] = useState<CatInfo>()
	return (
		<FlavouredNavbarBrandContext.Provider value={{ setCatInfo, catInfo }}>
			{children}
		</FlavouredNavbarBrandContext.Provider>
	)
}

export const FlavouredNavbarBrand = ({
	cloudFlavour,
}: {
	cloudFlavour: CloudFlavour
}) => (
	<FlavouredNavbarBrandContext.Consumer>
		{({ catInfo }) => {
			if (catInfo !== undefined) return <CatNavbar {...catInfo} />
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
	</FlavouredNavbarBrandContext.Consumer>
)
