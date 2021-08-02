# UI components

This folder contains UI components used to render the application.

Because they are passed in as
[render props](https://reactjs.org/docs/render-props.html) they must not use
hooks, because hooks depend on the order (and amount) of hook calls to be
exactly the same for each render.
