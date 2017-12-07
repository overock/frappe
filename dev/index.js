import Frappe from '../js/frappe.js';
import Node from '../js/model/node.js';

//let frappe = new Frappe(document.getElementById('test-canvas'));
const frappe = new Frappe(document.body);
document.body.style.backgroundColor = '#777';
    
// for demo
let $f = window.$f = frappe;
window.Node = Node;

window.$x = frappe.pool.export;

let equals = window.equals = (src, tar, excKey = [], bType) => {
  if(src===tar) return true;
  switch(true) {
    case src instanceof Array:
      if(src.length != tar.length) {
        console.log('배열 길이가 달라요', src, tar);
        return false;
      } 
      const retArr = src.every((e, i) => equals(e, tar[i], excKey, bType));
      if(!retArr) {
        console.log('객체가 달라요', src, tar);
      }
      return retArr;
    
    case src instanceof Object:
      const srcKey = Object.keys(src).filter(k => excKey.indexOf(k)==-1),
            tarKey = Object.keys(tar).filter(k => excKey.indexOf(k)==-1);

      if(srcKey.length != tarKey.length) {
        console.log('객체 키가 안 맞아요', src, tar);
        return false;      
      }
      const retObj = srcKey.every(k => equals(src[k], tar[k], excKey, bType));
      retObj || console.log('객체가 달라요', src, tar);
      return retObj;

    default:
      const retVal = bType? src === tar : src == tar;
      retVal || console.log('값이 달라요', src, tar);
      return retVal;
  }
};

let eq=(src, tar) => {
  return src.every(action => {
    const type = action.type,
          targetAction = tar.find(t => t.type==type);
    
    return equals(action.props, targetAction.props);
    
  });
};

