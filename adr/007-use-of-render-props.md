# ADR 007: use of render props

[Render props](https://reactjs.org/docs/render-props.html) are used to separate
the logic from the represenation in this application.

This adds a layer of abstraction which allows the re-use of logic-heavy
components (like the Settings, or the Cat page) with a custom design.

Users can then fork the project and only need to look into the `theme` folder to
fully customize the design of the application.
