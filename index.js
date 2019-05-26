/**
 * inspired by https://www.youtube.com/watch?v=Gc9-7PBqOC8&list=LLHK1mTHpwrUeYgF5gu-Kd4g
 */

const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const babelParser = require('@babel/parser')
const babelTraverse = require('@babel/traverse').default

let id = 0

const createModules = entry => {
  id += 1
  const entryContent = fs.readFileSync(entry, 'utf-8')
  const ast = babelParser.parse(entryContent, {
    sourceType: 'module',
  })
  let dependencies = []
  babelTraverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value)
    }
  })
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env']
  })
  return { id, entry, dependencies, code }
}

const createDependenciesGraph = module => {
  const modules = [module]
  for (const module of modules) {
    module.mapping = {}
    const dir = path.dirname(module.entry)
    module.dependencies.forEach(relativepath => {
      const absolutePath = path.join(dir, relativepath)
      const child = createModules(absolutePath)
      module.mapping[relativepath] = child.id
      modules.push(child)
    })
  }
  return modules
}

const bundle = graph => {
  let modules = ''
  graph.forEach(module => {
    modules += `${module.id}: [
      function(require, module, exports) {
        ${module.code}
      },
      ${JSON.stringify(module.mapping)}
    ],`
  })
  const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];
        function localRequire(relativePath) {
          return require(mapping[relativePath]);
        }
        const module = { exports: {} };
        fn(localRequire, module, module.exports);
        return module.exports;
      }
      require(1);
    })({${modules}});
  `
  return result
}

const main = options => {
  const { entry, output } = options
  const module = createModules(entry)
  const modules = createDependenciesGraph(module)
  const result = bundle(modules)
  fs.writeFileSync(output, result)
}

main({
  entry: './example/index.js',
  output: './example/bundle.js'
})
