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
            4,
            { "SwitchCase": 1 }//,
            //{ "VariableDeclarator" : {
            //    "var": 2, "let": 2, "const": 3
            //}}
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
        ]
    },
    "globals": {
        "define": true,
        "require": true
    }
};