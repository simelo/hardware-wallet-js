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
0. Check that version in `package.json` is `X.Y.z-beta.0`, else change it. Increment starting from `0` if release procedure has to be repeated before definitive release.
0. Ensure that the submodule at `./protob` is in sync with respect to the corresponding tag in https://github.com/skycoin/hardware-wallet-protob repository.
0. Update `CHANGELOG.md`: move the "unreleased" changes to the version and add the date.
0. Follow the steps in [pre-release testing](#pre-release-testing)
0. If everything is ok then continue to next step , else fix errors and start again after merge into `release-X.Y.Z` branch.
0. Delete `beta` from version in `package.json`
0. Make a PR to merge release branch into `master`
0. Review the PR and merge it
0. Tag the `master` branch with the version number. Version tags start with `v`, e.g. `v0.20.0`. Sign the tag. If you have your GPG key in github, creating a release on the Github website will automatically tag the release. It can be tagged from the command line with `git tag -as v0.20.0 $COMMIT_ID`, but Github will not recognize it as a "release".
0. Travis should fail if tag name is not equal to version in `package.json`, but check again anyway.
0. Release builds are created and uploaded by travis. To do it manually, checkout the master branch and follow the [create release builds instructions](#creating-release-builds).

#### Pre-release testing

Pre-release testing procedure requires [skycoin-cli](https://github.com/skycoin/skycoin/tree/develop/cmd/cli). Please [install it](https://github.com/skycoin/skycoin/blob/develop/cmd/cli/README.md#install) if not available in your system.

Perform these actions before releasing:

- Start Skywallet emulator and run
```sh
npm run test
```
- Close emulator and plug Skywallet device. Run the same command another time.
- Create new wallet e.g. with `skycoin-cli` (or reuse existing wallet for testing purposes)
```sh

```
- Transfer funds to new wallet (if not already done) and check balance
```sh

```
- Ensure you know at least two addresses for test wallet, if not, [generate some](DOCUMENTATION.md#devAddressGen)
- Execute Skywallet recovery by providing the same mnemonic of aforementioned test wallet
- Create new transaction between two addresses in test wallet
```sh

```
- [Sign transaction](DOCUMENTATION.md#devSkycoinTransactionSign) with Skywallet
- Check that signatures array includes entries for each and every transaction input
- Broadcast transaction
```sh

```
- After a few minutes check that balance changed.
```sh

```
- Create (or reuse) a second wallet
- Transfer funds to new wallet (if not already done) and check balance
```sh

```
- Create new transaction that grabs funds from first address in test wallet (i.e. the one recovered in Skywallet device) and first address in second wallet to deposit them into second adress of test wallet managed by device, with change sent to first address of the test wallet
```sh

```
- [Sign transaction](DOCUMENTATION.md#devSkycoinTransactionSign) with Skywallet
- Check that signatures array does not include an entry for the input 
- Broadcast transaction
```sh

```
- After a few minutes check that balances changed.
```sh

```

# Creating release builds

Release files are created in `dist` directory after running this from the command line

```sh
make release
```
