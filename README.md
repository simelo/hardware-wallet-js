# Javascript interface for the Skycoin hardware wallet

[![Build Status](https://travis-ci.com/skycoin/hardware-wallet-js.svg?branch=master)](https://travis-ci.com/skycoin/hardware-wallet-js)

Generate messages.js library:

    npm run make-protobuf-files

## Documentation

The documentation of the library is in [DOCUMENTATION.md](DOCUMENTATION.md)

## Development setup

### Running tests

```sh
$ npm run test
```

### Releases

#### Update the version

0. If the `master` branch has commits that are not in `develop` (e.g. due to a hotfix applied to `master`), merge `master` into `develop` (and fix any build or test failures)
0. Switch to a new release branch named `release-X.Y.Z` for preparing the release.
0. Ensure that the submodule at `protob` is in sync with respect to the corresponding tag in https://github.com/skycoin/hardware-wallet-protob repository.
0. Update `CHANGELOG.md`: move the "unreleased" changes to the version and add the date.
0. Follow the steps in [pre-release testing](#pre-release-testing)
0. Make a PR merging the release branch into `master`
0. Review the PR and merge it
0. Tag the `master` branch with the version number. Version tags start with `v`, e.g. `v0.20.0`. Sign the tag. If you have your GPG key in github, creating a release on the Github website will automatically tag the release. It can be tagged from the command line with `git tag -as v0.20.0 $COMMIT_ID`, but Github will not recognize it as a "release".
0. Release builds are created and uploaded by travis. To do it manually, checkout the master branch and follow the [create release builds instructions](#creating-release-builds).

#### Pre-release testing

Perform these actions before releasing:

- Start Skywallet emulator and run
```sh
npm run test
```
- Close emulator and plug Skywallet device. Run the same command another time.
- Use desktop wallet to reate new wallet.
- Transfer funds to new wallet
- Recover wallet in Skywallet device with the mnemonic of anterior wallet
- Create new transaction (how?)
- Sign transaction with Skywallet
- Send transaction (how?)
- Check in desktop wallet that total money changed.

# Creating release builds

Release files are created in `dist` directory after running this from the command line

```sh
make release
```
