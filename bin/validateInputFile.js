import exampleFile from '../v2/store/exampleFile'
import { schema } from '../v2/store/fileSchema'

debugger

function main() {
  const errors = schema(exampleFile)
  errors.forEach((error) => {
    console.error(
      `${error.path.join('/')}: expected: ${error.expected}, received value: ${error.value}`
    )
  })
}

main()
