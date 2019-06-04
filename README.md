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

Pre-release testing procedure requires [skycoin-cli](https://github.com/skycoin/skycoin/tree/develop/cmd/cli). Please [install it](https://github.com/skycoin/skycoin/blob/develop/cmd/cli/README.md#install) if not available in your system. Some operations in the process require [running a Skycoin node](https://github.com/skycoin/skycoin/tree/master/INTEGRATION.md#running-the-skycoin-node). Also clone [Skywallet firmware repository](https://github.com/skycoin/hardware-wallet/) in advance.

The instructions that follow are meant to be followed for Skywallet devices flashed without memory protection. If your device memory is protected then some values might be different e.g. `firmwareFeatures`.

During the process beware of the fact that running an Skycoin node in the background can block the Skywallet from running.

Some values need to be known during the process. They are represented by the following variables:

- `WALLET1`, `WALLET2`, ... names of wallets created by `skycoin_cli`
- `ADDRESS1`, `ADDRESS2`, ... Skycoin addresses
- `TXN1_RAW`, `TXN2_RAW`, ... transactions data encoded iun hex dump format
- `TXN1_ID`, `TXN2_ID`, ... Hash ID of transactions after broadcasting to the P2P network
- `AMOUNT` represents an arbitrary number of coins
- `ID1`, `ID2`, `ID3`, ... unique ID values , usually strings identifying hardware or software artifacts

Perform these actions before releasing:

**Note** : In all cases `skycoin-cli` would be equivalent to `go run cmd/cli/cli.go` if current working directory set to `$GOPATH/src/github.com/skycoin/skycoin`.

##### Run project test suite

- Open a terminal window and run Skywallet emulator. Wait for emulator UI to display.
- From a separate trminal window run the test suite as follows
```sh
npm run test
```
- Close emulator and plug Skywallet device. Run the same command another time.

##### Run manual tests

- Edit `./test/test_codes.js` and set all `test*` variables to true
- Run `( cd test && node test_codes.js )`

##### Run transaction tests

- Create new wallet e.g. with `skycoin-cli` (or reuse existing wallet for testing purposes)
```sh
skycoin-cli walletCreate -f $WALLET1.wlt -l $WALLET1
```
- From command output take note of the seed `SEED1` and address `ADDRESS1`
- List wallet addresses and confirm that `ADDRESS1` is the only value in the list.
```sh
skycoin-cli listAddresses $WALLET1.wlt
```
- Transfer funds to `ADDRESS1` in new wallet in two transactions
- Check balance
```sh
skycoin-cli addressBalance $ADDRESS1
```
- List address for `WALLET1` and check that `heqd_outputs` in response includes to outputs with `address` set to `ADDRESS1`
```
skycoin-cli walletOutputs $WALLET1.wlt
```
- [Get device features](DOCUMENTATION.md#devGetFeatures) and check that:
  * `vendor` is set to `Skycoin Foundation`
  * `deviceId` is a string of 24 chars, which we'll refer to as `ID1`
  * write down the value of `bootloaderHash` i.e. `ID2`
  * `model` is set to `'1'`
  * `fwMajor` is set to expected firmware major version number
  * `fwMinor` is set to expected firmware minor version number
  * `fwPatch` is set to expected firmware patch version number
  * `firmwareFeatures` is set to `0`
- Ensure device is seedless by [wiping it](DOCUMENTATION.md#devWipeDevice). Check that you end up in home screen with `NEEDS SEED!` message at the top.
- [Recover seed](DOCUMENTATION.md#devRecoveryDevice) `SEED1` in Skywallet device (`dry-run=false`).
- [Get device features](DOCUMENTATION.md#devGetFeatures) and check that:
  * `vendor` is set to `Skycoin Foundation`
  * `deviceId` is set to `ID1`
  * `pinProtection` is seto to `false`
  * `passphraseProtection` is set to `false`
  * `label` is set to `ID1`
  * `initialized` is set to `true`
  * `bootloaderHash` is set to `ID2`
  * `passphraseCached` is set to `false`
  * `needsBackup` is set to `false`
  * `model` is set to `'1'`
  * `fwMajor` is set to expected firmware major version number
  * `fwMinor` is set to expected firmware minor version number
  * `fwPatch` is set to expected firmware patch version number
  * `firmwareFeatures` is set to `0`
- [Set device label](DOCUMENTATION.md#devApplySettings) to a new value , say `ID3`. Specify `usePassphrase=false`.
- [Get device features](DOCUMENTATION.md#devGetFeatures) and check that:
  * `label` is set to `ID3`
  * all other values did not change with respect to previous step, especially `deviceId`
  * as a result device label is displayed on top of Skycoin logo in device home screen
- Ensure you know at least two addresses for test wallet, if not, [generate some](DOCUMENTATION.md#devAddressGen). Choose one of them, hereinafter referred to as `ADDRESS2`
- Check that address sequence generated by SkyWallet matches the values generated by `skycoin-cli`
```sh
skycoin-cli walletAddAddresses -f $WALLET1.wlt -n 5
```
- Check once again with desktop wallet
- Create new transaction from `ADDRESS1` to `ADDRESS2` in test wallet (say `TXN_RAW1`) and display details
```sh
export TXN1_RAW="$(skycoin-cli createRawTransaction -a $ADDRESS1 -f $WALLET1.wlt $ADDRESS2 $AMOUNT)"
skycoin-cli decodeRawTransaction $TXN1_RAW
```
- [Sign transaction](DOCUMENTATION.md#devSkycoinTransactionSign) with Skywallet by putting together a message using values resulting from previous step as follows.
  * Set message `nbIn` to the length of transaction `inputs` array
  * Set message `nbOut` to the length of transaction `outputs` array
  * For each hash in transaction `inputs` array there should be an item in messsage `inputs` array with `hashIn` field set to the very same hash and and address index set to `0`.
  * For each source item in transaction `outputs` array there should be an item in messsage `outputs` array with fields set as follows:
    - `address` : source item's `dst`
    - `coin` : source item's `coins`
    - `hour` : source item's `hours`
    - `address_index` : set to `0` if source item `address` equals `ADDRESS1` or to `1` otherwise
- Check that `signatures` array returned by hardware wallet includes entries for each and every transaction input
- [Check signatures](DOCUMENTATION.md#devCheckMessageSignature) were signed by corresponding addresses
- Broadcast transaction. Refer to its id as `TXN1_ID`
```sh
skycoin-cli broadcastTransaction $TXN1_RAW
```
- After a few minutes check that balance changed.
```sh
skycoin-cli walletBalance $WALLET1
```
- Create a second wallet i.e. `WALLET2`
```sh
skycoin-cli walletCreate -f $WALLET2.wlt -l $WALLET2
```
- From command output take note of first wallet address `ADDRESS3`
- List `WALLET2` addresses and confirm that `ADDRESS3` is the only value in the list.
```sh
skycoin-cli lisAddresses $WALLET2.wlt
```
- Transfer funds to `WALLET2` (if not already done) and check balance
```sh
skycoin-cli addressBalance $ADDRESS3
```
- Create two transactions. The first one, (i.e. `TXN2`) grabbing funds from first address in `WALLET1` previously recovered in Skywallet device (i.e. `ADDRESS1`). The second one (i.e. `TXN3`) transferring funds from first address in `WALLET2` (i.e. `ADDRESS3`). Receiver in both cases should be second address of `WALLET1` (i.e. `ADDRESS2`) , and change should be sent back to `ADDRESS1`
```sh
export TXN2_RAW="$(skycoin-cli createRawTransaction -a $ADDRESS1 -f $WALLET1.wlt -c $ADDRESS1 $ADDRESS2 $AMOUNT)"
export TXN3_RAW="$(skycoin-cli createRawTransaction -a $ADDRESS3 -f $WALLET2.wlt -c $ADDRESS1 $ADDRESS2 $AMOUNT)"
skycoin-cli decodeRawTransaction $TXN2_RAW
skycoin-cli decodeRawTransaction $TXN3_RAW
```
- [Sign transaction](DOCUMENTATION.md#devSkycoinTransactionSign) with Skywallet
  * Set message `nbIn` to the length of transaction `inputs` array
  * Set message `nbOut` to the length of transaction `outputs` array
  * For each hash in transaction `inputs` array there should be an item in messsage `inputs` array with `hashIn` field set to the very same hash and and address index set to `0`.
  * For each source item in transaction `outputs` array there should be an item in messsage `outputs` array with fields set as follows:
    - `address` : source item's `dst`
    - `coin` : source item's `coins * 1000000`
    - `hour` : source item's `hours`
    - `address_index` : set to `0` if source item `address` equals `ADDRESS1` or to `1` otherwise
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
