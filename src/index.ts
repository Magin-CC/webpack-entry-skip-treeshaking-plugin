import webpack from "webpack";
// @ts-ignore
import ConcatenatedModule from "webpack/lib/optimize/ConcatenatedModule";
// @ts-ignore
import { getEntryRuntime } from "webpack/lib/util/runtime";

const PluginName = "WebpackEntrySkipTreeshakingPlugin";

const markAsUsed = (
  module: webpack.Module,
  moduleGraph: webpack.ModuleGraph,
  runtime: any
) => {
  const exportsInfo = moduleGraph.getExportsInfo(module);
  exportsInfo.setUsedInUnknownWay(runtime);
  if (module.factoryMeta === undefined) {
    module.factoryMeta = {};
  }
  (module.factoryMeta as Record<any, any>).sideEffectFree = false;
};

class WebpackEntrySkipTreeshakingPlugin {
  entries: string[] = [];
  constructor(options: { entries: string[] }) {
    this.entries = options.entries;
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(PluginName, (compilation) => {
      const { moduleGraph } = compilation;
      compilation.hooks.optimizeDependencies.tap(
        {
          name: PluginName,
          stage: -10,
        },
        () => {
          for (const [
            entryName,
            { dependencies: deps, options },
          ] of compilation.entries) {
            if (this.entries.includes(entryName)) {
              const runtime = getEntryRuntime(compilation, entryName, options);
              for (const dep of deps) {
                const module = moduleGraph.getModule(dep);
                if (module?.type?.startsWith?.("javascript/")) {
                  markAsUsed(module, moduleGraph, runtime);

                  if (module instanceof ConcatenatedModule) {
                    markAsUsed(
                      (module as any).rootModule,
                      moduleGraph,
                      runtime
                    );
                  }
                  module.dependencies.forEach((d) => {
                    markAsUsed(moduleGraph.getModule(d), moduleGraph, runtime);
                  });
                }
              }
            }
          }
        }
      );
    });
  }
}

module.exports = WebpackEntrySkipTreeshakingPlugin;
