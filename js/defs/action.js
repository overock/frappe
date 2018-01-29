/*
[
    'start', 'end', 'kill', 'decision', 'fork', 'join',                 // control
    'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email',  // 3.1.3
    'shell', 'hive', 'sqoop',                                           // 3.2.0
    'distcp', 'spark',                                                  // 4.0.0
    'hive2'                                                             // 4.2.0
],
*/

const MSG = {
  oneStart: 'A workflow definition must have one start node!',
  oneEnd: 'A workflow definition must have one end node!',
  noNext: m => `${m.name} node must have next action/control node!`,
  noPrev: m => `There's no way that reaches ${m.name} node!`,
  multiPrev: m => `${m.name} node must follow two or more action/controls!`,
  multiNext: m => `${m.name} node must have two or more next action/control node!`,
  noCond: m => `There's one or more missing condition(s) in decision node ${m.name}!`,
  directJoin: (f, j) => `Cannot connect ${f.name} and ${j.name} directly!`,
  missFork: m => `${m.name} must follow one and only one fork node!`,
  missJoin: m => `${m.name} must reach one and only one join node!`,
  noParam: (m, k) => `${m.name} must contain value for key ${k}!`
};

const ACTION_RULES = {
  maxFrom: 1,
  maxTo: 2,
  before: [
    'start', 'decision', 'fork', 'join', // control
    'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
    'shell', 'hive', 'sqoop', // 3.2.0
    'distcp', 'spark', // 4.0.0
    'hive2' // 4.2.0
  ],
  after: [
    'end', 'kill', 'decision', 'fork', 'join', // control
    'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
    'shell', 'hive', 'sqoop', // 3.2.0
    'distcp', 'spark', // 4.0.0
    'hive2' // 4.2.0
  ],
  onAdd: () => false,
  onEdit: () => false,
  onSave: m => {
    const ret = [];
    !m.prevActions.length && ret.push(MSG.noPrev(m));
    !m.nextActions.filter(v => v && v.type!='kill' && v.type!='ghost').length && ret.push(MSG.noNext(m));
    return ret.join('\n');
  },
  onExecute: m => {
    const ret = [ m.rules.onSave(m) ];
    // mandatory field
    return ret.join('\n');
  }
};

