import { IRulesConfig } from "lightning-flow-scanner-core/main/internals/internals.js";
import { writeFileSync } from "node:fs";

import { FindFlows } from "./FindFlows.js";

import pkg from "lightning-flow-scanner-core";
const { fix: fixFlows, parse: parseFlows, scan: scanFlows } = pkg;

import type { ScanResult as FlowScanResults } from "lightning-flow-scanner-core";

export default class CoreFixService {
  public constructor(
    private readonly dir,
    private readonly file,
    private readonly rules,
  ) {}

  public async fix(): Promise<string[]> {
    //find flow file(s)
    let flowFiles;
    if (this.dir) {
      flowFiles = this.findFlowsByDir(this.dir);
    } else {
      flowFiles = this.findFlowsByPath(this.file);
    }
    const parsedFlows = await parseFlows(flowFiles);

    // make on the fly rule
    const flatRules = this.rules
      .map((content) => {
        return { rules: { [content]: { severity: "error" } } };
      })
      .reduce(
        (prev, current) => {
          prev.rules = { ...prev.rules, ...current.rules };
          return prev;
        },
        { rules: {} },
      ) as IRulesConfig;

    // scan
    const scanResults: FlowScanResults[] = scanFlows(parsedFlows, flatRules);

    // fix
    const fixFlow: FlowScanResults[] = fixFlows(scanResults);
    fixFlow.forEach((fixedObject) => {
      writeFileSync(fixedObject.flow.fsPath, fixedObject.flow.toXMLString());
    });

    return fixFlow.map((fixedOut) => fixedOut.flow.fsPath);
  }

  private findFlowsByDir(dir: string[]): string[] {
    return dir
      .map((dirName) => {
        return FindFlows(dirName);
      })
      .flat(1);
  }

  private findFlowsByPath(path: string[]): string[] {
    return [...path];
  }
}
