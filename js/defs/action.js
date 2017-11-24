/*
[
    'start', 'end', 'kill', 'decision', 'fork', 'join',                 // control
    'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
    'shell', 'hive', 'sqoop',                                           // 3.2.0
    'distcp', 'spark',                                                  // 4.0.0
    'hive2'                                                             // 4.2.0
],
*/
export default {
    ghost: {
        markup: '<rect width="64" height="64" rx="12" ry="12"/>',
        props: {},
        rules: {}
    },

    start: {
        markup: '<image xlink:href="images/wd-start.svg" width="64" height="64"/>',
        props: {},
        rules: {
            min: 1,
            max: 1,
            maxFrom: 0,
            maxNext: 1,
            before: [],
            after: [
                'decision', 'fork',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    end: {
        markup: '<image xlink:href="images/wd-end.svg" width="64" height="64"/>',
        props: {},
        rules: {
            min: 1,
            max: 1,
            maxFrom: 1, // ?
            maxNext: 0,
            before: [
                'decision', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: []
        }
    },
    kill: {
        markup: '<image xlink:href="images/wd-kill.svg" width="64" height="64"/>',
        props: { 'message': 'default error' },
        rules: {
            min: 0,
            max: -1,
            maxFrom: -1,
            maxNext: 0,
            before: [
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: []
        }
    },
    decision: {
        markup: '<image xlink:href="images/wd-decision.svg" width="64" height="64"/>',
        props: {},
        rules: {
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    fork: {
        markup: '<image xlink:href="images/wd-fork.svg" width="64" height="64"/>',
        props: {},
        rules: {
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'decision', 'fork',                  // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    join: {
        markup: '<image xlink:href="images/wd-join.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: -1,
            maxNext: 1,
            before: [
                'decision', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },

    'map-reduce': {
        markup: '<image xlink:href="images/wd-mapreduce.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    pig: {
        markup: '<image xlink:href="images/wd-pig.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    fs: {
        markup: '<image xlink:href="images/wd-fs.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    ssh: {
        markup: '<image xlink:href="images/wd-ssh.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    'sub-workflow': {
        markup: '<image xlink:href="images/wd-sub-workflow.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    java: {
        markup: '<image xlink:href="images/wd-java.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    email: {
        markup: '<image xlink:href="images/wd-email.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    shell: {
        markup: '<image xlink:href="images/wd-shell.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    hive: {
        markup: '<image xlink:href="images/wd-hive.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    hive2: {
        markup: '<image xlink:href="images/wd-hive.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    sqoop: {
        markup: '<image xlink:href="images/wd-sqoop.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    distcp: {
        markup: '<image xlink:href="images/wd-dist-cp.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    },
    spark: {
        markup: '<image xlink:href="images/wd-spark.svg" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: [
                'start', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ],
            after: [
                'end', 'kill', 'decision', 'fork', 'join',                 // control
                'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
                'shell', 'hive', 'sqoop',                                           // 3.2.0
                'distcp', 'spark',                                                  // 4.0.0
                'hive2'                                                             // 4.2.0
            ]
        }
    }
    
    
};