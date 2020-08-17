import {KeywordDefinition, KeywordErrorDefinition} from "../../types"
import {nonEmptySchema} from "../util"
import {applyKeywordSubschema} from "../../compile/subschema"
import {reportExtraError, resetErrorsCount} from "../../compile/errors"
import {failKeyword} from "../../keyword"

const additionalError: KeywordErrorDefinition = {
  message: () => '""',
  params: () => "{}",
}

const def: KeywordDefinition = {
  keyword: "items",
  schemaType: "object",
  code(cxt) {
    const {gen, ok, schema, parentSchema, data, it} = cxt
    let closeBlocks = ""
    if (Array.isArray(schema)) {
      const additional = parentSchema.additionalItems
      if (additional === false) {
        failKeyword(`${data}.length > ${schema.length}`, it, "additionalItems", additionalError)
        closeBlocks += "}"
      }

      validateSpecifiedItems(cxt)
      if (additional) validateItems(it, schema.length, additional)
    } else {
      validateItems(it, 0, schema, cxt)
    }

    // let hasEmptySchema = !schema.every((sch: object | boolean) => nonEmptySchema(it, sch))
    // if (hasEmptySchema) {
    //   ok()
    //   return
    // }
    // const valid = gen.name("valid")
    // const errsCount = gen.name("_errs")
    // gen.code(
    //   `let ${valid} = false;
    //   const ${errsCount} = errors;`
    // )

    // schema.forEach((_, i: number) => {
    //   const schValid = applyKeywordSubschema(it, "anyOf", i, true)
    //   gen.code(
    //     `${valid} = ${valid} || ${schValid};
    //     if (!${valid}) {`
    //   )
    //   closeBlocks += "}"
    // })

    // gen.code(closeBlocks)

    // // TODO refactor failCompoundOrReset?
    // gen.code(`if (!${valid}) {`)
    // reportExtraError(cxt, def.error as KeywordErrorDefinition)
    // gen.code(`} else {`)
    // resetErrorsCount(gen, errsCount)
    // if (it.opts.allErrors) gen.code(`}`)
  },
  error: {
    // TODO allow message to be just a string if it is constant?
    message: () => '"should match some schema in anyOf"',
    // TODO make params optional if there are no params?
    params: () => "{}",
  },
}

module.exports = def
