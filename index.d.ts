declare function setupImportMapsPlugin(bundler: any): void;

export = setupImportMapsPlugin;

declare module "importmap" {
  export function ready(id?: string | Array<string>): Promise<void>;
}