const startDemo = () => {
    // just 4 test
    const start = frappe.add('start', 100, 100),
    end = frappe.add('end', 100, 800),
    kill = frappe.add('kill', 500, 300);
    const pig = frappe.add('pig', 200, 200);
    pig.props = {
        "@name": "pig",
        "general": {
            "config": {
                "script": "/test/pig_test/test.pig"
            }
        },
        "advanced": {
            "prepare": [
                {
                    "key": "mkdir",
                    "values": {
                        "path": "/test/pig_test"
                    }
                },
                {
                    "key": "delete",
                    "values": {
                        "path": "/test/pig_test/test.log",
                        "skip-trash": "true"
                    }
                }
            ],
            "file": [
                "/test/pig_test/test.file"
            ],
            "archive": [
                "/test/pig_test/test.archive"
            ],
            "argument": [
                "-param",
                "data=mydata"
            ],
            "param": [
                "data=mydata"
            ],
            "configuration":[
              {
                "name":"key",
                "value":"value"
              }
            ]
        }
      }
    // const hive = frappe.add('hive', 200, 200);
    // hive.props = {
    //     "name": "hive",
    //     "general": {
    //       "config": {
    //         "hiveOption": "script"
    //       },
    //       "script": {
    //         "script": "myscript.q"    //script or query
    //       }
    //     },
    //     "advanced": {
    //       "prepare": [
    //         {
    //           "key": "mkdir",
    //           "values": {
    //             "path": "hdfs://foo:8020/usr/tucu/temp-data_folder2"
    //           }
    //         }
    //       ],
    //       "argument": [
    //         "argument1"
    //       ],
    //       "param": [
    //         "InputDir=/home/tucu/input-data",
    //         "OutputDir=${jobOutput}"
    //       ],
    //       "configuration": [
    //         {
    //           "name": "mapred.compress.map.output",
    //           "value": "true"
    //         }
    //       ],
    //       "file": [
    //         "name.file"
    //       ],
    //       "archive": [
    //         "name.archive"
    //       ]
    //     }
    //   };
    //   const email = frappe.add('email', 200, 300);
    //   email.props = {
    //     'name' : 'email',
    //     "general": {
    //       "config": {
    //         "to": "guest@exem.com",
    //         "cc": "admin@exem.com",
    //         "subject": "title",
    //         "body": "<html>...</html>",
    //         "content_type": "text/html"
    //       }
    //     }
    //   };
    //   const mr = frappe.add('map-reduce', 200, 500);
    //   mr.props = {
    //     "name"  : "mr",
    //     "general": {
    //       "configuration": [
    //         {
    //           "name": "mapred.mapper.class",
    //           "value": "ExampleMapperClass"
    //         },
    //         {
    //           "name": "mapred.reduce.class",
    //           "value": "ExampleReduceClass"
    //         },
    //         {
    //           "name": "mapred.input.dir",
    //           "value": "input/dir"
    //         },
    //         {
    //           "name": "mapred.output.dir",
    //           "value": "output/dir"
    //         },
    //         {
    //           "name": "mapred.map.tasks",
    //           "value": "2"
    //         }
    //       ]
    //     },
    //     "advanced": {
    //       "prepare": [
    //         {
    //           "key": "mkdir",
    //           "values": {
    //             "path": "/newdir"
    //           }
    //         },
    //         {
    //           "key": "delete",
    //           "values": {
    //             "path": "delete/path",
    //             "skip-trash": "true"
    //           }
    //         }
    //       ],
    //       "file": [
    //         "new.file"
    //       ],
    //       "archive": [
    //         "new.archive"
    //       ]
    //     }
    //   };
    //   const java = frappe.add('java', 200, 600);
    //   java.props = {
    //     "name"  : "java",
    //     "general": {
    //       "config": {
    //         "main-class": "ExampleClass",
    //         "java-opts": "-Dblah",
    //         "capture-output": true
    //       }
    //     },
    //     "advanced": {
    //       "prepare": [
    //         {
    //           "key": "mkdir",
    //           "values": {
    //             "path": "new/dir"
    //           }
    //         }
    //       ],
    //       "arg": [
    //         "argument1"
    //       ],
    //       "configuration": [
    //         {
    //           "name": "key",
    //           "value": "value"
    //         }
    //       ],
    //       "file": [
    //         "name.file"
    //       ],
    //       "archive": [
    //         "name.archive"
    //       ]
    //     }
    //   };
      const fs = frappe.add('fs', 200, 300);
      fs.props = {
        "name": "hdfscommands",
        "general": {
            "command": [
                {
                    "key": "delete",
                    "values": {
                        "path": "hdfs://foo:8020/usr/tucu/temp-data",
                        "skip-trash": "true"
                    }
                },
                {
                    "key": "mkdir",
                    "values": {
                        "path": "hdfs://foo:8020/usr/tucu/temp-data_folder"
                    }
                },
                {
                    "key": "mkdir",
                    "values": {
                        "path": "hdfs://foo:8020/usr/tucu/temp-data_folder2"
                    }
                },           
                {
                    "key": "move",
                    "values": {
                        "source": "hdfs://foo:8020/usr/tucu/temp-data1",
                        "target": "hdfs://foo:8020/usr/tucu/temp-data2"
                    }
                },
                {
                    "key": "chmod",
                    "values": {
                        "path": "hdfs://foo:8020/usr/tucu/temp-data",
                        "permissions.owner.read": "4",
                        "permissions.owner.write": "2",
                        "permissions.owner.execute": "1",
                        "permissions.group.read": "4",
                        "permissions.group.execute": "1",
                        "dir-files": "true",
                        "recursive": true // recursive가 true 일 때 는 "recursive": "" 로 컨버팅                   
                    }
                },
                {
                    "key": "touchz",
                    "values": {
                        "path": "hdfs://foo:8020/usr/tucu/temp-data3"
                    }
                },
                {
                    "key": "chgrp",
                    "values": {
                        "path": "hdfs://foo:8020/usr/tucu/temp-data3",
                        "group": "testgroup",
                        "dir-files": "true",
                        "recursive": false // recursive가 false 일 때 는 필드 삭제
                         
                    }
                }
            ],
            "configuration":[
              {
                "name":"key",
                "value":"value"
              }
            ]
        }
      }

      // const shell = frappe.add('shell', 200, 500);
      // shell.props = {
      //   "name": 'shell',
      //   "general": {
      //     "config": {
      //       "capture-output": true,
      //       "execOption": "script"
      //     },
      //     "exec": {
      //       "exec": "./script.sh"
      //     }
      //   },
      //   "advanced": {
      //     "env-var":["var1","var2"],
      //     "prepare": [
      //       {
      //         "key": "mkdir",
      //         "values": {
      //           "path": "hdfs://foo:8020/usr/tucu/temp-data_folder2"
      //         }
      //       }
      //     ],
      //     "argument": [
      //       "argument1"
      //     ],
      //     "configuration": [
      //       {
      //         "name": "key",
      //         "value": "value"
      //       }
      //     ],
      //     "file": [
      //       "name.file"
      //     ],
      //     "archive": [
      //       "name.archive"
      //     ]
      //   }
      // }

      // const spark = frappe.add('spark', 200, 600);
      // spark.props = {
      //   "name": "spark",
      //   "general": {
      //     "config": {
      //       "name": "SparkTestApp",
      //       "jar": "sparkTestApp.jar",
      //       "class": "org.apache.spark.examples.SparkTest",
      //       "master": "yarn-cluster"
      //     }
      //   },
      //   "option": {
      //     "args": [
      //       "inputpath=hdfs://localhost/input/text/test.txt"
      //     ],
      //     "option": {
      //       "spark-opts": "--executor-memory 20G",
      //       "mode": "cluster"
      //     }
      //   },
      //   "advanced": {
      //     "prepare": [
      //       {
      //         "key": "mkdir",
      //         "values": {
      //           "path": "./new"
      //         }
      //       }
      //     ],
      //     "configuration": [
      //       {
      //         "name": "key",
      //         "value": "value"
      //       }
      //     ],
      //     "file": [
      //       "new.file"
      //     ],
      //     "archive": [
      //       "new.archive"
      //     ]
      //   }
      // }


      
      // const ssh = frappe.add('ssh', 200, 700);
      // ssh.props = {
      //   "name": "ssh",
      //   "general": {
      //       "config": {
      //           "host": "foo@bar.com",
      //           "command": "uploaddata",
      //           "argument": [
      //               "jdbc:derby://bar.com:1527/myDB",
      //               "hdfs://foobar.com:8020/usr/tucu/myData"
      //           ],
      //           "capture-output": true // recursive가 true 일 때 는 "recursive": "" 로 컨버팅, false 일 때는 삭제
      //       }
      //   }
      // }

      // const fork = frappe.add('fork', 300, 700);
      // const join = frappe.add('join', 300, 600);
      // const decision = frappe.add('decision', 300, 500);
      // frappe.link(hive, fork);
      // frappe.link(fork, fs);
      // frappe.link(fork, spark);
      // frappe.link(fs, join);
      // frappe.link(spark, join);
      // frappe.link(join, ssh);



      /***************** */
      window.test = () => {
        const oldModel = $f.pool.container.slice();

        console.log('original: ', oldModel);
        let exp = $f.export(), imp = $f.import(exp);
        //      console.log(JSON.stringify(exp));
          console.log('export: ', exp);
          console.log('import: ', $f.pool.container);
        //console.log('diff: ', eq(oldModel, $f.pool.container
        //     , ['uuid', 'renderer'], false));
      };
};

startDemo();
test();
frappe.subscribe('frappe.edit', e => alert(e.detail.uuid));