Admin Tools Safe App

### Running this project
```bash=
yarn
yarn start
```

This will run a local instance of the Safe app. To test it properly you need to run a local instance of the https://github.com/gnosis/safe-react repository.

Furthermore you need to configure the local http server to allow cors

Modify this file `node_modules/react-scripts/config/webpackDevServer.config.js` by adding these lines:

```js=
headers: {
    "Access-Control-Allow-Origin": "\*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
},
```

### Deploy to IPFS

This requires that you have `ipfs` installed (see https://gist.github.com/MiguelBel/b3b5f711aa8d9362afa5f16e4e972461)

```bash=
yarn build
ipfs add -r build
```

### Notes: How to setup a Safe app from scratch

Create Safe app with typescript support using yarn as a package manager.

- `npx create-react-app sapps_getting_started --typescript`
- `cd sapps_getting_started`
- `yarn add https://github.com/gnosis/safe-apps-sdk`
- add `description` and `iconPath` to `manifest.json` (see https://github.com/gnosis/safe-apps-sdk)
- Setup cors as mentioned in the readme of https://github.com/gnosis/safe-react-apps
- Call `initSdk` with `[/.*localhost.*/]` - this allows to use your local safe-react instance
- Add listeners (see https://github.com/gnosis/safe-apps-sdk)
- Install ipfs (https://gist.github.com/MiguelBel/b3b5f711aa8d9362afa5f16e4e972461)
  - `ipfs init`
- `yarn build`
- Make sure that the ipfs deamon is running `ipfs deamon`
- `ipfs add -r build`