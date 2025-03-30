[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Raulms29_electron-forge-template&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Raulms29_electron-forge-template)
### Warning 🚧🚧
You will need [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/) to be able to work with and run this project.
## What are we using?
This project is just a template. It's almost empty and contains the minimum amount of dependencies to work with the following technologies.
- [Vue.js](https://vuejs.org/)
- [WebdriverIO](https://webdriver.io/)
- [Electron Forge](https://www.electronforge.io/)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en) with Node Package Manager ([npm](https://www.npmjs.com/))
- [Vitest](https://vitest.dev/)
## Project Setup 🛠️
Clone this repo.
```
git clone https://github.com/Raulms29/electron-forge-template.git
```
Then access the created folder and run the following command:
```
npm run build
```
This will download the necessary dependencies, compile the project and create the resources needed for the installer in the `out` folder. The installer will be located at `out/make`.
Once the build is done, to test the project without an installation use:
```
npm start
```
Try the unit testing with:
```
npm run test
```
Or the component testing with:
```
npm run test:component
```
Try the e2e testing with:
```
npm run test:e2e
```

Based on another template by [AngusLin10](https://github.com/AngusLin10), which can be found [here](https://github.com/AngusLin10/electron-forge-vite-ts-vue/)
