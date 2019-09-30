# nr1-browser-analyzer

![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/newrelic/nr1-browser-analyzer?include_prereleases&sort=semver) ![AppVeyor](https://img.shields.io/appveyor/ci/newrelic/nr1-browser-analyzer) [![Snyk](https://snyk.io/test/github/newrelic/nr1-browser-analyzer/badge.svg)](https://snyk.io/test/github/newrelic/nr1-browser-analyzer)

## Usage

The nr1-browser-analyzer uses the `PageView` events in New Relic to categorize the performance of a web site. You can explore the performance of individual pages, and forecast how improving performance impacts KPIs like bounce rate and traffic. This analysis is based on moving individual browsing sessions from `Tolerated` and `Frustrated` into `Satisfied` (as defined by the [`apdex` score](https://docs.newrelic.com/docs/apm/new-relic-apm/apdex/apdex-measure-user-satisfaction) for a given New Relic Browser application).

![Screenshot #1](screenshots/screenshot_01.png)
![Screenshot #2](screenshots/screenshot_02.png)

## Open Source License

This project is distributed under the [Apache 2 license](LICENSE).

## What do you need to make this work?

1. [New Relic Browser agent(s) installed](https://newrelic.com/products/browser-monitoring) and the related access to [New Relic One](https://newrelic.com/platform).
2. See step 1. :grin:

## Getting started

Clone this repository and run the following scripts:

```bash
nr1 nerdpack:clone -r https://github.com/newrelic/nr1-browser-analyzer.git
cd nr1-browser-analyzer
nr1 nerdpack:uuid -gf
npm install
npm start
```

Visit https://one.newrelic.com/?nerdpacks=local, navigate to the Nerdpack, and :sparkles:

## Deploying this Nerdpack

Open a command prompt in the nerdpack's directory and run the following commands.

```bash
# this is to create a new uuid for the nerdpack so that you can deploy it to your account
nr1 nerdpack:uuid -g [--profile=your_profile_name]
# to see a list of APIkeys / profiles available in your development environment, run nr1 credentials:list
nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:

# Support

New Relic has open-sourced this project. This project is provided AS-IS WITHOUT WARRANTY OR SUPPORT, although you can report issues and contribute to the project here on GitHub.

_Please do not report issues with this software to New Relic Global Technical Support._

## Community

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

https://discuss.newrelic.com/t/browser-analyzer-nerdpack/82723
*(Note: URL subject to change before GA)*

## Issues / Enhancement Requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](../../issues). Please search for and review the existing open issues before submitting a new issue.

# Contributing

Contributions are welcome (and if you submit a Enhancement Request, expect to be invited to contribute it yourself :grin:). Please review our [Contributors Guide](CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.
