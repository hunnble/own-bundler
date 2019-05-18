interface Options {
  entry: string
  output: string
  env?: string
}

const defaultOptions: Options = {
  entry: 'index.html',
  output: 'dist'
}

async function main() {
  // TODO: import assets
  // TODO: dependency graph
}

main();
