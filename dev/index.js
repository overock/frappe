import Frappe from '../js/frappe.js';
import Node from '../js/model/node.js';

//let frappe = new Frappe(document.getElementById('test-canvas'));
const frappe = new Frappe(document.body);
document.body.style.backgroundColor = '#777';
    
// for demo
window.$f = frappe;
window.Node = Node;

window.$x = frappe.pool.export;

const startDemo = () => {
    // just 4 test
    const start = frappe.add('start', 100, 100),
    end = frappe.add('end', 100, 800),
    kill = frappe.add('kill', 500, 300);
    const hive = frappe.add('hive', 200, 200);
    hive.props = {
        "name": "hive",
        "general": {
          "config": {
            "hiveOption": "script"
          },
          "script": {
            "script": "myscript.q"    //script or query
          }
        },
        "advanced": {
          "prepare": [
            {
              "key": "mkdir",
              "values": {
                "path": "hdfs://foo:8020/usr/tucu/temp-data_folder2"
              }
            }
          ],
          "argument": [
            "argument1"
          ],
          "param": [
            "InputDir=/home/tucu/input-data",
            "OutputDir=${jobOutput}"
          ],
          "configuration": [
            {
              "name": "mapred.compress.map.output",
              "value": "true"
            }
          ],
          "file": [
            "name.file"
          ],
          "archive": [
            "name.archive"
          ]
        }
      };

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
                        "permissions.group.write": "2",
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

      const shell = frappe.add('shell', 200, 500);
      shell.props = {
        "name": 'shell',
        "general": {
          "config": {
            "capture-output": true,
            "execOption": "script"
          },
          "exec": {
            "exec": "./script.sh"
          }
        },
        "advanced": {
          "env-var":["var1","var2"],
          "prepare": [
            {
              "key": "mkdir",
              "values": {
                "path": "hdfs://foo:8020/usr/tucu/temp-data_folder2"
              }
            }
          ],
          "argument": [
            "argument1"
          ],
          "configuration": [
            {
              "name": "key",
              "value": "value"
            }
          ],
          "file": [
            "name.file"
          ],
          "archive": [
            "name.archive"
          ]
        }
      }

      const spark = frappe.add('spark', 200, 600);
      spark.props = {
        "name": "spark",
        "general": {
          "config": {
            "name": "SparkTestApp",
            "jar": "sparkTestApp.jar",
            "class": "org.apache.spark.examples.SparkTest",
            "master": "yarn-cluster"
          }
        },
        "option": {
          "args": [
            "inputpath=hdfs://localhost/input/text/test.txt"
          ],
          "option": {
            "spark-opts": "--executor-memory 20G",
            "mode": "cluster"
          }
        },
        "advanced": {
          "prepare": [
            {
              "key": "mkdir",
              "values": {
                "path": "./new"
              }
            }
          ],
          "configuration": [
            {
              "name": "key",
              "value": "value"
            }
          ],
          "file": [
            "new.file"
          ],
          "archive": [
            "new.archive"
          ]
        }
      }


      frappe.link(hive, fs);





      /***************** */
      console.log(JSON.stringify($f.pool.export()));
};

startDemo();

frappe.subscribe('frappe.edit', e => alert(e.detail.uuid));