export default {
  ghost: {
    markup: '<rect width="64" height="64" rx="12" ry="12"/>',
    props: {},
    rules: {
      onAdd: () => null,
      onEdit: () => null,
      onSave: () => null,
      onExecute: () => null
    }
  },

  start: {
    markup: '<image xlink:href="images/wd-start.svg" width="64" height="64"/>',
    props: {},
    rules: {
      min: 1,
      max: 1,
      maxFrom: 0,
      maxTo: 1,
      before: [],
      after: [
        'decision', 'fork', // control
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      onAdd: (m, p) => {
        if(p && p.filter(v => v.type=='start').length) return MSG.oneStart;
      },
      onEdit: () => false,
      onSave: (m, p) => {
        const ret = [];
        p && p.filter(v => v.type=='start').length!=1 && ret.push(MSG.oneStart);
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret.join('\n');
      },
      onExecute: (m, p) => m.rules.onSave(m, p)
    }
  },
  end: {
    markup: '<image xlink:href="images/wd-end.svg" width="64" height="64"/>',
    props: {},
    rules: {
      min: 1,
      max: 1,
      maxFrom: Infinity, // ?
      maxTo: 0,
      before: [
        'decision', 'join', // control
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      after: [],
      onAdd: (m, p) => {
        if(p && p.filter(v => v.type=='end').length) return MSG.oneEnd;
      },
      onEdit: () => false,
      onSave: (m, p) => {
        const ret = [];
        p && p.filter(v => v.type=='start').length!=1 && ret.push(MSG.oneEnd);
        !m.prevActions.length && ret.push(MSG.noPrev(m));
        return ret.join('\n');
      },
      onExecute: (m, p) => m.rules.onSave(m, p)
    }
  },
  kill: {
    markup: '<image xlink:href="images/wd-kill.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'message': 'error'
        }
      }
    },
    rules: {
      min: 0,
      max: Infinity,
      maxFrom: Infinity,
      maxTo: 0,
      before: [
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      after: [],
      onEdit: () => false,
      onSave: m => !m.prevActions.length && MSG.noPrev(m),
      onExecute: m => m.rules.onSave(m)
    }
  },
  decision: {
    markup: '<image xlink:href="images/wd-decision.svg" width="64" height="64"/>',
    props: {},
    rules: {
      min: 0,
      max: Infinity,
      maxFrom: 1,
      maxTo: Infinity,
      before: [
        'start', 'decision', 'fork', 'join', // control
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      after: [
        'end', 'decision', 'fork', 'join', // control
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      onAdd: () => false,
      onEdit: () => false,
      onSave: m => {
        const ret = [];
        !m.prevActions.length && ret.push(MSG.noPrev(m));
        m.nextActions.length<2 && ret.push(MSG.multiNext(m));
        return ret.join('\n');
      },
      onExecute: m => {
        const ret = [ m.rules.onSave(m) ];
        m.next.some(f => !(f.isLast || f.cond)) && ret.push(MSG.noCond(m));
        return ret.join('\n');
      }
    }
  },
  fork: {
    markup: '<image xlink:href="images/wd-fork.svg" width="64" height="64"/>',
    props: {},
    rules: {
      min: 0,
      max: Infinity,
      maxFrom: 1,
      maxTo: Infinity,
      before: [
        'start', 'decision', 'fork', 'join', // control
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      after: [
        'decision', 'fork', // control
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      onAdd: () => false,
      onEdit: () => false,
      onSave: m => {
        const ret = [];

        !m.prevActions.length && ret.push(MSG.noPrev(m));
        m.nextActions.length<2 && ret.push(MSG.multiNext(m));

        let join;
        (join = m.nextActions.filter(v => v && v.type=='join')).length && ret.push(MSG.directJoin(m, join));

        const drill = (m, d = 0) => {
          const candidate = [ ...new Set(m.nextActions.filter(n => n).map(n => {
            switch(n.type) {
              case 'fork':
                return drill(n, d+1);
              case 'join':
                return d? drill(n, d-1) : n.name;
              default:
                return drill(n, d);
            }
          })) ];

          return candidate.length==1? candidate[0] : '';
        };
        !drill(m) && ret.push(MSG.missJoin(m));

        return ret.join('\n');
      },
      onExecute: m => m.rules.onSave(m)
    }
  },
  join: {
    markup: '<image xlink:href="images/wd-join.svg" width="64" height="64"/>',
    props: {},
    rules: {
      min: 0,
      max: Infinity,
      maxFrom: Infinity,
      maxTo: 1,
      before: [
        'decision', 'join', // control
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      after: [
        'end', 'decision', 'fork', 'join', // control
        'map-reduce', 'pig', 'fs', 'ssh', 'sub-workflow', 'java', 'email', // 3.1.3
        'shell', 'hive', 'sqoop', // 3.2.0
        'distcp', 'spark', // 4.0.0
        'hive2' // 4.2.0
      ],
      onAdd: () => false,
      onEdit: () => false,
      onSave: m => {
        const ret = [];

        m.prevActions.length<2 && ret.push(MSG.multiPrev(m));
        !m.nextActions.length && ret.push(MSG.noNext(m));
        let fork;
        (fork = m.prevActions.filter(v => v && v.type=='fork')).length && ret.push(MSG.directJoin(fork, m));

        const drill = (m, d = 0) => {
          const candidate = [ ...new Set(m.prevActions.filter(p => p).map(p => {
            switch(p.type) {
              case 'fork':
                return d? drill(p, d-1) : p.name;
              case 'join':
                return drill(p, d+1);
              default:
                return drill(p, d);
            }
          })) ];

          return candidate.length==1? candidate[0] : '';
        };
        !drill(m) && ret.push(MSG.missFork(m));

        return ret.join('\n');
      },
      onExecute: m => m.rules.onSave(m)      
    }
  },

  'map-reduce': {
    markup: '<image xlink:href="images/wd-mapreduce.svg" width="64" height="64"/>',
    props: {      
      'general': {
        'mrType': {},
        'configuration': [],
        'file': []
      },
      'advanced': {
        'prepare': [],
        'archive': []
      }    
    },
    rules: ACTION_RULES
  },
  pig: {
    markup: '<image xlink:href="images/wd-pig.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'script': ''
        }
      },
      'advanced': {
        'prepare': [],
        'argument': [],
        'param': [],
        'configuration': [],
        'file': [],
        'archive': []
      }
    },
    rules: ACTION_RULES
  },
  fs: {
    markup: '<image xlink:href="images/wd-fs.svg" width="64" height="64"/>',
    props: {
      'general': {
        'command': [],
        'configuration': []
      }
    },
    rules: ACTION_RULES
  },
  ssh: {
    markup: '<image xlink:href="images/wd-ssh.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'host': '',
          'command': '',
          'capture-output': false
        },
        'args': []
      }
    },
    rules: ACTION_RULES
  },
  'sub-workflow': {
    markup: '<image xlink:href="images/wd-sub-workflow.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'app-path': '',
          'propagate-configuration': false
        },
        'configuration': []
      }
    },
    rules: ACTION_RULES
  },
  java: {
    markup: '<image xlink:href="images/wd-java.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'main-class': '',
          'java-opts': '',
          'capture-output': false
        }
      },
      'advanced': {
        'prepare': [],
        'arg': [],
        'configuration': [],
        'file': [],
        'archive': []
      }
    },
    rules: ACTION_RULES
  },
  email: {
    markup: '<image xlink:href="images/wd-email.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'to': '',
          'cc': '',
          'subject': '',
          'body': '',
          'content_type': ''
        }
      }
    },
    rules: ACTION_RULES
  },
  shell: {
    markup: '<image xlink:href="images/wd-shell.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'capture-output': false,
          'exec': ''
        },
        'file': [],
        'env-var': [],
        'argument': []
      },
      'advanced': {
        'prepare': [],
	      'configuration': [],
	      'archive': []
      }
    },
    rules: ACTION_RULES
  },
  hive: {
    markup: '<image xlink:href="images/wd-hive.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'hiveOption': 'script'
        },
        'script': {
          'script': ''
        }
      },
      'advanced': {
        'prepare': [],
        'argument': [],
        'param': [],
        'configuration': [],
        'file': [],
        'archive': []
      }
    },
    rules: ACTION_RULES
  },
  hive2: {
    markup: '<image xlink:href="images/wd-hive2.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'jdbc-url': '',
          'password': '',
          'hiveOption': 'script'
        },
        'script': {
          'script': ''
        }
      },
      'advanced': {
        'prepare': [],
        'argument': [],
        'param': [],
        'configuration': [],
        'file': [],
        'archive': []
      },
    },
    rules: ACTION_RULES
  },
  sqoop: {
    markup: '<image xlink:href="images/wd-sqoop.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'command': ''
        }
      },
      'advanced': {
        'prepare': [],
        'configuration': [],
        'file': [],
        'archive': []
      }
    },
    rules: ACTION_RULES
  },
  distcp: {
    markup: '<image xlink:href="images/wd-dist-cp.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'java-opts': ''
        },
        'arg': []
      },
      'advanced': {
        'prepare': [],
        'configuration': []
      }
    },
    rules: ACTION_RULES
  },
  spark: {
    markup: '<image xlink:href="images/wd-spark.svg" width="64" height="64"/>',
    props: {
      'general': {
        'config': {
          'name': '',
          'jar': '',
          'class': '',
          'master': 'yarn-cluster'
        }
      },
      'option': {
        'args': [],
        'option': {
          'spark-opts': '',
          'mode': ''
        }
      },
      'advanced': {
        'prepare': [],
        'configuration': [],
        'file': [],
        'archive': []
      }
    },
    rules: ACTION_RULES
  }
};