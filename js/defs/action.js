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
  noCond: m => `There's on or more missing condition(s) in decision node ${m.name}!`,
  directJoin: (f, j) => `Cannot connect ${f.name} and ${j.name} directly!`,
  missFork: m => `${m.name} must follow one and only one fork node!`,
  missJoin: m => `${m.name} must reach one and only one join node!`,
  noParam: (m, k) => `${m.name} must contain value for key ${k}!`
};

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
        if(p.filter(v => v.type=='start').length) return MSG.oneStart;
      },
      onEdit: () => false,
      onSave: (m, p) => {
        const ret = [];
        p.filter(v => v.type=='start').length!=1 && ret.push(MSG.oneStart);
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: (m, p) => this.onSave(m, p)
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
        if(p.filter(v => v.type=='end').length) return MSG.oneEnd;
      },
      onEdit: () => false,
      onSave: (m, p) => {
        const ret = [];
        p.filter(v => v.type=='start').length!=1 && ret.push(MSG.oneEnd);
        !m.prevActions.length && ret.push(MSG.noPrev(m));
        return ret;
      },
      onExecute: (m, p) => this.onSave(m, p)
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
      onExecute: m => this.onSave(m)
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
        m.prevAction.length<2 && ret.push(MSG.multiNext(m));
      },
      onExecute: m => {
        const ret = [];
        ret.push(this.onSave(m));
        m.next.some(f => !(f.isLast || f.pred)) && ret.push(this.noCond(m));
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
        'end', 'decision', 'fork', // control
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
        (join = m.nextActions.filter(v => v.type='join')).length && ret.push(MSG.directJoin(m, join));
        
        const drill = (m, d=1) => m.nextActions.reduce((r, n) => {
                switch(n.type) {
                  case 'fork':  r = merge(r, drill(n, d+1));                break;
                  case 'join':  r = merge(r, d==1? n.name : drill(n, d-1)); break;
                  default:      r = merge(r, drill(n, d));
                }
              }, undefined),
              merge = (s, t) => t===undefined || s==t? s : s===undefined? t : null;
        !drill(m) && ret.push(MSG.missJoin(m));

        return ret;
      },
      onExecute: m => this.onSave(m)
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
        //let fork;
        //(fork = m.prevActions.filter(v => v.type='fork')).length && ret.push(MSG.directJoin(fork, m));

        const drill = (m, d=1) => m.prevActions.reduce((r, p) => {
                switch(p.type) {
                  case 'fork':  r = merge(r, d==1? p.name : drill(p, d-1)); break;
                  case 'join':  r = merge(r, drill(p, d+1));                break;
                  default:      r = merge(r, drill(p, d));
                }
              }, undefined),
              merge = (s, t) => t===undefined || s==t? s : s===undefined? t : null;
        !drill(m) && ret.push(MSG.missFork(m));

        return ret;
      },
      onExecute: m => this.onSave(m)      
    }
  },

  'map-reduce': {
    markup: '<image xlink:href="images/wd-mapreduce.svg" width="64" height="64"/>',
    props: {      
      'general': {
        'configuration': []
      },
      'advanced': {
        'prepare': [],
        'file': [],
        'archive': []
      }    
    },
    rules: {
      min: 0,
      max: Infinity,
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
      ]
    },
    onAdd: () => false,
    onEdit: () => false,
    onSave: m => {
      const ret = [];
      !m.prevActions.length && ret.push(MSG.noPrev(m));
      !m.nextActions.length && ret.push(MSG.noNext(m));
      return ret;
    },
    onExecute: m => {
      const ret = this.onSave(m);
      // mandatory field
      return ret;
    }
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
    rules: {
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
      ]
    },
    onAdd: () => false,
    onEdit: () => false,
    onSave: m => {
      const ret = [];
      !m.prevActions.length && ret.push(MSG.noPrev(m));
      !m.nextActions.length && ret.push(MSG.noNext(m));
      return ret;
    },
    onExecute: m => {
      const ret = this.onSave(m);
      // mandatory field
      return ret;
    }
  },
  fs: {
    markup: '<image xlink:href="images/wd-fs.svg" width="64" height="64"/>',
    props: {
      'general': {
        'command': [],
        'configuration': []
      }
    },
    rules: {
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
      ]
    },
    onAdd: () => false,
    onEdit: () => false,
    onSave: m => {
      const ret = [];
      !m.prevActions.length && ret.push(MSG.noPrev(m));
      !m.nextActions.length && ret.push(MSG.noNext(m));
      return ret;
    },
    onExecute: m => {
      const ret = this.onSave(m);
      // mandatory field
      return ret;
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
      onAdd: () => false,
      onEdit: () => false,
      onSave: m => {
        const ret = [];
        !m.prevActions.length && ret.push(MSG.noPrev(m));
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    },
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
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
    rules: {
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
        !m.nextActions.length && ret.push(MSG.noNext(m));
        return ret;
      },
      onExecute: m => {
        const ret = this.onSave(m);
        // mandatory field
        return ret;
      }
    }
  }
};