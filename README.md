# Lightning Flow Scanner SFDX Plugin
#### Identify potential issues and improvements in Salesforce Flows.

[![Version](https://img.shields.io/npm/v/lightning-flow-scanner.svg)](https://npmjs.org/package/lightning-flow-scanner)
[![Downloads/week](https://img.shields.io/npm/dw/lightning-flow-scanner.svg)](https://npmjs.org/package/lightning-flow-scanner)
[![Downloads/total](https://img.shields.io/npm/dt/lightning-flow-scanner.svg)](https://npmjs.org/package/lightning-flow-scanner)
[![GitHub stars](https://img.shields.io/github/stars/Force-Config-Control/lightning-flow-scanner-sfdx)](https://GitHub.com/Force-Config-Control/lightning-flow-scanner-sfdx/stargazers/)
[![GitHub contributors](https://img.shields.io/github/contributors/Force-Config-Control/lightning-flow-scanner-sfdx.svg)](https://gitHub.com/Force-Config-Control/lightning-flow-scanner-sfdx/graphs/contributors/)
[![License](https://img.shields.io/npm/l/lightning-flow-scanner.svg)](https://github.com/Force-Config-Control/lightning-flow-scanner-sfdx/blob/main/package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Options](#options)
- [Rules](#rules)
  - [DML statements in a loop](#dml-statements-in-a-loop)
  - [Duplicate DML operations](#duplicate-dml-operations)
  - [Hardcoded Ids](#hardcoded-ids)
  - [Missing flow description](#missing-flow-description)
  - [Missing error handlers](#missing-error-handlers)
  - [Missing null handlers](#missing-null-handlers)
  - [Unconnected elements](#unconnected-elements)
  - [Unused variables](#unused-variables)
- [Configuration](#configuration)
  - [Override Rule Severity](#override-rule-severity)
  - [Rule exceptions](#rule-exceptions)

## Installation

As SFDX Plugin:
```sh-session
$ sfdx plugins:install lightning-flow-scanner
```

As NPM Package:
```sh-session
$ npm install -g lightning-flow-scanner
```

## Usage

```
  $ sfdx flow:scan [options]
```

### Options

```
  -c, --config <path>                                               provide a path to the configuration file.

  -f, --failon                                                      Thresold failure level (error, warning, note, or never) defining when the command return code will be 1

  -p, --sourcepath <C:\..\flow1.flow, C:\..\flow2.flow>             provide a comma-separated list of flow paths to scan.

  -u, --targetusername <username>                                   retrieve the latest metadata from the target before the scan.

  -d, --directory <C:\..\force-app\main\default\flows>              provide a directory to scan.

  --json                                                            set output format as json.

  --loglevel=(trace|debug|info|warn|error|fatal)                    [default: warn] logging level.

```

### Examples

`sfdx flow:scan`

`sfdx flow:scan --json`

`sfdx flow:scan --config path/to/.flow-scanner.json`

## Rules

___

### DML statements in a loop

To avoid hitting Apex governor limits, we recommend grouping all of your database changes together at the end of the flow, whether those changes create, update, or delete records.

Configuration ID: `DMLStatementInLoop` _([View source code](https://github.com/Force-Config-Control/lightning-flow-scanner-core/tree/master/src/main/rules/DMLStatementInLoop.ts))_

___

### Duplicate DML operations

If the flow commits changes to the database or performs actions between two screens, don't let users navigate back between screen. Otherwise, the flow may perform duplicate database operations.

Configuration ID: `DuplicateDMLOperationsByNavigation` _([View source code](https://github.com/Force-Config-Control/lightning-flow-scanner-core/tree/master/src/main/rules/DuplicateDMLOperationsByNavigation.ts))_

___

### Hardcoded Ids

IDs are org-specific, so don’t hard-code IDs. Instead, pass them into variables when the flow starts. You can do so, for example, by using merge fields in URL parameters or by using a Get Records element.

Configuration ID: `HardcodedIds` _([View source code](https://github.com/Force-Config-Control/lightning-flow-scanner-core/tree/master/src/main/rules/HardcodedIds.ts))_

___

### Missing flow description

Descriptions are useful for documentation purposes. It is recommended to provide information about where it is used and what it will do.

Configuration ID: `MissingFlowDescription` _([View source code](https://github.com/Force-Config-Control/lightning-flow-scanner-core/tree/master/src/main/rules/MissingFlowDescription.ts))_

___

### Missing error handlers

Sometimes a flow doesn’t perform an operation that you configured it to do. By default, the flow shows an error message to the user and emails the admin who created the flow. However, you can control that behavior.

Configuration ID: `MissingFaultPath` _([View source code](https://github.com/Force-Config-Control/lightning-flow-scanner-core/tree/master/src/main/rules/MissingFaultPath.ts))_

___

### Missing null handlers

If a Get Records operation does not find any data it will return null. Use a decision element on the operation result variable to validate that the result is not null.

Configuration ID: `MissingNullHandler` _([View source code](https://github.com/Force-Config-Control/lightning-flow-scanner-core/tree/master/src/main/rules/MissingNullHandler.ts))_

___

### Unconnected elements

Unconnected elements which are not being used by the Flow should be avoided to keep Flows efficient and maintainable. 

Configuration ID: `UnconnectedElements` _([View source code](https://github.com/Force-Config-Control/lightning-flow-scanner-core/tree/master/src/main/rules/UnconnectedElements.ts))_

___

### Unused variables

Unconnected variables which are not being used by the Flow should be avoided to keep Flow more efficient and maintainable.

Configuration ID: `UnusedVariables` _([View source code](https://github.com/Force-Config-Control/lightning-flow-scanner-core/tree/master/src/main/rules/UnusedVariables.ts))_

## Configuration

Flow Scanner contains opiniotated configuration by default.

You can define your own configuration using `.flow-scanner.json` file, that will allow to:

 - Override default rules severity
 - Declare rule exceptions in selected flows

_Note: if you prefer YAML format, you can create a `.flow-scanner.yml` file using the same format._

Here is an example of advanced configuration file:

```json
{
    "rules": [
        {
            "HardcodedIds": {
                "severity": "info"
            }
        }
    ],
    "exceptions": [
        {
            "GetAccounts": [
                {
                    "UnusedVariables": [
                        "somecount"
                    ]
                }
            ]
        }
    ]
}
```

### Override Rule Severity

Define the severity per rule as shown in the following example. If not provided the severity is 'error' by default.

Available values for severity are:

- `error`
- `warning`
- `note`

_Example_

```json
{
    "rules": [
        {
            "MissingFlowDescription": {
                "severity": "warning"
            }
        }
    ]
}
```

### Rule exceptions

Specify exceptions by flow, rule and result(s), as shown in the following example.

_Example_

```json
{
    "exceptions": [
        {
            "GetAccounts": [
                {
                    "UnusedVariables": [
                        "somecount"
                    ]
                }
            ]
        }
    ]
}
```
