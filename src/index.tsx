import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AWSApp from './aws/App'
import GCPApp from './gcp/App'

const cloudFlavour = process.env.REACT_APP_CLOUD_FLAVOUR

let App
switch (cloudFlavour) {
    case 'GCP':
        console.log(`Launching ${cloudFlavour} app ...`)
        App = GCPApp
        break
    default:
        console.log(`Launching ${cloudFlavour} app ...`)
        App = AWSApp
}

ReactDOM.render(<App />, document.getElementById('root'))
