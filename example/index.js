import requiredModule from './required.js'

let result = 42
if (requiredModule.required) {
  result += 10
}

export default result
