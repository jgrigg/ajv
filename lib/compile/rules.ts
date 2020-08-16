import {toHash} from "./util"
import {CompilationContext, KeywordDefinition} from "../types"

const ruleModules = require("../dotjs")

export interface ValidationRules {
  rules: GroupOfRules[]
  all: {[key: string]: boolean | Rule}
  keywords: {[key: string]: boolean}
  types: {[key: string]: boolean | GroupOfRules}
  custom: {[key: string]: Rule}
}

interface GroupOfRules {
  type?: string
  rules: RuleDef[]
}

type RuleDef = string | {[key: string]: string[]} | Rule

export interface Rule {
  keyword: string
  code: (it: CompilationContext, keyword?: string, ruleType?: string) => void
  implements?: string[]
  definition?: KeywordDefinition
  custom?: true
}

export default function rules() {
  const ALL = ["type", "$comment"]
  const KEYWORDS = [
    "$schema",
    "$id",
    "id",
    "$data",
    "$async",
    "title",
    "description",
    "default",
    "definitions",
    "examples",
    "readOnly",
    "writeOnly",
    "contentMediaType",
    "contentEncoding",
    "additionalItems",
    "then",
    "else",
  ]
  const TYPES = ["number", "integer", "string", "array", "object", "boolean", "null"]

  const RULES: ValidationRules = {
    rules: [
      {type: "number", rules: ["format"]},
      {type: "string", rules: ["format"]},
      {
        type: "array",
        rules: ["items", "contains"],
      },
      {
        type: "object",
        rules: [
          "required",
          "dependencies",
          "propertyNames",
          {properties: ["additionalProperties", "patternProperties"]},
        ],
      },
      {rules: ["$ref", "not", "anyOf", "oneOf", "allOf", "if"]},
    ],
    all: toHash(ALL),
    keywords: {},
    types: toHash(TYPES),
    custom: {},
  }

  RULES.rules.forEach((group) => {
    group.rules = group.rules.map((keyword: string | object) => {
      let implKeywords: string[] | undefined
      if (typeof keyword == "object") {
        const key: string = Object.keys(keyword)[0]
        implKeywords = keyword[key]
        keyword = key
        ;(<string[]>implKeywords).forEach((k) => {
          ALL.push(k)
          RULES.all[k] = true
        })
      }
      ALL.push(keyword)
      const rule: Rule = (RULES.all[keyword] = {
        keyword: keyword,
        code: ruleModules[keyword],
        implements: implKeywords,
      })
      return rule
    })

    if (group.type) RULES.types[group.type] = group
  })

  RULES.keywords = toHash(ALL.concat(KEYWORDS))
  RULES.custom = {}

  return RULES
}