import {SfdxCommand} from '@salesforce/command';
import {fs, Messages, SfdxError, SfdxProject} from '@salesforce/core';
import {AnyJson} from '@salesforce/ts-types';
import * as core from 'lightningflowscan-core/out';
import {Flow} from 'lightningflowscan-core/out/main/models/Flow';
import {ScanResult} from 'lightningflowscan-core/out/main/models/ScanResult';
import {Violation} from '../../models/Violation';
import {FindFlows} from "../../libs/FindFlows";
import {ParseFlows} from "../../libs/ParseFlows";
import * as path from 'path';
import {IgnoredFlowViolations} from "../../models/IgnoredFlowViolations";
import {IgnoredRuleViolationsInFlows} from "../../models/IgnoredRuleViolationsInFlows";

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('lightningflowscan-cli', 'command');

export default class flows extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {

    const aPath = await SfdxProject.resolveProjectPath();
    const flowFiles = FindFlows(aPath);

    const pathToIgnoreFile = path.join(aPath, 'flows.scanignore.json');
    let foundPath;
    if (fs.existsSync(pathToIgnoreFile)) {
      foundPath = fs.readJsonSync(pathToIgnoreFile);
    }
    let ignoredFlowViolations;
    let ignoredRuleViolationsInFlows;
    if (foundPath) {
      let ignoredFlows = foundPath['flowsToBeIgnored'];
      ignoredFlowViolations = new IgnoredFlowViolations(ignoredFlows);
      let ignoredRulesInFlows = foundPath['rulesToBeIgnoredInFlows'];
      ignoredRuleViolationsInFlows = new IgnoredRuleViolationsInFlows(ignoredRulesInFlows);
    }
    const parsedFlows: Flow[] = await ParseFlows(flowFiles);
    const scanResults: ScanResult[] = core.scan(parsedFlows);
    const lintResults: Violation[] = [];
    for (const scanResult of scanResults) {
      for (const ruleResult of scanResult.ruleResults) {
        if (ruleResult.results.length > 0) {
          if (ignoredFlowViolations && ignoredFlowViolations.flowlabels.length > 0 && ignoredFlowViolations.flowlabels.find(violation => {
            return (violation == scanResult.flow.label);
          })) {
            continue;
          }
          else if (ignoredRuleViolationsInFlows && ignoredRuleViolationsInFlows.ignoredRuleViolationsInFlows.length > 0 && ignoredRuleViolationsInFlows.ignoredRuleViolationsInFlows.find(violation => {
            return (violation.flowname == scanResult.flow.label && violation.rulename == ruleResult.ruleLabel);
          })) {
            continue;
          }
          else {
            lintResults.push(
              new Violation(
                scanResult.flow.label,
                ruleResult.ruleLabel,
                ruleResult.ruleDescription,
                ruleResult.results.length
              )
            );
          }
        }
      }
    }
    if (lintResults.length > 0) {
      const warnings: string[] = [];
      for (const lintResult of lintResults) {
        warnings.push('in Flow \'' + lintResult.flowlabel + '\', Rule:\'' + lintResult.ruleLabel + '\' is violated ' + lintResult.numberOfViolations + ' times');
      }
      throw new SfdxError(messages.getMessage('commandDescription'), 'results', warnings, 1);
    }
    // If there are no lintresults
    return 0;
  }
}
