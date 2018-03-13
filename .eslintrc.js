module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "error",
        2,
        { "SwitchCase": 1,
          "VariableDeclarator" : {
            "var": 2, "let": 2, "const": 3
          }
        }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-fallthrough": [
      "off"
    ],
    "no-case-declarations": [
      "off"
    ],
    "keyword-spacing": [
      "error",
      {
        "before": true,
        "after": false,
        "overrides": {
          "case": { "after": true },
          "const": { "after": true },
          "do": { "after": true },
          "else": { "after": true },
          "from": { "after": true },
          "import": { "after": true },
          "let": { "after": true },
          "return": { "after": true },
          "throw": { "after": true },
          "try": { "after": true }
        }
      },
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "array-bracket-spacing": [
      "error",
      "always"
    ],
    "comma-spacing": [
      "error",
      {
        "before": false,
        "after": true
      }
    ],
    "key-spacing": [
      "error"
    ],
    "no-extra-semi": [
      "error"
    ],
    "semi-spacing": [
      "error",
      {
        "before": false,
        "after": true
      }
    ]
  },
  "globals": {
    "define": true,
    "require": true
  }
};