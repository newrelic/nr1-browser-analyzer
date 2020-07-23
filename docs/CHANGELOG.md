## [1.3.1](https://github.com/newrelic/nr1-browser-analyzer/compare/v1.3.0...v1.3.1) (2020-07-23)


### Bug Fixes

* **nrqlfactory:** untouched error handling catch ([0c6ed27](https://github.com/newrelic/nr1-browser-analyzer/commit/0c6ed273124f87c20b93c9301dd514fa2da709f7))
* package.json & package-lock.json to reduce vulnerabilities ([7d1f2a0](https://github.com/newrelic/nr1-browser-analyzer/commit/7d1f2a0f03dcdd4c0fa241ad5e9e538c2d12557a))
* upgrade @newrelic/nr1-community from 1.1.1 to 1.2.0 ([2a742c2](https://github.com/newrelic/nr1-browser-analyzer/commit/2a742c23b82811f64492d3d5d15ce3128afa5e5a))

# [1.3.0](https://github.com/newrelic/nr1-browser-analyzer/compare/v1.2.0...v1.3.0) (2020-05-29)


### Bug Fixes

* addressing security issue in dependency ([f6b7758](https://github.com/newrelic/nr1-browser-analyzer/commit/f6b7758815e165da1c24417480f78bc4c297f00d))
* **README:** aligned title with nerdpack README convention. ([961b800](https://github.com/newrelic/nr1-browser-analyzer/commit/961b800f4b80646842c14112f057f82fd52a6a0b))
* continue when Eslint Annotation fails and add check for output of eslint-check step ([5cb1958](https://github.com/newrelic/nr1-browser-analyzer/commit/5cb1958d70cfdcd844fabc1d55e5e7d5cce63ab4))
* use a repo admin email/name ([adab177](https://github.com/newrelic/nr1-browser-analyzer/commit/adab1771af1b1bde44341025c4a006bd5df42a02))
* use a repo admin email/name for third_party_notices commit ([96eea04](https://github.com/newrelic/nr1-browser-analyzer/commit/96eea04c7483a33e706bd870f5996d298492b41f))
* use newrelicbot to commit ([#42](https://github.com/newrelic/nr1-browser-analyzer/issues/42)) ([9ff7b11](https://github.com/newrelic/nr1-browser-analyzer/commit/9ff7b11a580aedf1150dbee811d59d3272a990fe))
* uses GH API to disable/enable branch protection so committing works ([#43](https://github.com/newrelic/nr1-browser-analyzer/issues/43)) ([e1ca6c4](https://github.com/newrelic/nr1-browser-analyzer/commit/e1ca6c40d271b137098ec9334202e2564e40cf66))


### Features

* **ci:** removing circleci and replacing with GH Actions ([1fa929f](https://github.com/newrelic/nr1-browser-analyzer/commit/1fa929ffb3e60c528f36fc8ad562a04075a60df5))
* Switch CI to GitHub Actions ([1f520f6](https://github.com/newrelic/nr1-browser-analyzer/commit/1f520f6c5f5c6cae1b433c39f893d64cb1d9671c)), closes [#41](https://github.com/newrelic/nr1-browser-analyzer/issues/41)


### Reverts

* Revert "chore: semantic-release updates package-lock when version increments" ([440a4f6](https://github.com/newrelic/nr1-browser-analyzer/commit/440a4f6967115d967490a8b4bdd48df51d53c08c))
* Revert "feat(ci): removing circleci and replacing with GH Actions" ([4222317](https://github.com/newrelic/nr1-browser-analyzer/commit/42223172b5ade5f1c03c1aef9c1616ed267f3401))

# [1.2.0](https://github.com/newrelic/nr1-browser-analyzer/compare/v1.1.2...v1.2.0) (2020-04-10)


### Bug Fixes

* graphql query optimization. whatsNew update. ([c269f60](https://github.com/newrelic/nr1-browser-analyzer/commit/c269f6000db4d70eaacc05facb657ef67b5caf08))
* use entityGuid in queries. ([d1192b4](https://github.com/newrelic/nr1-browser-analyzer/commit/d1192b40d84dc4d4cfa75d035a7eb490ee3c38bf))


### Features

* remove toggle. Use entity-scoped query to support SPA choice. ([4649de1](https://github.com/newrelic/nr1-browser-analyzer/commit/4649de1dba5353e277759c2b80b67a5eb9725877))
* WIP ammending @ShuJackson work to support SPA's. Added factory class for encapsulating the NRQL changes. ([fc0c7a3](https://github.com/newrelic/nr1-browser-analyzer/commit/fc0c7a37c7e18fb9f85a0e8934c37754add93b59))

## [1.1.2](https://github.com/newrelic/nr1-browser-analyzer/compare/v1.1.1...v1.1.2) (2020-03-30)


### Bug Fixes

* Component to PureComponent and nr1-community implementation. ([9551463](https://github.com/newrelic/nr1-browser-analyzer/commit/95514638b07ea96e8b7765b29027d7a3ecf6b1a0))
* merge conflicts with newrelic master updates. ([87d1859](https://github.com/newrelic/nr1-browser-analyzer/commit/87d1859f9172e82fdf52efac97d75ad44a53bc39))
* remove component directory (unused). ([eb33061](https://github.com/newrelic/nr1-browser-analyzer/commit/eb330619e121f999ed62305dce0222be12d3712e))

## [1.1.1](https://github.com/newrelic/nr1-browser-analyzer/compare/v1.1.0...v1.1.1) (2020-03-25)


### Bug Fixes

* **deps:** update eslint dependencies resolves Issue [#30](https://github.com/newrelic/nr1-browser-analyzer/issues/30) ([#32](https://github.com/newrelic/nr1-browser-analyzer/issues/32)) ([9ccfea7](https://github.com/newrelic/nr1-browser-analyzer/commit/9ccfea7a2b01afd974ce5e8ccdc0f2368dba62c4))
* **perf:** replace momentjs with pretty-ms resolves Issue [#26](https://github.com/newrelic/nr1-browser-analyzer/issues/26) ([#33](https://github.com/newrelic/nr1-browser-analyzer/issues/33)) ([f4ef6c7](https://github.com/newrelic/nr1-browser-analyzer/commit/f4ef6c7540fe007c9213283716a63b7e38086f25))
* attempt to fix a bad merge ([e10027b](https://github.com/newrelic/nr1-browser-analyzer/commit/e10027ba40b93d9fb28fc3e3853b4fa1373090a0))
* prevent new tab opening on table row click ([9c2bd5d](https://github.com/newrelic/nr1-browser-analyzer/commit/9c2bd5dea51ee4f654df75ce9627c36fada1fc04)), closes [newrelic#27](https://github.com/newrelic/issues/27)
* use nr1-community empty state component ([8a0b51b](https://github.com/newrelic/nr1-browser-analyzer/commit/8a0b51b77024237b487b37268134b2cd050e76a0)), closes [newrelic#28](https://github.com/newrelic/issues/28)

# [1.1.0](https://github.com/newrelic/nr1-browser-analyzer/compare/v1.0.0...v1.1.0) (2020-03-06)


### Features

* add catalog icon ([743b2ef](https://github.com/newrelic/nr1-browser-analyzer/commit/743b2ef36fa17f99f9f1e3a11cf36fb6eee9d479))

# 1.0.0 (2020-01-31)


### Bug Fixes

* **Replaced nr.apdexPerfZone:** Replace nr.apdexPerfZone with duration ([68fec30](https://github.com/newrelic/nr1-browser-analyzer/commit/68fec30362172adc4c48a955ba9ad39b2f3c1f20))
* custom dates Issue [#16](https://github.com/newrelic/nr1-browser-analyzer/issues/16) - add timepicker to nrql utility  ([#17](https://github.com/newrelic/nr1-browser-analyzer/issues/17)) ([6e19cba](https://github.com/newrelic/nr1-browser-analyzer/commit/6e19cba00d78a05ec17b16df12150a1a352e0393))
* Fix for the issues with infinite issues + consolidation of the interface around a better solution for loading context. ([a4db7cf](https://github.com/newrelic/nr1-browser-analyzer/commit/a4db7cfe1097cbd3b560e8e158017a019c108fa5))


### Features

* circleci and semantic-release ([#18](https://github.com/newrelic/nr1-browser-analyzer/issues/18)) ([bb3c023](https://github.com/newrelic/nr1-browser-analyzer/commit/bb3c0237d41d75e7bc27b8ca845be466d58edeaa))
