import React, { useState } from 'react'
import { NavbarBrand } from 'reactstrap'
import logo from '../logo.svg'
import styled from 'styled-components'

export const LogoImg = styled.img`
	margin-right: 0.25rem;
	border-radius: 100%;
`

const defaultNavbarBrand: React.ReactElement<any> = (
	<NavbarBrand href="/">
		<LogoImg
			src={logo}
			width="30"
			height="30"
			className="d-inline-block align-top"
			alt="Cat Tracker"
		/>
		Cat Tracker
	</NavbarBrand>
)

export type NavbarBrandState = {
	navbar: React.ReactElement<any>
	set: (navbar: React.ReactElement<any>) => void
	reset: () => void
}

export const NavbarBrandContext = React.createContext({
	navbar: defaultNavbarBrand,
	set: (navbar: React.ReactElement<any>) => {},
	reset: () => {},
})
export const NavbarBrandConsumer = NavbarBrandContext.Consumer

export const NavbarBrandContextProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
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
