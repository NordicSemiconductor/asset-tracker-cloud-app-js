import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'

export const mobileBreakpoint = '600px'

export const wideBreakpoint = '1000px'
export const Main = styled.main`
	@media (min-width: ${mobileBreakpoint}) {
		max-width: ${mobileBreakpoint};
		margin: 2rem auto;
	}
`

export const showOnDesktop = (el: React.ComponentType<any>) => styled(el)`
	display: none;
	@media (min-width: ${mobileBreakpoint}) {
		display: block;
	}
`

export const hideOnDesktop = (el: React.ComponentType<any>) => styled(el)`
	@media (min-width: ${mobileBreakpoint}) {
		display: none;
	}
`

export const GlobalStyle = createGlobalStyle`
  @import url("https://rsms.me/inter/inter-ui.css");
  
  body {
    font-family: "Inter UI", sans-serif;
  }
  
  @supports (font-variation-settings: normal) {
    body {
      font-family: "Inter UI var alt", sans-serif;
    }
  }
  
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  label,
  legend,
  dt {
    font-weight: 600;
  }
  
  legend {
    font-size: 100%;
  }

  @media (max-width: ${mobileBreakpoint}) {
  .card-body {
    padding: 0.5rem;
    hr {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }
  .card-header {
    padding: 0.5rem;
  }
}
`
