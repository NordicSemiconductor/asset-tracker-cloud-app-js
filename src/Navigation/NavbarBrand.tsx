import React, { useState } from 'react'
import { NavbarBrand } from 'reactstrap'
import styled from 'styled-components'
import logo from '../logo.svg'

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

const defaultNavbarBrand: React.ReactElement<any> = (
	<NavbarBrand href="/">
		<LogoImg
			src={logo}
			width="30"
			height="30"
			className="d-inline-block align-top"
			alt={`nRF Asset Tracker (Azure)`}
		/>
		nRF Asset <Flavour>Azure</Flavour>
	</NavbarBrand>
)

export type NavbarBrandState = {
	navbar: React.ReactElement<any>
	set: (navbar: React.ReactElement<any>) => void
	reset: () => void
}

export const NavbarBrandContext = React.createContext<NavbarBrandState>({
	navbar: defaultNavbarBrand,
	set: (navbar: React.ReactElement<any>) => undefined,
	reset: () => undefined,
})
export const NavbarBrandConsumer = NavbarBrandContext.Consumer

export const NavbarBrandContextProvider = ({
	children,
}: React.PropsWithChildren<any>) => {
	const set = (navbar: React.ReactElement<any>) => {
		setState({ ...state, navbar })
	}

	const reset = () => {
		setState({ ...state, navbar: defaultNavbarBrand })
	}

	const [state, setState] = useState({
		navbar: defaultNavbarBrand,
		set,
		reset,
	})

	return (
		<NavbarBrandContext.Provider value={state}>
			{children}
		</NavbarBrandContext.Provider>
	)
}
