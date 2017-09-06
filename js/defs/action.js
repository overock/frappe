// TODO : class="frappe-action"은 action.js에서 addClass해버릴까
// ['start', 'end', 'kill', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
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
            before: [],
            after: ['end', 'pig', 'fs', 'sub-workflow', 'java']
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
            before: ['start', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: []
        }
    },
    kill: {
        markup: '<image class="frappe-action" data-actiontype="kill" xlink:href="images/wd-kill.png" width="64" height="64"/>',
        props: { 'message': 'default error' },
        rules: {
            maxFrom: -1,
            maxNext: 0,
            before: ['map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: []
        }
    },
    fork: {
        markup: '<image class="frappe-action" data-actiontype="fork" xlink:href="images/wd-fork.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: -1,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    join: {
        markup: '<image class="frappe-action" data-actiontype="join" xlink:href="images/wd-join.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: -1,
            maxNext: 1,
            before: [/*'decision', */'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },

    'map-reduce': {
        markup: '<image class="frappe-action" data-actiontype="map-reduce" xlink:href="images/wd-mapreduce.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    pig: {
        markup: '<image class="frappe-action" data-actiontype="pig" xlink:href="images/wd-pig.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    fs: {
        markup: '<image class="frappe-action" data-actiontype="fs" xlink:href="images/wd-fs.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    'sub-workflow': {
        markup: '<image class="frappe-action" data-actiontype="sub-workflow" xlink:href="images/wd-sub-workflow.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
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
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    spark: {
        markup: '<image class="frappe-action" data-actiontype="spark" xlink:href="images/wd-spark.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    hive: {
        markup: '<image class="frappe-action" data-actiontype="hive" xlink:href="images/wd-hive.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    
    
};