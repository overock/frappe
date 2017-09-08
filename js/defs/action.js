// TODO : class="frappe-action"은 action.js에서 addClass해버릴까
// ['start', 'end', 'kill', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
export default {
    ghost: {
        markup: '<rect width="64" height="64" rx="12" ry="12"/>',
        props: {},
        rules: {}
    },
    start: {
        markup: '<image data-actiontype="start" xlink:href="images/wd-start.png" width="40" height="40"/>',
        width: 40,
        height: 40,
        props: {},
        rules: {
            min: 1,
            max: 1,
            maxFrom: 0,
            maxNext: 1,
            before: [],
            after: ['end', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    end: {
        markup: '<image data-actiontype="end" xlink:href="images/wd-end.png" width="40" height="40"/>',
        width: 40,
        height: 40,
        props: {},
        rules: {
            min: 1,
            max: 1,
            maxFrom: 1, // ?
            maxNext: 0,
            before: ['start', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: []
        }
    },
    kill: {
        markup: '<image data-actiontype="kill" xlink:href="images/wd-kill.png" width="64" height="64"/>',
        props: { 'message': 'default error' },
        rules: {
            min: 0,
            max: -1,
            maxFrom: -1,
            maxNext: 0,
            before: ['map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: []
        }
    },
    fork: {
        markup: '<image data-actiontype="fork" xlink:href="images/wd-fork.png" width="64" height="64"/>',
        props: {},
        rules: {
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    join: {
        markup: '<image data-actiontype="join" xlink:href="images/wd-join.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: -1,
            maxNext: 1,
            before: [/*'decision', */'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },

    'map-reduce': {
        markup: '<image data-actiontype="map-reduce" xlink:href="images/wd-mapreduce.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    pig: {
        markup: '<image data-actiontype="pig" xlink:href="images/wd-pig.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    fs: {
        markup: '<image data-actiontype="fs" xlink:href="images/wd-fs.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    'sub-workflow': {
        markup: '<image data-actiontype="sub-workflow" xlink:href="images/wd-sub-workflow.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    // streaming: {
    //     markup: '<image xlink:href="images/wd-fs.png" width="64" height="64"/>',
    //     props: {},
    //     rules: {}
    // },
    java: {
        markup: '<image data-actiontype="java" xlink:href="images/wd-java.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    spark: {
        markup: '<image data-actiontype="spark" xlink:href="images/wd-spark.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    hive: {
        markup: '<image data-actiontype="hive" xlink:href="images/wd-hive.png" width="64" height="64"/>',
        props: {},
        rules: {
            maxFrom: 1,
            maxNext: 2,
            before: ['start', 'decision', 'fork', 'join', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java'],
            after: ['end', 'kill', 'fork', 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java']
        }
    },
    
    
};