// TODO : class="frappe-action"은 action.js에서 addClass해버릴까
// TODO : filesystem -> fs
// TODO : subworkflow -> sub-workflow
// TODO : mapreduce -> map-reduce
export default {
    ghost: {
        markup: '<rect class="frappe-action" width="64" height="64" rx="12" ry="12"/>',
        props: {},
        rules: {}
    },
    start: {
        markup: '<image class="frappe-action" data-actiontype="start" xlink:href="images/wd-start.png" width="40" height="40"/>',
        width: 40,
        height: 40,
        props: {},
        rules: {
            maxFrom: 0,
            maxNext: 1,
            noFrom: [],
            noTo: ['kill']
        }
    },
    end: {
        markup: '<image class="frappe-action" data-actiontype="end" xlink:href="images/wd-end.png" width="40" height="40"/>',
        width: 40,
        height: 40,
        props: {},
        rules: {
            maxFrom: 1, // ?
            maxNext: 0,
            noFrom: ['start'],
            noTo: []
        }
    },
    kill: {
        markup: '<image class="frappe-action" data-actiontype="kill" xlink:href="images/wd-kill.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: -1,
            maxNext: 0,
            noFrom: ['start', 'decision', 'fork', 'join'],
            noTo: []
        }
    },
    fork: {
        markup: '<image class="frappe-action" data-actiontype="fork" xlink:href="images/wd-fork.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1, // ?
            maxNext: -1,
            noFrom: [],
            noTo: ['kill', 'end']
        }
    },
    join: {
        markup: '<image class="frappe-action" data-actiontype="join" xlink:href="images/wd-join.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: -1, // ?
            maxNext: 1,
            noFrom: ['start'],
            noTo: ['kill']
        }
    },

    'map-reduce': {
        markup: '<image class="frappe-action" data-actiontype="map-reduce" xlink:href="images/wd-mapreduce.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            noFrom: [],
            noTo: []
        }
    },
    pig: {
        markup: '<image class="frappe-action" data-actiontype="pig" xlink:href="images/wd-pig.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            noFrom: [],
            noTo: []
        }
    },
    fs: {
        markup: '<image class="frappe-action" data-actiontype="fs" xlink:href="images/wd-fs.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            noFrom: [],
            noTo: []
        }
    },
    'sub-workflow': {
        markup: '<image class="frappe-action" data-actiontype="sub-workflow" xlink:href="images/wd-sub-workflow.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            noFrom: [],
            noTo: []
        }
    },
    // streaming: {
    //     markup: '<image class="frappe-action" xlink:href="images/wd-fs.png" width="64" height="64"/>',
    //     props: {},
    //     rules: {}
    // },
    java: {
        markup: '<image class="frappe-action" data-actiontype="java" xlink:href="images/wd-java.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            noFrom: [],
            noTo: []
        }
    },
    spark: {
        markup: '<image class="frappe-action" data-actiontype="spark" xlink:href="images/wd-spark.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            noFrom: [],
            noTo: []
        }
    },
    hive: {
        markup: '<image class="frappe-action" data-actiontype="hive" xlink:href="images/wd-hive.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            noFrom: [],
            noTo: []
        }
    },
    
    
};